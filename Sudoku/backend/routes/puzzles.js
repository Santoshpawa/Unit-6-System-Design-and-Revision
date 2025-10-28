const express = require('express');
const router = express.Router();
const puzzles = require('../data/puzzles.js');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// 🧩 PUBLIC: Get list of puzzles (only starting grids)
router.get('/', (req, res) => {
  const publicPuzzles = puzzles.map(p => ({ id: p.id, start: p.start }));
  res.json(publicPuzzles);
});

// 🔒 Middleware: Authentication
async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ msg: 'Missing authorization header' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

// 🧠 Validate a solved puzzle
router.post('/check', auth, async (req, res) => {
  const { id, board } = req.body;

  const puzzle = puzzles.find(p => p.id === id);
  if (!puzzle) return res.status(400).json({ msg: 'Invalid puzzle ID' });

  // Ensure valid board structure
  if (!Array.isArray(board) || board.length !== 9 || board.some(row => !Array.isArray(row) || row.length !== 9)) {
    return res.status(400).json({ msg: 'Invalid board format' });
  }

  // Compare with correct solution
  let correct = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== puzzle.solution[r][c]) {
        correct = false;
        break;
      }
    }
    if (!correct) break;
  }

  if (correct) {
    // Initialize fields if missing
    if (!req.user.solvedPuzzles) req.user.solvedPuzzles = {};
    if (!req.user.badges) req.user.badges = [];

    // Mark this puzzle as solved
    req.user.solvedPuzzles[id] = true;

    // 🏅 Add image badge for this puzzle
    const badgeImage = `/images/badges/badge-${id}.png`;

    if (!req.user.badges.includes(badgeImage)) {
      req.user.badges.push(badgeImage);
    }

    await req.user.save();
  }

  res.json({
    correct,
    solvedPuzzles: req.user.solvedPuzzles,
    badges: req.user.badges,
  });
});


// 👤 Get user puzzle progress
router.get('/status', auth, (req, res) => {
  res.json({
    solvedPuzzles: req.user.solvedPuzzles || {},
    badges: req.user.badges || [],
  });
});

module.exports = router;
