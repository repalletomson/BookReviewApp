/**
 * Reader Review Model - Voices of Our Community
 * 
 * This model captures the heart of our platform - the thoughtful opinions,
 * insights, and experiences that readers share about the books they've encountered.
 * Each review is a bridge between one reader's journey and another's discovery.
 * 
 * Built to encourage authentic, helpful, and respectful literary discourse.
 * BookVerse Development Team
 */

const mongoose = require('mongoose');

const readerReviewSchema = new mongoose.Schema({
  // The book being reviewed - the subject of our reader's thoughts
  reviewedBook: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Please specify which book you\'re reviewing.'],
    validate: {
      validator: async function(bookId) {
        const Book = mongoose.model('Book');
        const book = await Book.findById(bookId);
        return book !== null;
      },
      message: 'The book you\'re trying to review doesn\'t exist in our library.'
    }
  },
  
  // The thoughtful reader sharing their experience
  reviewAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'We need to know who wrote this insightful review.'],
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return user !== null;
      },
      message: 'The reviewer account doesn\'t exist.'
    }
  },
  
  // The numerical expression of their experience (1-5 stars)
  starRating: {
    type: Number,
    required: [true, 'Please share your rating - it helps other readers understand your experience.'],
    min: [1, 'The minimum rating is 1 star. Even if you didn\'t enjoy it, your opinion matters.'],
    max: [5, 'The maximum rating is 5 stars. We appreciate your enthusiasm!'],
    validate: {
      validator: function(rating) {
        // Ensure it's a whole number (no half stars for simplicity)
        return Number.isInteger(rating);
      },
      message: 'Please provide a whole number rating from 1 to 5 stars.'
    }
  },
  
  // The heart of the review - their thoughts and insights
  reviewContent: {
    type: String,
    required: [true, 'Please share your thoughts about this book - your insights help other readers.'],
    trim: true,
    minlength: [10, 'Please share a bit more about your experience - at least 10 characters helps other readers.'],
    maxlength: [1000, 'Please keep your review under 1000 characters for better readability.'],
    validate: {
      validator: function(content) {
        // Ensure review has some meaningful content (not just punctuation/spaces)
        const meaningfulContent = content.replace(/[^\w]/g, '');
        return meaningfulContent.length >= 5;
      },
      message: 'Please provide a meaningful review with actual words and thoughts.'
    }
  },
  
  // Reading context - helps other readers understand the perspective
  readingContext: {
    type: String,
    enum: ['Personal Enjoyment', 'Academic Study', 'Professional Development', 'Book Club', 'Recommendation', 'Research', 'Other'],
    default: 'Personal Enjoyment'
  },
  
  // Would they recommend this book?
  wouldRecommend: {
    type: Boolean,
    default: null // null means they haven't specified
  },
  
  // Reading completion status
  readingStatus: {
    type: String,
    enum: ['Completed', 'Partially Read', 'Skimmed', 'Reference Only'],
    default: 'Completed'
  },
  
  // Community engagement metrics
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Moderation flags (for community safety)
  isFlagged: {
    type: Boolean,
    default: false
  },
  
  flagReason: {
    type: String,
    enum: ['Spam', 'Inappropriate Content', 'Off-topic', 'Personal Attack', 'Copyright Violation', 'Other'],
    required: false
  },
  
  // Review visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // When this thoughtful review was shared
  sharedOn: {
    type: Date,
    default: Date.now
  },
  
  // Track when the review was last updated
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for review length category
readerReviewSchema.virtual('reviewLength').get(function() {
  const length = this.reviewContent.length;
  if (length < 50) return 'Brief';
  if (length < 150) return 'Concise';
  if (length < 300) return 'Detailed';
  return 'Comprehensive';
});

// Virtual field for review age
readerReviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const reviewDate = this.sharedOn;
  const diffTime = Math.abs(now - reviewDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays <= 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
});

// Virtual field for helpfulness level
readerReviewSchema.virtual('helpfulnessLevel').get(function() {
  if (this.helpfulVotes >= 50) return 'Highly Valued';
  if (this.helpfulVotes >= 20) return 'Very Helpful';
  if (this.helpfulVotes >= 10) return 'Helpful';
  if (this.helpfulVotes >= 5) return 'Somewhat Helpful';
  return 'New Review';
});

// Compound index to ensure one review per user per book
readerReviewSchema.index({ reviewedBook: 1, reviewAuthor: 1 }, { 
  unique: true,
  name: 'one_review_per_user_per_book'
});

