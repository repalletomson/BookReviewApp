import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import FloatingActionButton from "./components/FloatingActionButton";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookDetails from "./pages/BookDetails";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
// import DebugPanel from "./components/DebugPanel"; // Removed for production

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-pale dark:bg-navy-900 transition-colors duration-300">
        <Navbar />
        <main className="container mx-auto px-4 py-8 pb-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route
              path="/add-book"
              element={
                <ProtectedRoute>
                  <AddBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-book/:id"
              element={
                <ProtectedRoute>
                  <EditBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <FloatingActionButton />
        {/* <DebugPanel /> Removed for production */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--toast-bg)",
              color: "var(--toast-color)",
              borderRadius: "1rem",
              padding: "16px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.15)",
            },
            success: {
              iconTheme: {
                primary: "#75ffa3",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
