const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  avatar:    { type: String, default: 'blue' },
  lastSeen:  { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)