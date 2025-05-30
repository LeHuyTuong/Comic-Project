const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
const storyRoutes = require('./routes/storyRoutes');
const chapterRoutes = require('./routes/chapterRoutes'); // Sẽ được dùng trong storyRoutes
const authRoutes = require('./routes/authRoutes');

app.use('/api/stories', storyRoutes);
// Chapter routes are nested under stories, so they are handled within storyRoutes.
// If you wanted top-level chapter routes not tied to a storyId in URL for POST/PUT/DELETE:
// app.use('/api/chapters', someTopLevelChapterRoutes);
app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Comic API Running!');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});