import { LogsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";

// Integration config using image sources
const integrations = [
  { img: "/cryptoLogos/1.svg", label: "Zapier", color: "text-yellow-500" },
  { img: "/cryptoLogos/2.svg", label: "Metamask", color: "text-orange-500" },
  { img: "/cryptoLogos/3.svg", label: "Chainlink", color: "text-blue-500" },
  { img: "/cryptoLogos/4.svg", label: "Uniswap", color: "text-pink-500" },
  { img: "/cryptoLogos/5.svg", label: "The Graph", color: "text-purple-500" },
  { img: "/cryptoLogos/6.svg", label: "IPFS", color: "text-green-500" },
];

export default function IntegrationsSection() {
  return (
    <section className="mt-[-250px] z-[400]">
      <div className="pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="bg-muted/25 group  mx-auto max-w-[22rem] items-center justify-between space-y-6 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] sm:max-w-md scale-200 relative top-[-98px]">
            <div
              role="presentation"
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"
            ></div>

            {[false, true, false].map((reverse, idx) => (
              <div key={idx}>
                <InfiniteSlider
                  gap={24}
                  speed={20}
                  speedOnHover={10}
                  reverse={reverse}
                >
                  {integrations.map(({ img, label, color }, i) => (
                    <IntegrationCard key={i} className={color}>
                      <img
                        src={img}
                        alt={label}
                        className="w-5 h-5 object-contain"
                      />
                    </IntegrationCard>
                  ))}
                </InfiniteSlider>
              </div>
            ))}

            <div className="absolute inset-0 m-auto flex size-fit justify-center gap-2">
              <IntegrationCard
                className="shadow-black-950/10 size-16 bg-black/75 shadow-xl backdrop-blur-md backdrop-grayscale dark:border-white/10 dark:shadow-white/15"
                isCenter={true}
              >
                <img className="w-8 h-8" src="/logo.svg" />
              </IntegrationCard>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-lg space-y-6 text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl z-[40]">
              Connect your Web3 tools effortlessly
            </h2>
            <p className="text-muted-foreground">
              Polkaflow bridges your dApps, wallets, and protocols into seamless
              automation flows. No code. Pure power.
            </p>

            <Button variant="outline" size="sm" asChild>
              <Link href="#">Start Automating</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({ children, className, isCenter = false }) => {
  return (
    <div
      className={cn(
        "bg-[#2c062c] relative z-20 flex size-12 rounded-full border",
        className
      )}
    >
      <div className={cn("m-auto", isCenter ? "w-8 h-8" : "w-5 h-5")}>
        {children}
      </div>
    </div>
  );
};
