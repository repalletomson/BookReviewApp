const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    // Build sort object
    let sort = {};
    sort[sortBy] = sortOrder;

    const books = await Book.find(query)
      .populate('sharedBy', 'fullName displayName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Transform data for frontend compatibility
    const transformedBooks = books.map(book => ({
      ...book.toObject(),
      title: book.bookTitle || book.title || 'Untitled',
      author: book.authorName || book.author || 'Unknown Author',
      description: book.bookSummary || book.description || 'No description available',
      genre: book.literaryGenre || book.genre || 'Other',
      publishedYear: book.publicationYear || book.publishedYear || new Date().getFullYear(),
      addedBy: book.sharedBy ? {
        _id: book.sharedBy._id,
        name: book.sharedBy.fullName || book.sharedBy.displayName || 'Anonymous Reader'
      } : {
        _id: null,
        name: 'Anonymous Reader'
      },
      averageRating: book.communityRating || book.averageRating || 0,
      totalReviews: book.reviewCount || book.totalReviews || 0
    }));

    const total = await Book.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      books: transformedBooks,
      pagination: {
        currentPage: page,
        totalPages,
        totalBooks: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('sharedBy', 'fullName displayName');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Transform data for frontend compatibility
    const transformedBook = {
      ...book.toObject(),
      title: book.bookTitle || book.title || 'Untitled',
      author: book.authorName || book.author || 'Unknown Author',
      description: book.bookSummary || book.description || 'No description available',
      genre: book.literaryGenre || book.genre || 'Other',
      publishedYear: book.publicationYear || book.publishedYear || new Date().getFullYear(),
      addedBy: book.sharedBy ? {
        _id: book.sharedBy._id,
        name: book.sharedBy.fullName || book.sharedBy.displayName || 'Anonymous Reader'
      } : {
        _id: null,
        name: 'Anonymous Reader'
      },
      averageRating: book.communityRating || book.averageRating || 0,
      totalReviews: book.reviewCount || book.totalReviews || 0
    };

    res.json(transformedBook);
  } catch (error) {
    console.error('Get book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Add new book
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('author').trim().isLength({ min: 1 }).withMessage('Author is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('genre').isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other']).withMessage('Invalid genre'),
  body('publishedYear').isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid published year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, description, genre, publishedYear } = req.body;

    const book = new Book({
      bookTitle: title,
      authorName: author,
      bookSummary: description,
      literaryGenre: genre,
      publicationYear: publishedYear,
      sharedBy: req.user._id
    });

    await book.save();
    await book.populate('sharedBy', 'fullName displayName');

    // Transform data for frontend compatibility
    const transformedBook = {
      ...book.toObject(),
      title: book.bookTitle,
      author: book.authorName,
      description: book.bookSummary,
      genre: book.literaryGenre,
      publishedYear: book.publicationYear,
      addedBy: book.sharedBy ? {
        _id: book.sharedBy._id,
        name: book.sharedBy.fullName || book.sharedBy.displayName || 'Anonymous Reader'
      } : {
        _id: req.user._id,
        name: req.user.fullName || 'Anonymous Reader'
      },
      averageRating: book.communityRating || 0,
      totalReviews: book.reviewCount || 0
    };

    res.status(201).json({
      message: 'Book added successfully',
      book: transformedBook
    });
  } catch (error) {
    console.error('Add book error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (only book creator)
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('author').optional().trim().isLength({ min: 1 }).withMessage('Author cannot be empty'),
  body('description').optional().trim().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('genre').optional().isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other']).withMessage('Invalid genre'),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Invalid published year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is the book creator
    if (book.sharedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this book' });
    }

    // Transform request body to match schema
    const updateData = {};
    if (req.body.title) updateData.bookTitle = req.body.title;
    if (req.body.author) updateData.authorName = req.body.author;
    if (req.body.description) updateData.bookSummary = req.body.description;
    if (req.body.genre) updateData.literaryGenre = req.body.genre;
    if (req.body.publishedYear) updateData.publicationYear = req.body.publishedYear;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('sharedBy', 'fullName displayName');

    // Transform data for frontend compatibility
    const transformedBook = {
      ...updatedBook.toObject(),
      title: updatedBook.bookTitle,
      author: updatedBook.authorName,
      description: updatedBook.bookSummary,
      genre: updatedBook.literaryGenre,
      publishedYear: updatedBook.publicationYear,
      addedBy: updatedBook.sharedBy ? {
        _id: updatedBook.sharedBy._id,
        name: updatedBook.sharedBy.fullName || updatedBook.sharedBy.displayName || 'Anonymous Reader'
      } : {
        _id: null,
        name: 'Anonymous Reader'
      },
      averageRating: updatedBook.communityRating || 0,
      totalReviews: updatedBook.reviewCount || 0
    };

    res.json({
      message: 'Book updated successfully',
      book: transformedBook
    });
  } catch (error) {
    console.error('Update book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (only book creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is the book creator
    if (book.sharedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this book' });
    }

    // Delete all reviews for this book
    await Review.deleteMany({ bookId: req.params.id });
    
    // Delete the book
    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book and associated reviews deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;