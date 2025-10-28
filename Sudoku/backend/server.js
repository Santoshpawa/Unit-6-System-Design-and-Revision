const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Routes
const authRoutes = require('./routes/auth');
const puzzleRoutes = require('./routes/puzzles');

app.use('/api/auth', authRoutes);
app.use('/api/puzzles', puzzleRoutes);

// ✅ Serve frontend build (for production)
const __dirnameFull = path.resolve();
const frontendPath = path.join(__dirnameFull, '../frontend/dist');

app.use(express.static(frontendPath));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ MongoDB Connection + Start Server
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
