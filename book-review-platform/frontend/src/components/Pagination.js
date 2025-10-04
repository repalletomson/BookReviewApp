import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-3 mt-12">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-gray-200 dark:border-navy-600 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:block">Previous</span>
      </button>

      {/* First Page */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-soft hover:shadow-medium border border-gray-200 dark:border-navy-600 font-semibold"
          >
            1
          </button>
          {startPage > 2 && (
            <div className="flex items-center justify-center w-8 h-8">
              <span className="text-navy-400 dark:text-gray-500 font-medium">...</span>
            </div>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-12 h-12 rounded-2xl font-semibold transition-all duration-200 shadow-soft hover:shadow-medium transform hover:scale-105 ${
            page === currentPage
              ? 'bg-primary-500 text-white shadow-medium scale-105'
              : 'bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-navy-600'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <div className="flex items-center justify-center w-8 h-8">
              <span className="text-navy-400 dark:text-gray-500 font-medium">...</span>
            </div>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 shadow-soft hover:shadow-medium border border-gray-200 dark:border-navy-600 font-semibold"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white dark:bg-navy-800 text-navy-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-700 transition-all duration-200 shadow-soft hover:shadow-medium border border-gray-200 dark:border-navy-600 font-medium"
      >
        <span className="hidden sm:block">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;