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

export default schema
