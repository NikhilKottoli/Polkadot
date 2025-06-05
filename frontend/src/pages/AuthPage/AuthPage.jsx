import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        navigate("/dashboard");
      } else {
        alert(
          "MetaMask is not installed. Please install MetaMask to continue."
        );
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 hidden h-screen w-2/3 object-cover object-left lg:block  p-8 pr-0">
        <div
          className="h-full w-full object-cover rounded-l-4xl pt-16 pl-16 bg-[#252525]"
          style={{
            background: `url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuiNqnxLAfkAe-dg-wExzjpMUfusobXHMSwA&s")`,
            backgroundRepeat: "no-repeat",
            objectFit: "cover",
            backgroundSize: "cover",
          }}
        >
          <img
            src="/screenshot.png"
            alt="Login illustration"
            className="bg-black h-full w-full object-cover rounded-tl-4xl object-left border-white/20 border-t-6 border-l-6 "
          />
        </div>
      </div>

      <main className="relative z-10 mx-auto h-screen px-6 py-12 lg:grid lg:w-screen lg:max-w-full lg:grid-cols-2 lg:gap-32 lg:px-0 flex items-center ">
        <div className="w-full  px-32">
          <div className="w-[400px] ">
            <div>
              <img src="logo.svg" className="w-18" />
            </div>
            <div className="mb-1 mt-6 text-3xl  text-gray-100">
              Welcome to <span className="font-black">Polkaflow</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your wallet to continue.
            </p>

            <div className="mt-8 group">
              <Button
                onClick={connectWallet}
                variant="outline"
                className="w-full flex  text-sm  h-32 flex-col px-0 pr-4 cursor-pointer bg-white/2 rounded-xl hover:bg-[#0f0f0f] "
              >
                <Button
                  variant="outline"
                  className="w-full flex  text-sm  h-32 flex-col px-0 pr-2 group-hover:pr-4  cursor-pointer bg-white/2 rounded-xl hover:bg-[#0f0f0f]"
                >
                  <Button
                    variant="outline"
                    className="w-full flex  text-sm  h-32 flex-col px-0 pr-4 relative p-2 cursor-pointer bg-[#191919] rounded-xl scale-105 translate-x-2"
                  >
                    <div className="border border-dashed border-white/20 w-full h-full flex gap-4 justify-center items-center cursor-pointer rounded-lg">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
                        className="w-16 h-16"
                      />
                      <p className="text-left">
                        Continue with <br /> MetaMask
                      </p>
                      <ArrowUpLeftIcon
                        size={32}
                        className="rotate-90 scale-[2] opacity-45"
                      />
                    </div>
                  </Button>
                </Button>
              </Button>
            </div>

            <div className="mt-8">
              <div className="relative flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  Or connect with other wallets
                </span>
                <Separator className="flex-1" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 text-sm py-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12h8M12 8v8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                WalletConnect
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 text-sm py-3"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                Coinbase Wallet
              </Button>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
              New to Web3?{" "}
              <a className="text-blue-300 underline" href="/learn-more">
                Learn about wallets
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
