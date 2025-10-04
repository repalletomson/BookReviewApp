import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [userBooks, setUserBooks] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    fetchUserData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      // Fetch user's books
      const booksResponse = await axios.get('/api/books', {
        params: { search: '', genre: '', sortBy: 'createdAt', sortOrder: 'desc', limit: 100 }
      });
      const allBooks = booksResponse.data.books;
      const myBooks = allBooks.filter(book => book.addedBy._id === user.id);
      setUserBooks(myBooks);

      // For reviews, we'll need to fetch all reviews and filter by user
      // This is a simplified approach - in a real app, you'd have a dedicated endpoint
      const reviewsData = [];
      for (const book of allBooks) {
        try {
          const reviewsResponse = await axios.get(`/api/reviews/${book._id}`);
          const myReviews = reviewsResponse.data.filter(review => review.userId._id === user.id);
          reviewsData.push(...myReviews.map(review => ({ ...review, book })));
        } catch (error) {
          // Continue if reviews fetch fails for a book
        }
      }
      setUserReviews(reviewsData);
    } catch (error) {
      toast.error('Failed to fetch profile data');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {user.name}'s Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {user.email}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {userBooks.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Books Added</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
            {userBooks.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Books Added</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            {userReviews.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Reviews Written</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {userReviews.length > 0 ? (userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length).toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Avg Rating Given</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('books')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              My Books ({userBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              My Reviews ({userReviews.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'books' && (
        <div>
          {userBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                You haven't added any books yet.
              </p>
              <Link to="/add-book" className="btn-primary">
                Add Your First Book
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBooks.map(book => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          {userReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                You haven't written any reviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userReviews.map(review => (
                <div key={review._id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Link 
                        to={`/books/${review.book._id}`}
                        className="text-xl font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {review.book.title}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400">
                        by {review.book.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {renderStars(review.rating)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {review.reviewText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;