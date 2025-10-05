import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import MangaDetailsPage from "./components/MangaDetailsPage";
import MangaReaderPage from "./components/MangaReaderPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/manga/:id" element={<MangaDetailsPage />} />
          <Route path="/reader/:id" element={<MangaReaderPage />} />
          <Route path="/reader/:id/:chapterId" element={<MangaReaderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        {/* Tempo routes will be handled by the tempo plugin */}
      </>
    </Suspense>
  );
}

export default App;