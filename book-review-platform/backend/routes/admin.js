/**
 * Admin Routes - Database Maintenance and Cleanup
 * 
 * These routes help maintain data integrity and handle migrations
 * between different schema versions.
 */

const express = require('express');
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/admin/cleanup-books
// @desc    Clean up books with invalid references
// @access  Public (in development only)
router.get('/cleanup-books', async (req, res) => {
  try {
    // Find books with missing or invalid sharedBy references
    const booksWithoutUser = await Book.find({
      $or: [
        { sharedBy: { $exists: false } },
        { sharedBy: null }
      ]
    });

    console.log(`Found ${booksWithoutUser.length} books without valid user references`);

    // Create a default user if none exists
    let defaultUser = await User.findOne({ emailAddress: 'system@bookverse.com' });
    
    if (!defaultUser) {
      defaultUser = new User({
        fullName: 'BookVerse System',
        emailAddress: 'system@bookverse.com',
        securePassword: 'system123'
      });
      await defaultUser.save();
      console.log('Created default system user');
    }

    // Update books without valid user references
    const updateResult = await Book.updateMany(
      {
        $or: [
          { sharedBy: { $exists: false } },
          { sharedBy: null }
        ]
      },
      { $set: { sharedBy: defaultUser._id } }
    );

    console.log(`Updated ${updateResult.modifiedCount} books with default user reference`);

    res.json({
      message: 'Database cleanup completed',
      booksFound: booksWithoutUser.length,
      booksUpdated: updateResult.modifiedCount,
      defaultUser: {
        id: defaultUser._id,
        name: defaultUser.fullName
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ 
      message: 'Cleanup failed', 
      error: error.message 
    });
  }
});

// @route   GET /api/admin/database-stats
// @desc    Get database statistics
// @access  Public (in development only)
router.get('/database-stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const bookCount = await Book.countDocuments();
    const reviewCount = await Review.countDocuments();
    
    const booksWithoutUser = await Book.countDocuments({
      $or: [
        { sharedBy: { $exists: false } },
        { sharedBy: null }
      ]
    });

    const reviewsWithoutUser = await Review.countDocuments({
      $or: [
        { reviewAuthor: { $exists: false } },
        { reviewAuthor: null }
      ]
    });

    res.json({
      statistics: {
        users: userCount,
        books: bookCount,
        reviews: reviewCount
      },
      dataIntegrity: {
        booksWithoutUser,
        reviewsWithoutUser,
        healthScore: ((bookCount + reviewCount - booksWithoutUser - reviewsWithoutUser) / (bookCount + reviewCount) * 100).toFixed(1) + '%'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get statistics', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/reset-database
// @desc    Reset database (development only)
// @access  Public (in development only)
router.delete('/reset-database', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Database reset not allowed in production' });
    }

    await Review.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});

    res.json({
      message: 'Database reset completed',
      warning: 'All data has been deleted',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ 
      message: 'Database reset failed', 
      error: error.message 
    });
  }
});

module.exports = router;