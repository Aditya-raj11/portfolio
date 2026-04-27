import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Lenis from 'lenis';
import Home from './features/portfolio/Home';
import AdminLayout from './features/admin/AdminLayout';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import CustomCursor from './components/ui/CustomCursor';
import LoadingScreen from './components/ui/LoadingScreen';

// Inner component so it can use useLocation (must be inside Router)
function AppRoutes() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [showLoader, setShowLoader] = useState(isHomePage);
  const [dataReady, setDataReady] = useState(false);

  const handleLoaderAnimDone = useCallback(() => {
    setShowLoader(false);
  }, []);

  const handleDataReady = useCallback(() => {
    setDataReady(true);
  }, []);

  return (
    <>
      {/* Only render loading screen on the home page */}
      {isHomePage && showLoader && (
        <LoadingScreen
          dataReady={dataReady}
          onComplete={handleLoaderAnimDone}
        />
      )}
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Home onReady={handleDataReady} />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  // Initialize Lenis for smooth scrolling (only on home, but safe globally)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
