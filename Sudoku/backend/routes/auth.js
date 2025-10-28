const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';


router.post('/register', async (req, res) => {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });
try {
const existing = await User.findOne({ email });
if (existing) return res.status(400).json({ msg: 'User exists' });
const hash = await bcrypt.hash(password, 10);
const user = new User({ email, passwordHash: hash });
await user.save();
const token = jwt.sign({ id: user._id }, JWT_SECRET);
res.json({ token, user: { email: user.email, solvedPuzzles: user.solvedPuzzles, badges: user.badges } });
} catch (err) { res.status(500).json({ msg: err.message }); }
});


router.post('/login', async (req, res) => {
const { email, password } = req.body;
if (!email || !password) return res.status(400).json({ msg: 'Missing fields' });
try {
const user = await User.findOne({ email });
if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });
const token = jwt.sign({ id: user._id }, JWT_SECRET);
res.json({ token, user: { email: user.email, solvedPuzzles: user.solvedPuzzles, badges: user.badges } });
} catch (err) { res.status(500).json({ msg: err.message }); }
});


module.exports = router;