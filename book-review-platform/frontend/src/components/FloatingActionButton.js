import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const hiddenPaths = ['/add-book', '/login', '/register'];
  if (hiddenPaths.includes(location.pathname) || !isAuthenticated) {
    return null;
  }

  const handleClick = () => {
    navigate('/add-book');
  };

  return (
    <button
      onClick={handleClick}
      className="btn-floating group"
      aria-label="Add new book"
      title="Add new book"
    >
      <svg 
        className="w-6 h-6 transition-transform duration-200 group-hover:rotate-90" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 4v16m8-8H4" 
        />
      </svg>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-navy-800 dark:bg-white text-white dark:text-navy-800 text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-large">
        Add new book
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-navy-800 dark:border-t-white"></div>
      </div>
    </button>
  );
};

export default FloatingActionButton;