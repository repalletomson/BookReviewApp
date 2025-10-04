/**
 * Literary Discovery Card - Where Books Meet Their Readers
 * 
 * This component is the first impression readers get of each book in our collection.
 * It's designed to spark curiosity, convey essential information at a glance,
 * and invite deeper exploration into the literary world each book offers.
 * 
 * Every element serves a purpose in helping readers discover their next great read.
 * BookVerse Frontend Team
 */

import React from 'react';
import { Link } from 'react-router-dom';

const LiteraryDiscoveryCard = ({ book }) => {
  /**
   * Star Rating Visualization
   * Creates an intuitive visual representation of community sentiment
   */
  const createStarRating = (communityRating) => {
    const starElements = [];
    const wholeStars = Math.floor(communityRating);
    const hasPartialStar = communityRating % 1 >= 0.5;
    
    // Render filled stars for whole numbers
    for (let starIndex = 0; starIndex < wholeStars; starIndex++) {
      starElements.push(
        <span key={`filled-${starIndex}`} className="star-filled text-lg">
          ★
        </span>
      );
    }
    
    // Add a half star if there's a significant partial rating
    if (hasPartialStar) {
      starElements.push(
        <span key="partial-star" className="text-accent-400 text-lg">
          ☆
        </span>
      );
    }
    
    // Fill remaining positions with empty stars
    const remainingStars = 5 - Math.ceil(communityRating);
    for (let emptyIndex = 0; emptyIndex < remainingStars; emptyIndex++) {
      starElements.push(
        <span key={`empty-${emptyIndex}`} className="star-empty text-lg">
          ★
        </span>
      );
    }
    
    return starElements;
  };

  /**
   * Genre-Based Visual Identity
   * Each literary genre gets its own visual personality through color adients
   */
  const getGenreVisualTheme = (literaryGenre) => {
    const genreThemes = {
      'Fiction': {
        gradient: 'from-purple-500 to-pink-500',
        accent: 'border-purple-200',
        description: 'Stories that transport you to other worlds'
      },
      'Non-Fiction': {
        gradient: 'from-blue-500 to-cyan-500',
        accent: 'border-blue-200',
        description: 'Real stories, real insights, real impact'
      },
      'Mystery': {
        gradient: 'from-gray-800 to-slate-900',
        accent: 'border-gray-300',
        description: 'Puzzles waiting to be solved'
      },
      'Romance': {
        gradient: 'from-rose-400 to-pink-500',
        accent: 'border-rose-200',
        description: 'Love stories that warm the heart'
      },
      'Sci-Fi': {
        gradient: 'from-indigo-500 to-purple-600',
        accent: 'border-indigo-200',
        description: 'Tomorrow\'s possibilities, today\'s imagination'
      },
      'Fantasy': {
        gradient: 'from-emerald-500 to-teal-600',
        accent: 'border-emerald-200',
        description: 'Magic exists between these pages'
      },
      'Biography': {
        gradient: 'from-amber-500 to-orange-500',
        accent: 'border-amber-200',
        description: 'Real lives, extraordinary journeys'
      },
      'History': {
        gradient: 'from-stone-500 to-neutral-600',
        accent: 'border-stone-200',
        description: 'The past comes alive'
      },
      'Self-Help': {
        gradient: 'from-green-500 to-emerald-600',
        accent: 'border-green-200',
        description: 'Your journey to a better you'
      },
      'Technology': {
        gradient: 'from-blue-600 to-indigo-600',
        accent: 'border-blue-200',
        description: 'Innovation and digital transformation'
      }
    };
    
    return genreThemes[literaryGenre] || {
      gradient: 'from-slate-500 to-gray-600',
      accent: 'border-gray-200',
      description: 'A unique literary experience awaits'
    };
  };

  /**
   * Reading Experience Indicator
   * Helps readers understand what kind of experience awaits them
   */
  const getReadingExperienceHint = (rating, reviewCount) => {
    if (reviewCount === 0) return "Waiting for its first reader's thoughts";
    if (rating >= 4.5) return "A truly exceptional read according to our community";
    if (rating >= 4.0) return "Highly recommended by fellow readers";
    if (rating >= 3.5) return "A solid choice that many readers enjoyed";
    if (rating >= 3.0) return "Mixed reactions - might be perfect for you";
    return "A polarizing work that sparks discussion";
  };

  const genreTheme = getGenreVisualTheme(book.genre);
  const readingHint = getReadingExperienceHint(book.averageRating, book.totalReviews);

  return (
    <article className="card-book group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex flex-col h-full">
        {/* Virtual Book Cover - A Window into the Story */}
        <div className="relative mb-4 overflow-hidden rounded-2xl shadow-md">
          <div className={`w-full h-48 bg-gradient-to-br ${genreTheme.gradient} flex items-center justify-center relative`}>
            {/* Book spine details for realism */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/30 shadow-inner"></div>
            <div className="absolute left-3 top-0 bottom-0 w-1 bg-white/40"></div>
            
            {/* Book cover content */}
            <div className="text-center p-4 text-white z-10">
              <h4 className="font-display font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-lg">
                {book.title}
              </h4>
              <p className="text-sm opacity-90 font-medium drop-shadow">
                {book.author}
              </p>
              <div className="mt-2 text-xs opacity-75">
                {book.publishedYear}
              </div>
            </div>

            {/* Interactive hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Book Information - The Story Behind the Story */}
        <div className="flex-1 flex flex-col space-y-3">
          {/* Title and Author Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {book.title}
              </h3>
              <p className="text-slate-600 dark:text-gray-400 text-sm font-medium">
                by {book.author}
              </p>
            </div>
            <span className={`badge-primary text-xs font-semibold flex-shrink-0 ${genreTheme.accent}`}>
              {book.genre}
            </span>
          </div>

          {/* Book Description - A Glimpse into the Content */}
          <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 leading-relaxed flex-1">
            {book.description}
          </p>

          {/* Community Rating Section */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <div className="rating-stars">
                {createStarRating(book.averageRating)}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-slate-800 dark:text-gray-100">
                  {book.averageRating > 0 ? book.averageRating.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-slate-500 dark:text-gray-500 -mt-1">
                  {book.totalReviews === 0 
                    ? 'No reviews yet' 
                    : `${book.totalReviews} reader${book.totalReviews !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Reading Experience Hint */}
          <div className="text-xs text-slate-500 dark:text-gray-500 italic border-l-2 border-primary-200 dark:border-primary-800 pl-2">
            {readingHint}
          </div>

          {/* Footer - Community Connection */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {book.sharedBy?.fullName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">
                  Shared by {book.sharedBy?.fullName || 'Anonymous Reader'}
                </span>
                <span className="text-xs text-slate-400 dark:text-gray-500">
                  Published {book.publishedYear}
                </span>
              </div>
            </div>
            
            <Link
              to={`/books/${book._id}`}
              className="btn-primary text-sm px-4 py-2 flex items-center space-x-2 group-hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label={`Explore "${book.title}" by ${book.author}`}
            >
              <span>Explore</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default LiteraryDiscoveryCard;