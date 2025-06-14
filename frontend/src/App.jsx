import { Route, Routes, useNavigate } from "react-router";
import { useEffect } from "react";
import HeroSection from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import Playground from "./pages/Playground/Playground";
import AssetHubDashboardWithSidebar from "./pages/AssetHub/AssetHubDashboardWithSidebar";
import SolidityGenerator from "./pages/SolidityGenerator/SolidityGenerator";
import MockXcmTrigger from "./MockXCMTrigger";
import ContractDeployer from "./pages/CompileAndDeploy/CompileAndDeploy";
import MonitoringWithDashboard from "./pages/AssetHub/MonitoringWithDashboard";
import CodeEditor from "./pages/CodeEditor/CodeEditor";
// Components

function App() {
  const navigate = useNavigate();
  // useEffect(() => {
  //   localStorage.getItem("user") === null
  //     ? navigate("/landingPage")
  //     : navigate("/dashboard");
  // }, [navigate]);

  useEffect(() => {
    console.log("App component mounted");
  }, []);
  return (
    <>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/landingPage" element={<HeroSection />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project/:id" element={<Playground />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/assethub" element={<AssetHubDashboardWithSidebar />} />
        <Route path="/editor" element={<CodeEditor />} />
        <Route path="/monitoring" element={<MonitoringWithDashboard />} />
        <Route path="/solidity-generator" element={<SolidityGenerator />} />
        <Route path="/compile" element={<ContractDeployer />} />
        <Route path="/mock" element={<MockXcmTrigger />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
