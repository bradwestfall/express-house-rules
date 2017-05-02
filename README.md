# express-house-rules

[![Build Status](https://travis-ci.org/bradwestfall/express-house-rules.svg?branch=master)](https://travis-ci.org/bradwestfall/express-house-rules)

Use https://github.com/bradwestfall/house-rules validation rules to validate incoming requests in Express.

## Install

```sh
npm install --save express-house-rules
```

## Example

Example `house-rules-schema.js` file:
```js
import { Is, Schema } from 'house-rules'

// Base Rule for IDs
const id = Is.numeric().positive().integer().required()

// Base Rule for Names (Allow Spaces)
const strict = false
const name = Is.string().alpha(strict).required()

const schema = new Schema({
  userId: id.label('User ID'),
  firstName: name.label('First Name'),
  lastName: name.label('Last Name'),
  email: Is.string().email().required(),
  password: Is.string().minLength(8).maxLength(100).required()
})
```

Example usage of `express-house-rules`:
```js
import express from 'express'
import { registerHouseRules, validQuery } from 'express-house-rules'
import houseRulesSchema from './house-rules-schema' // wherever your house rules are

const app = express()

// Register your house rules schema with express-house-rules
registerHouseRules(houseRulesSchema)

// A route which is not using input validation
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// A route which validates that the query has a `firstName` value and that it is
// valid according to your "house rules"
app.get('/test', validQuery('firstName'), (req, res) => {
  res.send('Test worked')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
```

Start by creating an Express application and register a `house-rules` schema to be used with `express-house-rules`. Then use `validQuery`, `validParams`, or `validBody` middleware on routes you wish to validate inbound values for. All three middlewares work by taking any quantity of string arguments that match the rule names of your house rules. For instance, given our house rules example we can validate a login form like this:

```js
app.post('/login', validBody('email', 'password'), (req, res) => {
  // Check `req.body.email` and `req.body.password` against the database here
})
```

In the above example, the `validBody` middleware will ensure that `email` and `password` meet your validation requirements for what constitutes a valid email and password. If the values are not valid, the middleware will call `next(error)` with errors that `house-rules` found. Note that in express, [any time a middleware calls `next(errors)` with an errors argument, your route will be bypassed and your express configuration will catch the error in a special error handling route](https://expressjs.com/en/guide/error-handling.html). The main point being that if the values are valid, then your `/login` route _will_ be called and you can rest assure that email and password meet your validation requirements. You would then do proceed to your business logic like checking the values against the database for authentication.

Note that `validQuery` should be used for Express requests which are expecting query arguments such as `/example?foo=bar`, `validParams` should be used for Express requests which use params such as `/example/:foo`, and `validBody` should be used for HTTP Post requests. Also note that in Express, you'll need to use [other modules to get Express to handle Post requests correctly](https://github.com/expressjs/body-parser).


## Required and Optional

Depending on how your strategy for setting up house rules, it can be common to have all rules start as either required or optional. The house rules in the example above all start as required. But what if we want to keep the house rules set that way for most cases, but we have that one route where `lastName` is optional? In these cases, you can make changes the rule's requiredness by adding a prefix:

```js
app.post('/signup', validBody('optional:firstName', 'optional:lastName', 'email'), (req, res) => {
})
```

Note that you can use `optional:` or its aliases `opt:` and `o:` to identify that the rule needs to be adjusted to be optional. Likewise, if a house-rule starts off as optional and you want to make it required on a per-house basis, you can use `required:` or the aliases `req:` and `r:`


## Highly Custom Rules

In order to use the middleware with string arguments, you need to call `registerHouseRules()` ahead of time. But using the middleware with string arguments an adjusting the rule's requiredness might not be custom enough for your needs. An alternative use of the middleware is to pass `house-rules` schemas directly into the `express-house-rules` middleware like this:

```js
import { Is, Schema } from 'house-rules'

const loginSchema = new Schema({
  email: Is.string().email().required(),
  password: Is.string().minLength(8).maxLength(100).required()
})

app.post('/login', validBody(loginSchema), (req, res) => {
  // Check `req.body.email` and `req.body.password` against the database here
})
```

This gives you the full power of `house-rules` schemas and sub schemas. See [house-rules documentation](https://github.com/bradwestfall/house-rules) for more details.

Note that this use of the middleware only takes one argument (schema) and cannot be mixed with the other use of the middleware to take any number of string arguments.
