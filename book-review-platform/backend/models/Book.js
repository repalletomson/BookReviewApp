/**
 * Literary Work Model - Every Book Has a Story
 * 
 * This model represents the heart of our platform - the books that inspire,
 * educate, entertain, and transform lives. Each entry is a gateway to new worlds,
 * ideas, and experiences shared by our community of readers.
 * 
 * Crafted with respect for literature and the authors who create it.
 * BookVerse Development Team
 */

const mongoose = require('mongoose');

const literaryWorkSchema = new mongoose.Schema({
  // The essence of every book - its title
  bookTitle: {
    type: String,
    required: [true, 'Every great story needs a title. Please provide the book\'s title.'],
    trim: true,
    minlength: [1, 'The title seems too short. Please check and try again.'],
    maxlength: [200, 'Please keep the title under 200 characters for better display.'],
    validate: {
      validator: function(title) {
        // Ensure title isn't just whitespace or special characters
        return /[a-zA-Z0-9]/.test(title);
      },
      message: 'The title should contain at least some letters or numbers.'
    }
  },
  
  // The creative mind behind the work
  authorName: {
    type: String,
    required: [true, 'Please honor the author by including their name.'],
    trim: true,
    minlength: [2, 'Author name seems too short. Please double-check.'],
    maxlength: [100, 'Please keep the author name under 100 characters.'],
    validate: {
      validator: function(author) {
        // Allow for various author name formats including initials
        return /[a-zA-Z]/.test(author);
      },
      message: 'Author name should contain at least some letters.'
    }
  },
  
  // What makes this book special - the story behind the story
  bookSummary: {
    type: String,
    required: [true, 'Help other readers discover this book with a compelling description.'],
    trim: true,
    minlength: [10, 'A good description helps readers understand what makes this book special. Please add more details.'],
    maxlength: [1000, 'Please keep the description under 1000 characters for better readability.']
  },
  
  // Literary category - helping readers find their next favorite
  literaryGenre: {
    type: String,
    required: [true, 'Please select a genre to help readers discover this book.'],
    enum: {
      values: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Technology', 'Poetry', 'Drama', 'Other'],
      message: 'Please select a valid genre from our available categories.'
    }
  },
  
  // When this literary work was born
  publicationYear: {
    type: Number,
    required: [true, 'When was this masterpiece published? Please provide the year.'],
    min: [1000, 'Please enter a valid publication year.'],
    max: [new Date().getFullYear() + 1, 'Publication year cannot be in the future.'],
    validate: {
      validator: function(year) {
        // Reasonable range for books (Gutenberg Bible was around 1455)
        return year >= 1400 && year <= new Date().getFullYear() + 1;
      },
      message: 'Please enter a realistic publication year.'
    }
  },
  
  // The community member who shared this literary gem
  sharedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'We need to know who shared this wonderful book with our community.']
  },
  
  // Community engagement metrics
  communityRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: function(rating) {
      // Round to one decimal place for cleaner display
      return Math.round(rating * 10) / 10;
    }
  },
  
  reviewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Reading difficulty level (future feature)
  readingLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Not Specified'],
    default: 'Not Specified'
  },
  
  // Estimated reading time in hours (future feature)
  estimatedReadingTime: {
    type: Number,
    min: 0,
    default: null
  },
  
  // Book availability status
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Tags for better discoverability
  bookTags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  
  // When this book was added to our community library
  addedToLibrary: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Enable virtual fields in JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for book age
literaryWorkSchema.virtual('bookAge').get(function() {
  const currentYear = new Date().getFullYear();
  const age = currentYear - this.publicationYear;
  
  if (age === 0) return 'Published this year';
  if (age === 1) return 'Published last year';
  if (age < 5) return `${age} years old`;
  if (age < 10) return 'Less than a decade old';
  if (age < 50) return 'A modern classic';
  if (age < 100) return 'A timeless work';
  return 'A historical treasure';
});

