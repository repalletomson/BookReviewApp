# Quick Start Guide for Local Development

## Prerequisites
1. **MongoDB Compass** - Make sure MongoDB is running locally on port 27017
2. **Node.js** - Ensure you have Node.js installed

## Steps to Run the Application

### 1. Start MongoDB
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- The database `bookreviews` will be created automatically

### 2. Start Backend Server
```bash
cd book-review-platform/backend
npm run dev
```
The backend will run on http://localhost:5000

### 3. Start Frontend Server (in a new terminal)
```bash
cd book-review-platform/frontend
npm start
```
The frontend will run on http://localhost:3000

## Verification
- Backend: Visit http://localhost:5000 - you should see "Book Review Platform API"
- Frontend: Visit http://localhost:3000 - you should see the Book Review Platform

## Test the Application
1. Register a new user
2. Login with your credentials
3. Add a new book
4. Add a review to the book
5. Test search and filtering features

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally
- Check if port 27017 is available
- Verify MongoDB Compass can connect to localhost:27017

### Backend Issues
- Check if port 5000 is available
- Verify all dependencies are installed: `npm install`
- Check the console for any error messages

### Frontend Issues
- Check if port 3000 is available
- Verify all dependencies are installed: `npm install`
- Ensure backend is running before starting frontend

## Default Test Data
Once the app is running, you can:
1. Create a test user account
2. Add sample books
3. Write reviews
4. Test all features

The app includes:
- User authentication
- Book management (CRUD)
- Review system
- Search and filtering
- Pagination
- Dark/Light mode toggle
- Responsive design