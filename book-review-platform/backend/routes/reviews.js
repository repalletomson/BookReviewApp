const express = require("express");
const { body, validationResult } = require("express-validator");
const Review = require("../models/Review");
const Book = require("../models/Book");
const auth = require("../middleware/auth");

const router = express.Router();

// Helper function to update book's average rating
const updateBookRating = async (bookId) => {
  const reviews = await Review.find({ reviewedBook: bookId });
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.starRating, 0) /
        totalReviews
      : 0;

  await Book.findByIdAndUpdate(bookId, {
    communityRating: Math.round(averageRating * 10) / 10,
    reviewCount: totalReviews,
  });
};

// @route   GET /api/reviews/:bookId
// @desc    Get all reviews for a book
// @access  Public
router.get("/:bookId", async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedBook: req.params.bookId })
      .populate("reviewAuthor", "fullName displayName")
      .sort({ createdAt: -1 });

    // Transform data for frontend compatibility
    const transformedReviews = reviews.map((review) => ({
      ...review.toObject(),
      bookId: review.reviewedBook,
      userId: {
        _id: review.reviewAuthor._id,
        name: review.reviewAuthor.fullName,
      },
      rating: review.starRating,
      reviewText: review.reviewContent,
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/reviews
// @desc    Add new review
// @access  Private
router.post(
  "/",
  auth,
  [
    body("bookId").isMongoId().withMessage("Invalid book ID"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("reviewText")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage(
        "Review text is required and must be less than 500 characters"
      ),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { bookId, rating, reviewText } = req.body;

      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Check if user already reviewed this book
      const existingReview = await Review.findOne({
        reviewedBook: bookId,
        reviewAuthor: req.user._id,
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this book" });
      }

      const review = new Review({
        reviewedBook: bookId,
        reviewAuthor: req.user._id,
        starRating: rating,
        reviewContent: reviewText,
      });

      await review.save();
      await review.populate("reviewAuthor", "fullName displayName");

      // Update book's average rating
      await updateBookRating(bookId);

      // Transform data for frontend compatibility
      const transformedReview = {
        ...review.toObject(),
        bookId: review.reviewedBook,
        userId: {
          _id: review.reviewAuthor._id,
          name: review.reviewAuthor.fullName,
        },
        rating: review.starRating,
        reviewText: review.reviewContent,
      };

      res.status(201).json({
        message: "Review added successfully",
        review: transformedReview,
      });
    } catch (error) {
      console.error("Add review error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private (only review author)
router.put(
  "/:id",
  auth,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("reviewText")
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Review text must be less than 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const review = await Review.findById(req.params.id);

      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      // Check if user is the review author
      if (review.reviewAuthor.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this review" });
      }

      // Transform request body to match schema
      const updateData = {};
      if (req.body.rating) updateData.starRating = req.body.rating;
      if (req.body.reviewText) updateData.reviewContent = req.body.reviewText;

      const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("reviewAuthor", "fullName displayName");

      // Update book's average rating
      await updateBookRating(review.reviewedBook);

      // Transform data for frontend compatibility
      const transformedReview = {
        ...updatedReview.toObject(),
        bookId: updatedReview.reviewedBook,
        userId: {
          _id: updatedReview.reviewAuthor._id,
          name: updatedReview.reviewAuthor.fullName,
        },
        rating: updatedReview.starRating,
        reviewText: updatedReview.reviewContent,
      };

      res.json({
        message: "Review updated successfully",
        review: transformedReview,
      });
    } catch (error) {
      console.error("Update review error:", error);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private (only review author)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review author
    if (review.reviewAuthor.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    const bookId = review.reviewedBook;
    await Review.findByIdAndDelete(req.params.id);

    // Update book's average rating
    await updateBookRating(bookId);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
