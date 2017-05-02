import { Schema } from 'house-rules'

// Keep the house rules. Note that register needs to be called before any other method
var houseRulesSchema = null
const registerHouseRules = schema => {
  houseRulesSchema = schema
}

// Creactes a schema based on the rules passed
const createSchema = fields => {

  if (houseRulesSchema === null) throw new Error('Must call `registerHouseRules()` method before using other API methods.')

  if (Array.isArray(fields)) {
    const optionalFields = {}
    const requiredFields = {}

    // Isolate an array of fields to use for the sun schema and
    // create update objects for optional and required fields
    fields = fields.map(field => {
      const parts = field.split(':')
      if (parts.length === 2) {
        if (['o', 'opt', 'optional'].includes(parts[0])) optionalFields[parts[1]] = houseRulesSchema.field(parts[1]).optional()
        if (['r', 'req', 'required'].includes(parts[0])) requiredFields[parts[1]] = houseRulesSchema.field(parts[1]).required()
      }
      return parts[1] || parts[0]
    })

    // Create a sub-schema based on the fields
    const subSchema = houseRulesSchema.clone(fields)
    subSchema.update(optionalFields)
    subSchema.update(requiredFields)
    return subSchema

  } else if (fields instanceof Schema) {
    return fields
  }
}

const validParams = (...fields) => {
  return middleware(createSchema(fields), 'params')
}

const validQuery = (...fields) => {
  return middleware(createSchema(fields), 'query')
}

const validBody = (...fields) => {
  return middleware(createSchema(fields), 'body')
}

const middleware = (schema, requestPath) => {
  return (req, res, next) => {
    if (requestPath === 'body' && !req.body) {
      throw new Error('`req.body` is not set. This can happen if the request was not an HTTP POST request and/or if express\' body-parser module has not been setup.')
    }
    const values = req[requestPath] || {}
    const errors = schema.validate(values)
    if (Object.keys(errors).length === 0) {
      next()
    } else {
      res.status(400).json(errors)
    }
  }
}

export { registerHouseRules, validParams, validQuery, validBody }
