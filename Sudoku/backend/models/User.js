const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
email: { type: String, required: true, unique: true },
passwordHash: { type: String, required: true },
solvedPuzzles: { type: [Boolean], default: Array(10).fill(false) },
badges: { type: [String], default: [] }
});


module.exports = mongoose.model('User', UserSchema);