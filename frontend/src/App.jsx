import { Route, Routes, useNavigate } from "react-router";
import { useEffect, lazy, Suspense } from "react";
import HeroSection from "./pages/LandingPage/LandingPage";
import DeployPolkaVM from "./pages/RustDeployer/DeployPolkaVM";

// Lazy load components
const AuthPage = lazy(() => import("./pages/AuthPage/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage/DashboardPage"));
const Playground = lazy(() => import("./pages/Playground/Playground"));
const AssetHubDashboardWithSidebar = lazy(() =>
  import("./pages/AssetHub/AssetHubDashboardWithSidebar")
);
const SolidityGenerator = lazy(() =>
  import("./pages/SolidityGenerator/SolidityGenerator")
);
const MockXcmTrigger = lazy(() => import("./MockXCMTrigger"));
const ContractDeployer = lazy(() =>
  import("./pages/CompileAndDeploy/CompileAndDeploy")
);
const MonitoringWithDashboard = lazy(() =>
  import("./pages/Monitoring/MonitoringWithDashboard")
);
const CodeEditor = lazy(() => import("./pages/CodeEditor/CodeEditor"));

const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center text-2xl text-pink-300 font-bold ">
    <div className="relative rounded-full p-4 border-3 border-white/10 w-64 h-64">
      {/* Rotating border loader */}
      <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-pink-300/50 border-t-transparent animate-spin"></div>
      <img
        src="/loader.gif"
        alt="Loading"
        className="rounded-full object-center object-cover"
      />
    </div>
  </div>
);

function App() {
  const navigate = useNavigate();
  // useEffect(() => {
  //   localStorage.getItem("user") === null
  //     ? navigate("/landingPage")
  //     : navigate("/dashboard");
  // }, [navigate]);

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/project/:id" element={<Playground />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/assethub" element={<AssetHubDashboardWithSidebar />} />
          <Route path="/code-editor" element={<CodeEditor />} />
          <Route path="/monitoring" element={<MonitoringWithDashboard />} />
          <Route path="/solidity-generator" element={<SolidityGenerator />} />
          <Route path="/compile" element={<ContractDeployer />} />
          <Route path="/mock" element={<MockXcmTrigger />} />
          <Route path="/rust" element={<DeployPolkaVM />} />

          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