// Virtual field for popularity level
literaryWorkSchema.virtual('popularityLevel').get(function() {
  if (this.reviewCount >= 100) return 'Community Favorite';
  if (this.reviewCount >= 50) return 'Highly Discussed';
  if (this.reviewCount >= 20) return 'Well-Reviewed';
  if (this.reviewCount >= 5) return 'Getting Attention';
  return 'Newly Discovered';
});

// Virtual field for quality indicator
literaryWorkSchema.virtual('qualityIndicator').get(function() {
  if (this.communityRating >= 4.5) return 'Exceptional';
  if (this.communityRating >= 4.0) return 'Excellent';
  if (this.communityRating >= 3.5) return 'Very Good';
  if (this.communityRating >= 3.0) return 'Good';
  if (this.communityRating >= 2.0) return 'Fair';
  if (this.communityRating > 0) return 'Needs More Reviews';
  return 'Awaiting First Review';
});

// Indexes for efficient searching and sorting
literaryWorkSchema.index({ bookTitle: 'text', authorName: 'text', bookSummary: 'text' });
literaryWorkSchema.index({ literaryGenre: 1 });
literaryWorkSchema.index({ communityRating: -1 });
literaryWorkSchema.index({ reviewCount: -1 });
literaryWorkSchema.index({ publicationYear: -1 });
literaryWorkSchema.index({ addedToLibrary: -1 });
literaryWorkSchema.index({ sharedBy: 1 });

// Pre-save middleware to clean and validate data
literaryWorkSchema.pre('save', function(next) {
  // Clean up tags - remove empty ones and duplicates
  if (this.bookTags && this.bookTags.length > 0) {
    this.bookTags = [...new Set(this.bookTags.filter(tag => tag && tag.trim().length > 0))];
  }
  
  // Ensure rating is within bounds
  if (this.communityRating < 0) this.communityRating = 0;
  if (this.communityRating > 5) this.communityRating = 5;
  
  next();
});

// Instance method to update community metrics
literaryWorkSchema.methods.recalculateRating = async function() {
  try {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ bookId: this._id });
    
    if (reviews.length === 0) {
      this.communityRating = 0;
      this.reviewCount = 0;
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      this.communityRating = totalRating / reviews.length;
      this.reviewCount = reviews.length;
    }
    
    return this.save();
  } catch (error) {
    console.error('Error recalculating book rating:', error);
    throw new Error('Unable to update book rating. Please try again.');
  }
};

// Instance method to check if user can edit this book
literaryWorkSchema.methods.canBeEditedBy = function(userId) {
  return this.sharedBy.toString() === userId.toString();
};

// Static method to find books by genre with stats
literaryWorkSchema.statics.findByGenreWithStats = function(genre) {
  const matchStage = genre && genre !== 'All' ? { literaryGenre: genre } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$literaryGenre',
        count: { $sum: 1 },
        averageRating: { $avg: '$communityRating' },
        totalReviews: { $sum: '$reviewCount' },
        books: { $push: '$$ROOT' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get trending books
literaryWorkSchema.statics.getTrendingBooks = function(limit = 10) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    addedToLibrary: { $gte: oneWeekAgo },
    isAvailable: true
  })
  .sort({ reviewCount: -1, communityRating: -1 })
  .limit(limit)
  .populate('sharedBy', 'fullName displayName');
};

// Static method to get highly rated books
literaryWorkSchema.statics.getHighlyRatedBooks = function(minRating = 4.0, minReviews = 5) {
  return this.find({
    communityRating: { $gte: minRating },
    reviewCount: { $gte: minReviews },
    isAvailable: true
  })
  .sort({ communityRating: -1, reviewCount: -1 })
  .populate('sharedBy', 'fullName displayName');
};

// Create and export the model
const LiteraryWork = mongoose.model('Book', literaryWorkSchema);

module.exports = LiteraryWork;