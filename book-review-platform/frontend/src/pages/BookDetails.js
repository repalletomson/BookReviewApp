import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RatingAnalytics from '../components/RatingAnalytics';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchBookDetails();
    fetchReviews();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/books/${id}`);
      setBook(response.data);
    } catch (error) {
      toast.error('Book not found');
      navigate('/');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews/${id}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        bookId: id,
        ...reviewForm
      };

      if (editingReview) {
        await axios.put(`${API_BASE_URL}/api/reviews/${editingReview._id}`, reviewForm);
        toast.success('Review updated successfully!');
        setEditingReview(null);
      } else {
        await axios.post(`${API_BASE_URL}/api/reviews`, reviewData);
        toast.success('Review added successfully!');
      }

      setReviewForm({ rating: 5, reviewText: '' });
      fetchReviews();
      fetchBookDetails(); // Refresh to update average rating
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully!');
      fetchReviews();
      fetchBookDetails();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      reviewText: review.reviewText
    });
  };

  const handleDeleteBook = async () => {
    if (!window.confirm('Are you sure you want to delete this book? This will also delete all reviews.')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/books/${id}`);
      toast.success('Book deleted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete book');
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

  const userReview = reviews.find(review => review.userId._id === user?._id);
  const canReview = isAuthenticated && !userReview && !editingReview;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Book not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Book Details */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              by {book.author}
            </p>
          </div>
          
          {user && book.addedBy._id === user.id && (
            <div className="flex gap-2">
              <Link to={`/edit-book/${book._id}`} className="btn-secondary">
                Edit
              </Link>
              <button onClick={handleDeleteBook} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
              {book.genre}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Published: {book.publishedYear}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Added by: {book.addedBy.name}
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {book.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {renderStars(Math.round(book.averageRating))}
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {book.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              ({book.totalReviews} reviews)
            </span>
          </div>
          
          {book.totalReviews > 0 && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>{showAnalytics ? 'Hide Analytics' : 'View Analytics'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rating Analytics */}
      {showAnalytics && book.totalReviews > 0 && (
        <div className="animate-slide-up">
          <RatingAnalytics reviews={reviews} book={book} />
        </div>
      )}

      {/* Add/Edit Review Form */}
      {(canReview || editingReview) && (
        <div className="card mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingReview ? 'Edit Your Review' : 'Add Your Review'}
          </h3>
          
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} hover:text-yellow-400 transition-colors`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Review
              </label>
              <textarea
                id="reviewText"
                value={reviewForm.reviewText}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                required
                rows={4}
                className="input-field resize-none"
                placeholder="Write your review..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Submitting...' : (editingReview ? 'Update Review' : 'Add Review')}
              </button>
              {editingReview && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingReview(null);
                    setReviewForm({ rating: 5, reviewText: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Reviews ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to review this book!
          </p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {review.userId.name}
                      </span>
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {user && review.userId._id === user.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {review.reviewText}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;