import express from 'express'
import bodyParser from 'body-parser'
import request from 'supertest'
import { registerHouseRules, validQuery, validParams, validBody } from '../src'
import houseRulesSchema from '../house-rules-schema'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Called before any other use of house-rules API
registerHouseRules(houseRulesSchema)


/****************************************
  App Routes
*****************************************/

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// For validQuery tests
app.get('/valid-query-required', validQuery('r:firstName'), (req, res) => res.sendStatus(200))
app.get('/valid-query-optional', validQuery('o:firstName'), (req, res) => res.sendStatus(200))

// For validParams tests. Note that from an express standpoint, these parameters
// seem optional, but we're trying to test the validParams method, not express.
app.get('/valid-params-required/:firstName?', validParams('r:firstName'), (req, res) => res.sendStatus(200))
app.get('/valid-params-optional/:firstname?', validParams('o:firstName'), (req, res) => res.sendStatus(200))

// For validBody tests
app.post('/valid-body-required', validBody('r:firstName'), (req, res) => res.sendStatus(200))
app.post('/valid-body-optional', validBody('o:firstName'), (req, res) => res.sendStatus(200))


/****************************************
  Tests
*****************************************/

describe('Express', () => {
  it('express should be working', done => {
    request(app).get('/').expect(200, done)
  })
})

describe('validQuery', () => {
  it('should pass required validQuery method', done => {
    request(app).get('/valid-query-required?firstName=abc').expect(200, done)
  })
  it('should pass optional validQuery method', done => {
    request(app).get('/valid-query-optional').expect(200, done)
  })
  it('should fail required validQuery method', done => {
    request(app).get('/valid-query-required')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, done)
  })
})

describe('validParams', () => {
  it('should pass required validParams method', done => {
    request(app).get('/valid-params-required/abc').expect(200, done)
  })
  it('should pass optional validParams method', done => {
    request(app).get('/valid-params-optional').expect(200, done)
  })
  it('should fail required validParams method', done => {
    request(app).get('/valid-params-required')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, done)
  })
})

describe('validBody', () => {
  it('should pass required validBody method', done => {
    request(app).post('/valid-body-required').send({firstName: 'abc'}).expect(200, done)
  })
  it('should pass optional validBody method', done => {
    request(app).post('/valid-body-optional').expect(200, done)
  })
  it('should fail required validBody method', done => {
    request(app).post('/valid-body-required')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400, done)
  })
})
