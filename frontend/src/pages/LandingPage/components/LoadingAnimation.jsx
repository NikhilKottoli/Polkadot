import React, { useState, useEffect, useRef } from "react";

const LoadingAnimation = () => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

const loadingTexts = [
  "Parsing prompt into modular smart contract logic",
  "Mapping intent to decentralized workflow nodes",
  "Generating visual flowchart of blockchain operations",
  "Linking Web3 protocols to contract triggers and actions",
  "Validating flow integrity across smart contract layers",
  "Preparing deployable contract architecture for review",
];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inset-0 bg-black flex items-center justify-center overflow-hidden w-full h-screen">
      <div className="relative z-10 text-center flex justify-center items-center flex-col p-32">
        {/* Circular gradient background behind logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="circular-gradient"></div>
        </div>

        {/* Animated Border Container */}
        <div
          className="relative border-container mb-8 z-20 rounded-full border-4 border-pink-200/20 border-solid"
          style={{ borderRadius: "50%" }}
        >
          {/* Animated SVG Logo */}
          <div
            className="logo-content p-16 rounded-full"
            style={{ borderRadius: "50%" }}
          >
            <svg
              width="120"
              height="120"
              viewBox="0 0 23 23"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto animate-pulse"
            >
              <rect
                y="3.95312"
                width="3.95312"
                height="15.0938"
                rx="0.71875"
                fill="#F08EEF"
                className="animate-pulse"
                style={{ animationDelay: "0s" }}
              />
              <rect
                x="3.95312"
                y="3.95312"
                width="3.95312"
                height="19.0469"
                rx="0.71875"
                transform="rotate(-90 3.95312 3.95312)"
                fill="#F08EEF"
                className="animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <rect
                x="3.95312"
                y="23"
                width="3.95312"
                height="15.0938"
                rx="0.71875"
                transform="rotate(-90 3.95312 23)"
                fill="#F08EEF"
                className="animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
              <rect
                x="19.0469"
                width="3.95312"
                height="19.0469"
                rx="0.71875"
                fill="#F08EEF"
                className="animate-pulse"
                style={{ animationDelay: "0.6s" }}
              />
              <rect
                x="19.1365"
                y="1.15991"
                width="3.95312"
                height="16.8059"
                rx="0.71875"
                transform="rotate(45 19.1365 1.15991)"
                fill="#F08EEF"
                className="animate-pulse"
                style={{ animationDelay: "0.8s" }}
              />
            </svg>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="text-white/70 text-sm font-medium mb-4 relative z-20">
          <span className="animate-pulse">Processing...</span>
        </div>

        {/* Cycling Text */}
        <div className="text-white/80 text-lg font-medium h-7 flex items-center justify-center relative z-20 font-mono">
          <span key={currentTextIndex} className="animate-fade-in-out">
             {loadingTexts[currentTextIndex]} 
          </span>
        </div>

        {/* AI-like scanning lines */}
        {/* <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-scan-vertical"></div>
          <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-pink-400 to-transparent animate-scan-horizontal"></div>
        </div> */}
      </div>

      <style jsx>{`
        /* Border Container with animated border */
        .border-container {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
        }

        .border-container::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 3px;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            #f08eef 90deg,
            #a855f7 180deg,
            #3b82f6 270deg,
            transparent 360deg
          );
          border-radius: 16px;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          animation: rotate-border 3s linear infinite;
        }

        .logo-content {
          position: relative;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 13px;
          backdrop-filter: blur(10px);
        }

        /* Alternative approach using multiple gradients for better browser support */
        .border-container::after {
          content: "";
          position: absolute;
          inset: 3px;
          background: linear-gradient(
                90deg,
                transparent 0%,
                #f08eef 25%,
                transparent 50%
              )
              top/100% 3px no-repeat,
            linear-gradient(0deg, transparent 0%, #a855f7 25%, transparent 50%)
              right/3px 100% no-repeat,
            linear-gradient(
                -90deg,
                transparent 0%,
                #3b82f6 25%,
                transparent 50%
              )
              bottom/100% 3px no-repeat,
            linear-gradient(
                180deg,
                transparent 0%,
                #f08eef 25%,
                transparent 50%
              )
              left/3px 100% no-repeat;
          border-radius: 13px;
          animation: border-chase 2s linear infinite;
          z-index: -1;
        }

        /* Circular gradient behind logo */
         {
          .circular-gradient {
            aspect-ratio: 1;
            height: 90%;
            background: radial-gradient(
              circle at center,
              rgba(255, 192, 203, 0.4) 0%,
              rgba(255, 192, 203, 0.1) 60%,
              rgba(255, 192, 203, 0.05) 80%,
              rgba(255, 192, 203, 0) 100%
            );
            border-radius: 50%;
            animation: pulse-glow 3s ease-in-out infinite alternate;
          }
        }

        @keyframes rotate-border {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes border-chase {
          0% {
            background-position: 0% 0, 100% 0%, 100% 100%, 0% 100%;
          }
          25% {
            background-position: 100% 0, 100% 0%, 100% 100%, 0% 100%;
          }
          50% {
            background-position: 100% 0, 100% 100%, 100% 100%, 0% 100%;
          }
          75% {
            background-position: 100% 0, 100% 100%, 0% 100%, 0% 100%;
          }
          100% {
            background-position: 100% 0, 100% 100%, 0% 100%, 0% 0%;
          }
        }

        @keyframes fade-in-out {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          20%,
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes scan-vertical {
          0% {
            transform: translateY(-100vh);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes scan-horizontal {
          0% {
            transform: translateX(-100vw);
          }
          100% {
            transform: translateX(100vw);
          }
        }

        @keyframes pulse-glow {
          0% {
            opacity: 0.6;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }

        .animate-scan-vertical {
          animation: scan-vertical 4s infinite linear;
        }

        .animate-scan-horizontal {
          animation: scan-horizontal 6s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
