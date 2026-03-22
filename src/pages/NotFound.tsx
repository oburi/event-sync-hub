import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center animate-fade-in">
        <h1 className="mb-3 font-serif text-6xl text-foreground">404</h1>
        <p className="mb-4 text-lg text-muted-foreground">This page doesn't exist</p>
        <a href="/" className="text-primary font-medium hover:underline text-[15px]">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
