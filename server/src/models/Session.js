const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
  socketId:  { type: String, required: true },
  username:  { type: String, required: true },
  avatar:    { type: String },
  joinTime:  { type: Date, default: Date.now },
  leaveTime: { type: Date }
})

module.exports = mongoose.model('Session', sessionSchema)