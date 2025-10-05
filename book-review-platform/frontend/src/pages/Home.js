import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalBooks: 0,
    totalPages: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const genres = ['All', 'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Other'];

  const fetchBooks = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search,
        genre: genre === 'All' ? '' : genre,
        sortBy,
        sortOrder
      };

      const response = await axios.get(`${API_BASE_URL}/api/books`, { params });
      setBooks(response.data.books);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch books');
      console.error('Fetch books error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, search, genre, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(1);
  };

  const handleFilterChange = (newGenre, newSortBy, newSortOrder) => {
    setGenre(newGenre || genre);
    setSortBy(newSortBy || sortBy);
    setSortOrder(newSortOrder || sortOrder);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setGenre('All');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 animate-fade-in">
        <div className="loading-spinner w-16 h-16 mb-4"></div>
        <p className="text-navy-600 dark:text-gray-400 font-medium">
          Loading amazing books...
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-4">
          Discover Amazing Books
        </h1>
        <p className="text-lg text-navy-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Explore our curated collection of books, read reviews from fellow readers, and share your own literary discoveries.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card mb-8 sticky top-24 z-30 glass-effect">
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-navy-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12 pr-32 text-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button 
                type="submit" 
                className="btn-primary text-sm px-6 py-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="loading-spinner w-4 h-4"></div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center space-x-2 text-navy-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
          >
            <svg className={`w-5 h-5 transform transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>Filters & Sorting</span>
          </button>
          
          {(search || genre !== 'All' || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <button
              onClick={clearFilters}
              className="text-sm text-navy-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filters */}
        {isFiltersOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="input-field"
              >
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(null, e.target.value)}
                className="input-field"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="publishedYear">Published Year</option>
                <option value="averageRating">Rating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => handleFilterChange(null, null, e.target.value)}
                className="input-field"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-navy-600 dark:text-gray-400 font-medium">
            {pagination?.totalBooks > 0 ? (
              <>
                Showing <span className="font-bold text-primary-600 dark:text-primary-400">{books.length}</span> of{' '}
                <span className="font-bold text-primary-600 dark:text-primary-400">{pagination?.totalBooks || 0}</span> books
                {search && (
                  <span className="ml-2">
                    for "<span className="font-semibold text-navy-800 dark:text-gray-200">{search}</span>"
                  </span>
                )}
                {genre !== 'All' && (
                  <span className="ml-2">
                    in <span className="font-semibold text-navy-800 dark:text-gray-200">{genre}</span>
                  </span>
                )}
              </>
            ) : (
              'No books found'
            )}
          </p>
        </div>
      )}

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-2xl font-display font-bold text-navy-800 dark:text-gray-200 mb-4">
            No books found
          </h3>
          <p className="text-navy-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
            {search || genre !== 'All' 
              ? 'Try adjusting your search or filters to discover more books.' 
              : 'Be the first to add a book to our collection!'
            }
          </p>
          {(search || genre !== 'All') && (
            <button
              onClick={clearFilters}
              className="btn-secondary mr-4"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid-responsive">
            {books.map((book, index) => (
              <div 
                key={book._id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BookCard book={book} />
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Pagination
              currentPage={pagination?.currentPage || 1}
              totalPages={pagination?.totalPages || 0}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;