// Additional indexes for efficient querying
readerReviewSchema.index({ reviewedBook: 1, starRating: -1 });
readerReviewSchema.index({ reviewAuthor: 1, sharedOn: -1 });
readerReviewSchema.index({ starRating: -1, helpfulVotes: -1 });
readerReviewSchema.index({ sharedOn: -1 });
readerReviewSchema.index({ isPublic: 1, isFlagged: 1 });

// Pre-save middleware to update modification time and clean content
readerReviewSchema.pre('save', function(next) {
  // Update modification time if content changed
  if (this.isModified('reviewContent') || this.isModified('starRating')) {
    this.lastModified = new Date();
  }
  
  // Clean up review content
  if (this.reviewContent) {
    // Remove excessive whitespace while preserving intentional formatting
    this.reviewContent = this.reviewContent.replace(/\s+/g, ' ').trim();
  }
  
  next();
});

// Post-save middleware to update book rating
readerReviewSchema.post('save', async function() {
  try {
    const Book = mongoose.model('Book');
    const book = await Book.findById(this.reviewedBook);
    if (book) {
      await book.recalculateRating();
    }
  } catch (error) {
    console.error('Error updating book rating after review save:', error);
  }
});

// Post-remove middleware to update book rating when review is deleted
readerReviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const Book = mongoose.model('Book');
      const book = await Book.findById(doc.reviewedBook);
      if (book) {
        await book.recalculateRating();
      }
    } catch (error) {
      console.error('Error updating book rating after review deletion:', error);
    }
  }
});

// Instance method to check if user can edit this review
readerReviewSchema.methods.canBeEditedBy = function(userId) {
  return this.reviewAuthor.toString() === userId.toString();
};

// Instance method to mark review as helpful
readerReviewSchema.methods.markAsHelpful = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Instance method to flag review for moderation
readerReviewSchema.methods.flagForModeration = function(reason, flaggedBy) {
  this.isFlagged = true;
  this.flagReason = reason;
  // In a real app, you'd also log who flagged it and when
  return this.save();
};

// Static method to find reviews by rating range
readerReviewSchema.statics.findByRatingRange = function(minRating, maxRating, bookId = null) {
  const query = {
    starRating: { $gte: minRating, $lte: maxRating },
    isPublic: true,
    isFlagged: false
  };
  
  if (bookId) {
    query.reviewedBook = bookId;
  }
  
  return this.find(query)
    .populate('reviewAuthor', 'fullName displayName')
    .populate('reviewedBook', 'bookTitle authorName')
    .sort({ helpfulVotes: -1, sharedOn: -1 });
};

// Static method to get recent reviews
readerReviewSchema.statics.getRecentReviews = function(limit = 10) {
  return this.find({ isPublic: true, isFlagged: false })
    .populate('reviewAuthor', 'fullName displayName')
    .populate('reviewedBook', 'bookTitle authorName literaryGenre')
    .sort({ sharedOn: -1 })
    .limit(limit);
};

// Static method to get most helpful reviews
readerReviewSchema.statics.getMostHelpfulReviews = function(limit = 10) {
  return this.find({ 
    isPublic: true, 
    isFlagged: false,
    helpfulVotes: { $gte: 5 }
  })
    .populate('reviewAuthor', 'fullName displayName')
    .populate('reviewedBook', 'bookTitle authorName')
    .sort({ helpfulVotes: -1, sharedOn: -1 })
    .limit(limit);
};

// Static method to get review statistics for a book
readerReviewSchema.statics.getBookReviewStats = async function(bookId) {
  try {
    const stats = await this.aggregate([
      { 
        $match: { 
          reviewedBook: mongoose.Types.ObjectId(bookId),
          isPublic: true,
          isFlagged: false
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$starRating' },
          ratingDistribution: {
            $push: '$starRating'
          },
          recommendationRate: {
            $avg: { $cond: [{ $eq: ['$wouldRecommend', true] }, 1, 0] }
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recommendationRate: 0
      };
    }
    
    const result = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });
    
    return {
      totalReviews: result.totalReviews,
      averageRating: Math.round(result.averageRating * 10) / 10,
      ratingDistribution: distribution,
      recommendationRate: Math.round(result.recommendationRate * 100)
    };
  } catch (error) {
    console.error('Error getting book review statistics:', error);
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recommendationRate: 0
    };
  }
};

// Create and export the model
const ReaderReview = mongoose.model('Review', readerReviewSchema);

module.exports = ReaderReview;