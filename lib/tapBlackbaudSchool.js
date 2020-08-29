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
}, state, { streams }) {
  const blackbaud = require('./api')({ subscriptionKey, token })

  // compile selected paths
  const selectedPaths = new Map()

  for (const { stream, metadata: streamMetadata = [] } of streams) {
    for (const { breadcrumb = [], metadata: { selected = false } } of streamMetadata) {
      breadcrumb.unshift(stream)
      selectedPaths.set(breadcrumb.join('/'), selected)
    }
  }

  // collect roles
  if (selectedPaths.get('roles') !== false) {
    writeSchema('roles', ['id'], {
      id: { type: 'integer' }
    })

    const roles = await blackbaud.paginate('roles')
    for await (const role of roles) {
      writeRecord('roles', role)
    }
  }

  // collect terms
  if (selectedPaths.get('terms') !== false) {
    writeSchema('terms', ['level_id', 'id'], {
      id: { type: 'integer' },
      level_: { type: 'integer' }
    })

    for (const schoolYear of schoolYears) {
      const terms = await blackbaud.paginate('terms', {
        searchParams: {
          school_year: schoolYear
        }
      })

      for await (const term of terms) {
        writeRecord('terms', term)
      }
    }
  }

  // collect levels
  if (selectedPaths.get('levels') !== false) {
    writeSchema('levels', ['id'], {
      id: { type: 'integer' }
    })

    const levels = await blackbaud.paginate('levels')
    for await (const level of levels) {
      writeRecord('levels', level)
    }
  }

  // collect users
  const userIds = []

  if (selectedPaths.get('users') !== false) {
    writeSchema('users', ['id'], {
      id: { type: 'integer' }
    })

    const users = await blackbaud.paginate('users/extended', {
      searchParams: { base_role_ids: 1 }
    })

    for await (const user of users) {
      writeRecord('users', user)
      userIds.push(user.id)
    }
  }

  // collect sections
  if (selectedPaths.get('sections') !== false) {
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
  }

  // collect enrollments
  if (selectedPaths.get('enrollments') !== false && userIds.length > 0) {
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
}

// exports
module.exports = tapBlackbaudSchool
