/**
 * User Model - The Heart of Our Community
 * 
 * This model represents the wonderful people who make BookVerse a vibrant community.
 * Each user brings their unique perspective and love for literature to our platform.
 * 
 * Created with care for security, validation, and user experience.
 * Author: BookVerse Development Team
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readerProfileSchema = new mongoose.Schema({
  // Personal Information - What makes each reader unique
  fullName: {
    type: String,
    required: [true, 'We\'d love to know your name! Please provide your full name.'],
    trim: true,
    minlength: [2, 'Your name should be at least 2 characters long.'],
    maxlength: [50, 'Please keep your name under 50 characters.'],
    validate: {
      validator: function(name) {
        // Ensure name contains at least one letter (not just numbers/symbols)
        return /[a-zA-Z]/.test(name);
      },
      message: 'Your name should contain at least one letter.'
    }
  },
  
  // Email - Our way to stay connected
  emailAddress: {
    type: String,
    required: [true, 'An email address helps us keep your account secure.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      'Please provide a valid email address so we can reach you.'
    ]
  },
  
  // Password - Keeping your literary journey safe
  securePassword: {
    type: String,
    required: [true, 'A strong password keeps your book collection safe.'],
    minlength: [6, 'For your security, please use at least 6 characters.'],
    validate: {
      validator: function(password) {
        // Encourage stronger passwords without being too restrictive
        return password.length >= 6;
      },
      message: 'Your password should be at least 6 characters for better security.'
    }
  },
  
  // Reading Preferences - Understanding our community better
  favoriteGenres: [{
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Technology', 'Other']
  }],
  
  // Community Engagement Metrics
  totalBooksAdded: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalReviewsWritten: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // When this reader joined our community
  joinedBookVerse: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Add virtual fields for better user experience
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for display name (first name only for privacy)
readerProfileSchema.virtual('displayName').get(function() {
  return this.fullName ? this.fullName.split(' ')[0] : 'Book Lover';
});

// Virtual field for reading experience level
readerProfileSchema.virtual('readerLevel').get(function() {
  const totalActivity = this.totalBooksAdded + this.totalReviewsWritten;
  if (totalActivity >= 50) return 'Literary Enthusiast';
  if (totalActivity >= 20) return 'Avid Reader';
  if (totalActivity >= 5) return 'Book Explorer';
  return 'New Reader';
});

// Pre-save middleware - Securing passwords with love and care
readerProfileSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('securePassword')) return next();
  
  try {
    // Generate a salt with 12 rounds for extra security
    const saltRounds = 12;
    const salt = await bcrypt.genSalt(saltRounds);
    
    // Hash the password with our generated salt
    this.securePassword = await bcrypt.hash(this.securePassword, salt);
    
    next();
  } catch (error) {
    next(new Error('We encountered an issue securing your password. Please try again.'));
  }
});

// Instance method - Verify password during login
readerProfileSchema.methods.verifyPassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.securePassword);
  } catch (error) {
    throw new Error('Password verification failed. Please try again.');
  }
};

// Instance method - Update reading statistics
readerProfileSchema.methods.updateReadingStats = async function() {
  try {
    // This would typically involve counting related documents
    // For now, we'll implement the structure for future use
    const Book = mongoose.model('Book');
    const Review = mongoose.model('Review');
    
    this.totalBooksAdded = await Book.countDocuments({ addedBy: this._id });
    this.totalReviewsWritten = await Review.countDocuments({ userId: this._id });
    
    return this.save();
  } catch (error) {
    console.error('Error updating reading statistics:', error);
  }
};

// Static method - Find active readers
readerProfileSchema.statics.findActiveReaders = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// Static method - Get community statistics
readerProfileSchema.statics.getCommunityStats = async function() {
  try {
    const totalReaders = await this.countDocuments({ isActive: true });
    const newReadersThisMonth = await this.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    return {
      totalReaders,
      newReadersThisMonth,
      communityGrowth: totalReaders > 0 ? (newReadersThisMonth / totalReaders * 100).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting community statistics:', error);
    return { totalReaders: 0, newReadersThisMonth: 0, communityGrowth: 0 };
  }
};

// Create and export the model
const ReaderProfile = mongoose.model('User', readerProfileSchema);

module.exports = ReaderProfile;