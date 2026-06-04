import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import Lenis from 'lenis';
import Home from './features/portfolio/Home';
import AdminLayout from './features/admin/AdminLayout';
import Login from './features/auth/Login';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import CustomCursor from './components/ui/CustomCursor';
import LoadingScreen from './components/ui/LoadingScreen';

// This component handles Lenis initialization inside the Router context
function SmoothScroll() {
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    // Only initialize Lenis on the home page
    if (location.pathname === '/') {
      if (!lenisRef.current) {
        lenisRef.current = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        // Expose globally so modals can stop/start Lenis
        window.__lenis = lenisRef.current;

        const raf = (time) => {
          lenisRef.current?.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    } else {
      // Destroy Lenis if navigating away from home
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    }

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [location.pathname]);

  return null;
}

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
      <SmoothScroll />
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
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
