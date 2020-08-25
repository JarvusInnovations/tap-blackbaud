// dependencies

// library
function writeSchema (stream, keyProperties, properties) {
  console.log(JSON.stringify({
    type: 'SCHEMA',
    stream,
    schema: { properties },
    key_properties: keyProperties
  }))
}

function writeRecord (stream, record) {
  console.log(JSON.stringify({
    type: 'RECORD',
    stream,
    record
  }))
}

// function writeState (value) {
//   console.log(JSON.stringify({
//     type: 'STATE',
//     value
//   }))
// }

async function tapBlackbaudSchool ({
  subscription_key: subscriptionKey,
  token,
  school_years: schoolYears = [undefined],
  sections: sectionSearchParams = {}
}) {
  const blackbaud = require('./api')({ subscriptionKey, token })

  // output and collect roles
  const roleIds = []

  writeSchema('roles', ['id'], {
    id: { type: 'integer' }
  })

  const roles = await blackbaud.paginate('roles')
  for await (const role of roles) {
    writeRecord('roles', role)
    roleIds.push(role.id)
  }

  // output and collect levels
  const levelIds = []

  writeSchema('levels', ['id'], {
    id: { type: 'integer' }
  })

  const levels = await blackbaud.paginate('levels')
  for await (const level of levels) {
    writeRecord('levels', level)
    levelIds.push(level.id)
  }

  // output and collect users
  const userIds = []

  writeSchema('users', ['id'], {
    id: { type: 'integer' }
  })

  const users = await blackbaud.paginate('users', {
    searchParams: { roles: roleIds.join(',') }
  })

  for await (const user of users) {
    writeRecord('users', user)
    userIds.push(user.id)
  }

  // output sections
  writeSchema('sections', ['id'], {
    id: { type: 'integer' }
  })

  for (const schoolYear of schoolYears) {
    const sections = await blackbaud.paginate('academics/sections', {
      searchParams: {
        ...sectionSearchParams,
        school_year: schoolYear
      }
    })

    for await (const section of sections) {
      writeRecord('sections', section)
    }
  }

  // output enrollments
  writeSchema('enrollments', ['id', 'user_id'], {
    id: { type: 'integer' },
    user_id: { type: 'integer' } // appended client-side
  })

  for (const schoolYear of schoolYears) {
    for (const userId of userIds) {
      const enrollments = await blackbaud.paginate(`academics/enrollments/${userId}`, {
        searchParams: { school_year: schoolYear }
      })

      for await (const enrollment of enrollments) {
        writeRecord('enrollments', { ...enrollment, user_id: userId })
      }
    }
  }
}

// exports
module.exports = tapBlackbaudSchool
