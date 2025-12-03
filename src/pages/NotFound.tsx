import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <p className="mb-8 text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
