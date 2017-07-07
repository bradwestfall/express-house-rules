import express from 'express'
import { registerHouseRules } from '../src'
import houseRulesSchema from './house-rules-schema'

const app = express()

registerHouseRules(houseRulesSchema)

const routes = require('./routes')
app.use('/', routes)

app.listen(3030, function () {
  console.log('Example app listening on port 3030!')
})
