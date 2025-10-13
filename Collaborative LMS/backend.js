/**
 * backend.js
 * Single-file Express + Mongoose + Socket.IO server for Collaborative LMS demo
 *
 * How to run:
 * 1. npm init -y
 * 2. npm i express mongoose bcryptjs jsonwebtoken cors socket.io
 * 3. Set env vars:
 *    - MONGO_URI (mongodb connection string)
 *    - JWT_SECRET (any secret string)
 *    - PORT (optional, default 4000)
 * 4. node backend.js
 *
 * Note: This is a demo server (many production concerns omitted: rate-limits, input sanitization, file uploads, CORS restrictions).
 */

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { Server } = require("socket.io");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms_demo";
const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

/* ---------------------- Schemas ---------------------- */

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: String,
  passwordHash: String,
  role: { type: String, enum: ["instructor", "student"], default: "student" },
  // track enrollments and progress
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  // progress: map courseId -> array of completed lesson ids
  progress: { type: Map, of: [mongoose.Schema.Types.ObjectId], default: {} },
});

const CommentSchema = new mongoose.Schema({
  user: { id: mongoose.Schema.Types.ObjectId, username: String },
  message: String,
  timestamp: { type: Date, default: Date.now },
  replies: [this], // simple threaded replies (can be recursive in Mongo)
});

const LessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
  resources: [String],
  order: Number,
  comments: [
    new mongoose.Schema(
      {
        userId: mongoose.Schema.Types.ObjectId,
        username: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
        replies: [
          {
            userId: mongoose.Schema.Types.ObjectId,
            username: String,
            message: String,
            timestamp: { type: Date, default: Date.now },
          },
        ],
      },
      { _id: true }
    ),
  ],
});

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  instructor: { id: mongoose.Schema.Types.ObjectId, username: String },
  lessons: [LessonSchema],
  createdAt: { type: Date, default: Date.now },
  studentsInvited: [String], // email/username invites (simple)
});

const ActivitySchema = new mongoose.Schema({
  courseId: mongoose.Schema.Types.ObjectId,
  action: String,
  actor: { id: mongoose.Schema.Types.ObjectId, username: String },
  timestamp: { type: Date, default: Date.now },
  meta: mongoose.Schema.Types.Mixed,
});

/* ---------------------- Models ---------------------- */
const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);
const Activity = mongoose.model("Activity", ActivitySchema);

/* ---------------------- App + Socket ---------------------- */
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

/* ---------------------- Simple JWT auth middleware ---------------------- */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/* ---------------------- Helpers ---------------------- */
async function logActivity(courseId, action, actor, meta) {
  const act = await Activity.create({ courseId, action, actor, meta });
  // emit globally for subscribers of that course
  io.to(String(courseId)).emit("activity", act);
}

/* ---------------------- Auth Routes ---------------------- */
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: "username taken" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    passwordHash: hash,
    role: role === "instructor" ? "instructor" : "student",
  });
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user._id, username: user.username, role: user.role },
  });
});

/* ---------------------- Course Routes ---------------------- */

/**
 * Create course (instructor only)
 * Body: { title, description }
 */
app.post("/api/courses", authMiddleware, async (req, res) => {
  if (req.user.role !== "instructor")
    return res
      .status(403)
      .json({ error: "Only instructors can create courses" });
  const { title, description } = req.body;
  const course = await Course.create({
    title,
    description,
    instructor: { id: req.user.id, username: req.user.username },
    lessons: [],
  });
  await logActivity(
    course._id,
    "course_created",
    { id: req.user.id, username: req.user.username },
    { title }
  );
  res.json(course);
});

/**
 * Get paginated list of courses
 * query: page, limit
 */
app.get("/api/courses", authMiddleware, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1"));
  const limit = Math.min(50, parseInt(req.query.limit || "10"));
  const courses = await Course.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  res.json({ page, limit, courses });
});

/**
 * Get a single course by id (only enrolled students or instructor can view full lessons)
 */
app.get("/api/courses/:id", authMiddleware, async (req, res) => {
  const course = await Course.findById(req.params.id).lean();
  if (!course) return res.status(404).json({ error: "Course not found" });
  const isInstructor = String(course.instructor.id) === req.user.id;
  const isEnrolled = (await User.findById(req.user.id)).enrolledCourses.some(
    (c) => String(c) === String(course._id)
  );
  // if student not enrolled and not instructor, hide lessons
  if (req.user.role === "student" && !isEnrolled && !isInstructor) {
    const copy = { ...course, lessons: [] };
    return res.json({ course: copy, enrolled: false });
  }
  res.json({ course, enrolled: isEnrolled || isInstructor });
});

/**
 * Enroll in course (student)
 */
app.post("/api/courses/:id/enroll", authMiddleware, async (req, res) => {
  if (req.user.role !== "student")
    return res.status(403).json({ error: "only students can enroll" });
  const user = await User.findById(req.user.id);
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!user.enrolledCourses.some((c) => String(c) === String(course._id))) {
    user.enrolledCourses.push(course._id);
    await user.save();
  }
  await logActivity(
    course._id,
    "student_enrolled",
    { id: user._id, username: user.username },
    {}
  );
  // notify course room
  io.to(String(course._id)).emit("enrolled", {
    userId: user._id,
    username: user.username,
    courseId: course._id,
  });
  res.json({ success: true });
});

/* ---------------------- Lesson Routes (only instructor) ---------------------- */

/**
 * Add lesson: POST /api/courses/:id/lessons
 * Body: { title, description, videoUrl, resources }
 */
