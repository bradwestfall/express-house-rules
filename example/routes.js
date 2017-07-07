import { Router } from 'express'
import { validQuery } from '../src'
const router = Router()

router.get('/', (req, res) => {
  res.send('Hello World!')
})

router.get('/test', validQuery('firstName'), (req, res) => {
  res.send('Test worked!')
})

module.exports = router
