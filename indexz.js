//1. server.js (Main App)

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/photo_gallery_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const User = require('./models/User');
const Photo = require('./models/Photo');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(session({
  secret: 'photo-gallery-secret',
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
 //server.js (Main App)

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
  console.log('📸 Photo Gallery running on http://localhost:3000');
});

//2. models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String // For production, hash this!
});

module.exports = mongoose.model('User', userSchema);
//3. models/Photo.js
const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  filename: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', photoSchema);
//4. views/index.ejs
<!DOCTYPE html>
<html>
<head>
  <title>Public Gallery</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h1>🌍 Public Gallery</h1>
  <div class="gallery">
    <% photos.forEach(photo => { %>
      <div class="photo-card"><img src="/uploads/<%= photo.filename %>" /></div>
    <% }) %>
  </div>
  <a href="/login" class="btn">Login</a> or <a href="/register" class="btn">Register</a>
</body>
</html>
//5. views/register.ejs
<!DOCTYPE html>
<html>
<head>
  <title>Register</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h2>📝 Register</h2>
  <form method="POST" action="/register">
    <input name="username" required />
    <input type="password" name="password" required />
    <button type="submit">Register</button>
  </form>
  <p>Already registered? <a href="/login">Login</a></p>
</body>
</html>
//6. views/login.ej
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h2>🔐 Login</h2>
  <form method="POST" action="/login">
    <input name="username" required />
    <input type="password" name="password" required />
    <button type="submit">Login</button>
  </form>
  <p>No account? <a href="/register">Register</a></p>
</body>
</html>
//7. views/dashboard.ejs
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <h2>📂 My Dashboard</h2>
  <form method="POST" action="/upload" enctype="multipart/form-data">
    <input type="file" name="image" required />
    <button type="submit">Upload</button>
  </form>
  <div class="gallery">
    <% photos.forEach(photo => { %>
      <div class="photo-card"><img src="/uploads/<%= photo.filename %>" /></div>
    <% }) %>
  </div>
  <a href="/logout" class="btn">Logout</a>
</body>
</html>
//8. public/style.css
body {
  font-family: Arial, sans-serif;
  background: #f9f9fb;
  text-align: center;
  padding: 20px;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.photo-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.photo-card img {
  max-width: 200px;
  border-radius: 8px;
}

.photo-card:hover {
  transform: scale(1.05);
}

input, button {
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn {
  display: inline-block;
  background: #007BFF;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 15px;
}
//8. public/style.css
body {
  font-family: Arial, sans-serif;
  background: #f9f9fb;
  text-align: center;
  padding: 20px;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 30px;
}

.photo-card {
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.photo-card img {
  max-width: 200px;
  border-radius: 8px;
}

.photo-card:hover {
  transform: scale(1.05);
}

input, button {
  margin: 5px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn {
  display: inline-block;
  background: #007BFF;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 15px;
}

