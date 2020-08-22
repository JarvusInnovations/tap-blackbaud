#!/usr/bin/env node

const fs = require('fs')
const tapBlackbaudSchool = require('../lib/tapBlackbaudSchool')

const {
  argv: {
    config: { subscriptionKey, token }
    // state,
    // catalog
  }
} = require('yargs')
  .option('config', {
    type: 'string',
    demandOption: true,
    coerce: jsonPath => jsonPath
      ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
      : null
  })
  // .option('state', {
  //   type: 'string',
  //   coerce: jsonPath => jsonPath
  //     ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  //     : null
  // })
  // .option('catalog', {
  //   type: 'string',
  //   coerce: jsonPath => jsonPath
  //     ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  //     : null
  // })

tapBlackbaudSchool({ subscriptionKey, token })
