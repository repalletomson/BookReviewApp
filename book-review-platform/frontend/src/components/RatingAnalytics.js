import React, { useState } from 'react';
import RatingChart from './RatingChart';

const RatingAnalytics = ({ reviews, book }) => {
  const [chartType, setChartType] = useState('bar');

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        mostCommonRating: 0,
        ratingSpread: 0
      };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = totalRating / reviews.length;
    const mostCommonRating = Object.entries(distribution).reduce((a, b) => 
      distribution[a[0]] > distribution[b[0]] ? a : b
    )[0];

    const ratings = reviews.map(r => r.rating);
    const ratingSpread = Math.max(...ratings) - Math.min(...ratings);

    return {
      totalReviews: reviews.length,
      averageRating,
      distribution,
      mostCommonRating: parseInt(mostCommonRating),
      ratingSpread
    };
  }, [reviews]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-accent-500">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-accent-400">☆</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300 dark:text-gray-600">★</span>);
    }

    return stars;
  };

  const getQualityLabel = (rating) => {
    if (rating >= 4.5) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (rating >= 4.0) return { label: 'Very Good', color: 'text-green-500 dark:text-green-400' };
    if (rating >= 3.5) return { label: 'Good', color: 'text-yellow-600 dark:text-yellow-400' };
    if (rating >= 3.0) return { label: 'Average', color: 'text-orange-600 dark:text-orange-400' };
    if (rating >= 2.0) return { label: 'Below Average', color: 'text-red-500 dark:text-red-400' };
    return { label: 'Poor', color: 'text-red-600 dark:text-red-500' };
  };

  const qualityInfo = getQualityLabel(stats.averageRating);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-slate-600 dark:text-gray-400 font-medium">
            Total Reviews
          </div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            {renderStars(stats.averageRating)}
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-slate-600 dark:text-gray-400 font-medium">
            Average Rating
          </div>
        </div>

        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            {renderStars(stats.mostCommonRating)}
          </div>
          <div className="text-lg font-bold text-slate-800 dark:text-gray-200 mb-1">
            {stats.mostCommonRating} Stars
          </div>
          <div className="text-sm text-slate-600 dark:text-gray-400 font-medium">
            Most Common
          </div>
        </div>

        <div className="card text-center">
          <div className={`text-lg font-bold mb-1 ${qualityInfo.color}`}>
            {qualityInfo.label}
          </div>
          <div className="text-sm text-slate-600 dark:text-gray-400 font-medium">
            Overall Quality
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-gray-200 mb-2">
              Rating Distribution
            </h3>
            <p className="text-slate-600 dark:text-gray-400">
              How readers rated "{book?.title}"
            </p>
          </div>
          
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-slate-700 rounded-2xl p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-soft'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-soft'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Pie Chart
            </button>
          </div>
        </div>

        <RatingChart reviews={reviews} type={chartType} />
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <h3 className="text-xl font-display font-semibold text-slate-800 dark:text-gray-200 mb-4">
          Detailed Breakdown
        </h3>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.distribution[rating];
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-20">
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    {rating}
                  </span>
                  <span className="text-accent-500">★</span>
                </div>
                
                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex items-center space-x-2 w-20 text-right">
                  <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    {count}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-gray-500">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {stats.totalReviews > 0 && (
        <div className="card bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
          <h3 className="text-lg font-display font-semibold text-slate-800 dark:text-gray-200 mb-3">
            📊 Quick Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-primary-500 mt-0.5">•</span>
              <span className="text-slate-700 dark:text-gray-300">
                <strong>{((stats.distribution[4] + stats.distribution[5]) / stats.totalReviews * 100).toFixed(1)}%</strong> of readers gave this book 4+ stars
              </span>
            </div>
            
            <div className="flex items-start space-x-2">
              <span className="text-primary-500 mt-0.5">•</span>
              <span className="text-slate-700 dark:text-gray-300">
                Rating spread: <strong>{stats.ratingSpread} star{stats.ratingSpread !== 1 ? 's' : ''}</strong> difference
              </span>
            </div>
            
            {stats.averageRating >= 4.0 && (
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-slate-700 dark:text-gray-300">
                  Highly recommended by readers
                </span>
              </div>
            )}
            
            {stats.totalReviews >= 10 && (
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-0.5">📈</span>
                <span className="text-slate-700 dark:text-gray-300">
                  Well-reviewed with <strong>{stats.totalReviews}</strong> reader opinions
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingAnalytics;