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

async function tapBlackbaud ({ subscriptionKey, token }) {
  const blackbaud = require('../lib/api')({ subscriptionKey, token })

  // output roles
  const { value: roles } = await blackbaud.get('roles')

  writeSchema('roles', ['id'], {
    id: { type: 'integer' }
  })
  roles.forEach(role => writeRecord('roles', role))
}

// exports
module.exports = tapBlackbaud
