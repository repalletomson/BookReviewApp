/**
 * BookVerse Server - The Heart of Our Literary Community
 * 
 * This server brings together book lovers from around the world,
 * providing a safe, welcoming space for literary discovery and discussion.
 * 
 * Built with care, security, and scalability in mind.
 * Every line of code serves our community of readers.
 * 
 * BookVerse Development Team - "Connecting Readers, One Book at a Time"
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load our environment configuration with care
dotenv.config();

// Create our Express application - the foundation of BookVerse
const bookVerseApp = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
bookVerseApp.set('trust proxy', 1);

/**
 * Security & Rate Limiting Configuration
 * Protecting our community while keeping the platform accessible
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // 1000 requests in dev, 100 in prod
  message: {
    error: 'Too many requests from this IP address.',
    message: 'Please take a moment to breathe and try again in a few minutes. Our books aren\'t going anywhere! 📚',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 2 * 60 * 1000 : 15 * 60 * 1000, // 2 minutes in dev, 15 minutes in prod
  max: process.env.NODE_ENV === 'development' ? 20 : 5, // 20 attempts in dev, 5 in prod
  message: {
    error: 'Too many authentication attempts.',
    message: 'For security reasons, please wait before trying to log in again. Your account safety is important to us! 🔒',
    retryAfter: process.env.NODE_ENV === 'development' ? '2 minutes' : '15 minutes'
  },
  skipSuccessfulRequests: true,
});

/**
 * CORS Configuration - Welcoming Our Frontend Friends
 * Configured to work seamlessly with our React frontend
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // In production, you'd specify your actual domain
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-bookverse-domain.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy: This origin is not allowed to access our BookVerse API.'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

/**
 * Middleware Stack - The Building Blocks of Our API
 * Each middleware serves a purpose in creating a smooth, secure experience
 */

// Apply rate limiting to all requests
bookVerseApp.use(generalLimiter);

// Enable CORS with our custom configuration
bookVerseApp.use(cors(corsOptions));

// Parse JSON requests with size limits for security
bookVerseApp.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for potential webhook verification
    req.rawBody = buf;
  }
}));

// Parse URL-encoded data (for form submissions)
bookVerseApp.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware for development
if (process.env.NODE_ENV === 'development') {
  bookVerseApp.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📖 [${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

/**
 * Database Connection - Connecting to Our Digital Library
 * MongoDB Atlas hosts our community's literary treasures
 */
const connectToBookVerse = async () => {
  try {
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    console.log('🎉 Successfully connected to BookVerse database!');
    console.log('📚 Our literary community is ready to welcome new readers and books.');
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ Database connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📡 Database connection lost. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ Database connection restored!');
    });
    
  } catch (error) {
    console.error('💥 Failed to connect to BookVerse database:', error.message);
    console.log('🔧 Please check your MONGODB_URI in the .env file');
    process.exit(1);
  }
};

/**
 * API Routes - The Pathways to Our Literary World
 * Each route serves a specific purpose in our book community
 */

// Authentication routes - Welcoming new readers and returning friends
bookVerseApp.use('/api/auth', authLimiter, require('./routes/auth'));

// Book management routes - The heart of our literary catalog
bookVerseApp.use('/api/books', require('./routes/books'));

// Review routes - Where readers share their thoughts and insights
bookVerseApp.use('/api/reviews', require('./routes/reviews'));

// Admin routes - Database maintenance (development only)
if (process.env.NODE_ENV === 'development') {
  bookVerseApp.use('/api/admin', require('./routes/admin'));
}

/**
 * Welcome Route - A Friendly Greeting to API Visitors
 */
bookVerseApp.get('/', (req, res) => {
  const welcomeMessage = {
    message: '📚 Welcome to BookVerse API!',
    description: 'A community-driven platform where book lovers discover, share, and discuss their favorite literary works.',
    version: '1.0.0',
    status: 'Ready to serve our reading community',
    endpoints: {
      authentication: '/api/auth',
      books: '/api/books',
      reviews: '/api/reviews'
    },
    community: {
      motto: 'Connecting Readers, One Book at a Time',
      mission: 'To create a welcoming space where every book finds its reader, and every reader finds their next great adventure.'
    },
    timestamp: new Date().toISOString()
  };
  
  res.json(welcomeMessage);
});

/**
 * Health Check Route - Ensuring Our Community Platform is Healthy
 */
bookVerseApp.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthStatus);
});

/**
 * 404 Handler - When Readers Wander Off the Beaten Path
 */
bookVerseApp.use('*', (req, res) => {
  res.status(404).json({
    error: 'Page Not Found',
    message: `The path '${req.originalUrl}' doesn't exist in our BookVerse library.`,
    suggestion: 'Check our API documentation or visit our main endpoints.',
    availableEndpoints: ['/api/auth', '/api/books', '/api/reviews'],
    timestamp: new Date().toISOString()
  });
});

/**
 * Global Error Handler - Gracefully Handling the Unexpected
 * Because even in the best libraries, sometimes books fall off shelves
 */
bookVerseApp.use((error, req, res, next) => {
  // Log the error for our development team
  console.error('🚨 BookVerse Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'The information provided doesn\'t meet our requirements.',
      details: isDevelopment ? error.message : 'Please check your input and try again.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'The ID provided is not in the correct format.',
      suggestion: 'Please check the ID and try again.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate Entry',
      message: 'This information already exists in our system.',
      suggestion: 'Please try with different information.',
      timestamp: new Date().toISOString()
    });
  }

  // Generic error response
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment 
      ? error.message 
      : 'Something unexpected happened. Our team has been notified and is working on it.',
    requestId: req.headers['x-request-id'] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

/**
 * Graceful Shutdown Handlers
 * Ensuring our community platform shuts down gracefully
 */
process.on('SIGTERM', () => {
  console.log('📚 BookVerse is shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🔌 Database connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📚 BookVerse is shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('🔌 Database connection closed.');
    process.exit(0);
  });
});

/**
 * Start Our BookVerse Server
 * The moment our literary community comes to life
 */
const startBookVerseServer = async () => {
  // First, connect to our database
  await connectToBookVerse();
  
  // Then start listening for requests
  const PORT = process.env.PORT || 5000;
  
  bookVerseApp.listen(PORT, () => {
    console.log('');
    console.log('🌟 ================================== 🌟');
    console.log('📚        BookVerse Server Started        📚');
    console.log('🌟 ================================== 🌟');
    console.log('');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API available at: http://localhost:${PORT}`);
    console.log(`💻 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('📖 Ready to serve our community of book lovers!');
    console.log('✨ "Connecting Readers, One Book at a Time" ✨');
    console.log('');
  });
};

// Launch BookVerse!
startBookVerseServer().catch((error) => {
  console.error('💥 Failed to start BookVerse server:', error);
  process.exit(1);
});

// Export for testing purposes
module.exports = bookVerseApp;