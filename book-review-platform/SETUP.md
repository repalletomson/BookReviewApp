# Book Review Platform - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Git

## Quick Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd book-review-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:5000

### 3. Frontend Setup

Open a new terminal and navigate to frontend:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace `your_mongodb_connection_string` in the `.env` file

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Environment (development/production)

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Books
- GET `/api/books` - Get all books (with pagination and filters)
- GET `/api/books/:id` - Get single book
- POST `/api/books` - Add new book (protected)
- PUT `/api/books/:id` - Update book (protected)
- DELETE `/api/books/:id` - Delete book (protected)

### Reviews
- GET `/api/reviews/:bookId` - Get reviews for a book
- POST `/api/reviews` - Add review (protected)
- PUT `/api/reviews/:id` - Update review (protected)
- DELETE `/api/reviews/:id` - Delete review (protected)

## Features Implemented

### Core Features ✅
- User authentication with JWT tokens and password hashing
- Book Management system with CRUD operations
- Review System with ratings and text reviews
- React frontend with multiple pages
- Protected routes and middleware for authentication
- MongoDB Atlas with proper schema design
- Pagination for books list (5 books per page)
- Dynamic average ratings calculation

### Bonus Features ✅
- Search & Filter functionality
- Sorting options (by date, title, author, year, rating)
- Dark/Light mode toggle
- Responsive design with Tailwind CSS
- Profile page with user statistics

## Deployment

### Backend Deployment (Render/Heroku)
1. Create account on Render or Heroku
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Update API base URL for production

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Add new book
- [ ] View book details
- [ ] Add review to book
- [ ] Edit own book
- [ ] Delete own book
- [ ] Search and filter books
- [ ] Pagination
- [ ] Dark/Light mode toggle
- [ ] Responsive design

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure IP address is whitelisted in MongoDB Atlas
   - Verify database user credentials

2. **CORS Issues**
   - Ensure backend CORS is configured properly
   - Check if frontend proxy is set correctly

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure Authorization header format is correct

## Project Structure

```
book-review-platform/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── reviews.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── App.js
    ├── public/
    └── package.json
```

## Support

If you encounter any issues, please check:
1. All dependencies are installed
2. Environment variables are set correctly
3. MongoDB connection is working
4. Both frontend and backend servers are running

For additional help, refer to the documentation or create an issue in the repository.