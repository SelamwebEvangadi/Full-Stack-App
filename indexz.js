const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const app = express();

// MongoDB connection

mongoose.connect('mongodb+srv://Zinabu:Simacloud7@cluster0.vb21kbo.mongodb.net/zinabu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
});

  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
});

// Models
const User = require('./models/User');
const Photo = require('./models/Photo');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(session({
  secret: 'Zed-Cloud-gallery-secret',
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'ejs');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// Routes
app.get('/', async (req, res) => {
  const photos = await Photo.find({});
  res.render('index', { photos });
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  await User.create({ username, password });
  res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } else {
    res.send('Login failed');
  }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  const photos = await Photo.find({ user: req.session.userId });
  res.render('dashboard', { photos });
});

app.post('/upload', isAuthenticated, upload.single('image'), async (req, res) => {
  await Photo.create({ filename: req.file.filename, user: req.session.userId });
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.listen(3000, () => {
  console.log('📸 Zed Cloud Gallery running on http://localhost:3000');
});
