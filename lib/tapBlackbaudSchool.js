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

async function tapBlackbaudSchool ({ subscriptionKey, token }) {
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

  // output users
  writeSchema('users', ['id'], {
    id: { type: 'integer' }
  })

  const users = await blackbaud.paginate('users', {
    searchParams: { roles: roleIds.join(',') }
  })

  for await (const user of users) {
    writeRecord('users', user)
  }
}

// exports
module.exports = tapBlackbaudSchool