app.post("/api/courses/:id/lessons", authMiddleware, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (String(course.instructor.id) !== req.user.id)
    return res
      .status(403)
      .json({ error: "only course instructor may add lessons" });
  const { title, description, videoUrl, resources } = req.body;
  const order =
    course.lessons.length > 0
      ? Math.max(...course.lessons.map((l) => l.order || 0)) + 1
      : 1;
  course.lessons.push({
    title,
    description,
    videoUrl,
    resources: resources || [],
    order,
  });
  await course.save();
  const added = course.lessons[course.lessons.length - 1];
  await logActivity(
    course._id,
    "lesson_added",
    { id: req.user.id, username: req.user.username },
    { lessonId: added._id, title }
  );
  io.to(String(course._id)).emit("lesson_added", {
    courseId: course._id,
    lesson: added,
  });
  res.json(added);
});

/**
 * Reorder lessons: PUT /api/courses/:id/lessons/reorder
 * Body: { order: [{ lessonId, order }, ...] }
 */
app.put(
  "/api/courses/:id/lessons/reorder",
  authMiddleware,
  async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (String(course.instructor.id) !== req.user.id)
      return res.status(403).json({ error: "only instructor may reorder" });
    const updates = req.body.order || [];
    for (const u of updates) {
      const lesson = course.lessons.id(u.lessonId);
      if (lesson) lesson.order = u.order;
    }
    // sort by order
    course.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    await course.save();
    await logActivity(
      course._id,
      "lessons_reordered",
      { id: req.user.id, username: req.user.username },
      { order: updates }
    );
    io.to(String(course._id)).emit("lessons_reordered", {
      courseId: course._id,
      order: updates,
    });
    res.json({ success: true });
  }
);

/**
 * Add comment to lesson (students or instructor enrolled)
 * POST /api/courses/:courseId/lessons/:lessonId/comments
 * Body: { message }
 */
app.post(
  "/api/courses/:courseId/lessons/:lessonId/comments",
  authMiddleware,
  async (req, res) => {
    const { courseId, lessonId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    // check enrollment or instructor
    const isInstructor = String(course.instructor.id) === req.user.id;
    const user = await User.findById(req.user.id);
    const isEnrolled = user.enrolledCourses.some(
      (c) => String(c) === String(courseId)
    );
    if (!isInstructor && !isEnrolled)
      return res.status(403).json({ error: "not enrolled" });
    const comment = {
      userId: user._id,
      username: user.username,
      message: req.body.message,
      timestamp: new Date(),
    };
    lesson.comments.push(comment);
    await course.save();
    const added = lesson.comments[lesson.comments.length - 1];
    await logActivity(
      course._id,
      "comment_added",
      { id: user._id, username: user.username },
      { lessonId: lesson._id, commentId: added._id }
    );
    io.to(String(course._id)).emit("comment_added", {
      courseId: course._id,
      lessonId: lesson._id,
      comment: added,
    });
    res.json(added);
  }
);

/**
 * Delete comment: DELETE /api/courses/:courseId/lessons/:lessonId/comments/:commentId
 * Rules: user can delete own comment; instructor of course can delete any in their course
 */
app.delete(
  "/api/courses/:courseId/lessons/:lessonId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { courseId, lessonId, commentId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    const comment = lesson.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    const user = await User.findById(req.user.id);
    const isInstructor = String(course.instructor.id) === req.user.id;
    const isAuthor = String(comment.userId) === String(req.user.id);
    if (!isAuthor && !isInstructor)
      return res.status(403).json({ error: "not allowed to delete" });
    comment.remove();
    await course.save();
    await logActivity(
      course._id,
      "comment_deleted",
      { id: req.user.id, username: req.user.username },
      { lessonId: lesson._id, commentId }
    );
    io.to(String(course._id)).emit("comment_deleted", {
      courseId: course._id,
      lessonId: lesson._id,
      commentId,
    });
    res.json({ success: true });
  }
);

/**
 * Mark lesson completed: POST /api/courses/:courseId/lessons/:lessonId/complete
 */
app.post(
  "/api/courses/:courseId/lessons/:lessonId/complete",
  authMiddleware,
  async (req, res) => {
    const { courseId, lessonId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });
    const user = await User.findById(req.user.id);
    if (!user.enrolledCourses.some((c) => String(c) === String(courseId)))
      return res.status(403).json({ error: "not enrolled" });
    const arr = user.progress.get(String(courseId)) || [];
    if (!arr.some((x) => String(x) === String(lessonId))) {
      arr.push(lessonId);
      user.progress.set(String(courseId), arr);
      await user.save();
    }
    await logActivity(
      course._id,
      "lesson_completed",
      { id: user._id, username: user.username },
      { lessonId }
    );
    res.json({ success: true });
  }
);

/**
 * Fetch activities for course (paginated)
 */
app.get("/api/courses/:id/activities", authMiddleware, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || "1"));
  const limit = Math.min(50, parseInt(req.query.limit || "10"));
  const activities = await Activity.find({ courseId: req.params.id })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  res.json({ page, limit, activities });
});

/* ---------------------- Socket.IO ---------------------- */
io.on("connection", (socket) => {
  // Client should join course rooms so they get updates: socket.emit("join", { courseId })
  socket.on("join", ({ courseId }) => {
    if (courseId) {
      socket.join(String(courseId));
      console.log("Socket joined room", courseId);
    }
  });
  socket.on("leave", ({ courseId }) => {
    if (courseId) socket.leave(String(courseId));
  });
  socket.on("disconnect", () => {});
});

/* ---------------------- Fallback & Start ---------------------- */
app.get("/", (req, res) =>
  res.json({ ok: true, message: "LMS backend running" })
);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
