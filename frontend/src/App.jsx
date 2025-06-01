import { Route, Routes, useNavigate } from "react-router";
import { useEffect } from "react";
import HeroSection from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";

// Components

function App() {
  const navigate = useNavigate();
  // useEffect(() => {
  //   localStorage.getItem("user") === null
  //     ? navigate("/landingPage")
  //     : navigate("/dashboard");
  // }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<h1 className="bg-red-500 ">Home Page</h1>} />
        <Route path="/landingPage" element={<HeroSection />} />
        <Route path="/dashboard" element={<h1>About Page</h1>} />
        <Route path="/project/:id" element={<h1>Project Details Page</h1>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
