import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-verifund-forest-dark">404</h1>
        <p className="text-xl text-verifund-earth-brown mb-4">Oops! Page not found</p>
        <a href="/" className="text-verifund-sage hover:text-verifund-moss underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;