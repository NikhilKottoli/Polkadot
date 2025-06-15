import { Button } from "@/components/ui/button";

export function CTASection({
  title,
  description,
  image,
  link,
  buttonText = "Get Started",
  layout = "left",
  number = 1,
}) {
  const isImageLeft = layout === "left";
  const backgroundStyle = `
  .bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 180%;
    height: 100%;
    background-image: 
      linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
    z-index: 1;
  }

  .content {
    position: relative;
    z-index: 2;
  }
`;

  return (
    <main
      className="min-h-[50vh]  max-w-7xl rounded-4xl border border-white/10 overflow-hidden relative p-0 mx-auto"
      style={{
        position: "relative",
        padding: "0",
        background: "radial-gradient(circle at center, #480048, #00000012)",
      }}
    >
      <p
        className={`absolute bottom-[-180px] font-extrabold text-[400px]  z-10 opacity-10 ${
          !isImageLeft ? "left-0" : "right-0"
        } text-white`}
      >
        {number}
      </p>
      <style jsx global>
        {backgroundStyle}
      </style>
      <div className="bg-pattern w-[100%] h-full"></div>
      <div className=" w-full block h-full ">
        <div className="w-full mx-auto z-5 ">
          <div
            className={`flex flex-col lg:flex-row items-center gap-12 ${
              !isImageLeft ? "" : "lg:flex-row-reverse"
            }`}
          >
            {/* Content Side */}
            <div className="flex-1 text-center lg:text-left h-full z-10  max-w-[50%] p-16 flex justify-center  flex-col mt-26">
              <h1 className="text-2xl sm:text-5xl lg:text-4xl font-bold mb-6 text-white">
                {title}
              </h1>
              <p className="text-lg sm:text-xl lg:text-lg mb-8 text-white/60 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Image Side - Positioned absolutely */}
            <div
              className={`absolute  ${
                isImageLeft ? "bottom-0 left-0" : "bottom-0 right-0"
              } w-1/2 h-6/7`}
            >
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-[#9f00b3]/20 to-purple-500/20 blur-xl"></div>
                <img
                  src={image || "/placeholder.svg"}
                  pink-500
                  alt={title}
                  className={`relative w-full h-full object-cover shadow-2xl  border-white/10 border-12 border-b-0 ${
                    isImageLeft
                      ? "rounded-tr-4xl border-l-0" // Top-right rounded when image is on left
                      : "rounded-tl-4xl border-r-0" // Top-left rounded when image is on right
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
