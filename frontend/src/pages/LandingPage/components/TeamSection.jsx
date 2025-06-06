import { Link } from "react-router-dom";

const members = [
  {
    name: "Sahil Mengji",
    role: "Frontend Developer & UI/UX Designer",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQEQw0PE8p3m0w/profile-displayphoto-shrink_200_200/B56ZTJ7BzqHwAc-/0/1738554482887?e=1754524800&v=beta&t=O7AWHxz2uaRpQcao_9k_nQ1hndCuy40crhwHfRPJKew",
    link: "#",
  },
  {
    name: "Nikhil Kottoli",
    role: "WEB3  & Blockchain Enthusiast",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQFWknQQgEMbDQ/profile-displayphoto-shrink_200_200/B56ZZEQ_8RGoAY-/0/1744902029497?e=1754524800&v=beta&t=rIlgawWLql0Sa39KiiBMKZrfIWxJc5ICiXTd4EMEkrA",
    link: "#",
  },
  {
    name: "Abhijith Sogal",
    role: "Backend Developer ",
    avatar:
      "https://media.licdn.com/dms/image/v2/D5603AQFLoyVAn0aPuw/profile-displayphoto-shrink_200_200/B56ZY_o.psH0AY-/0/1744824430047?e=1754524800&v=beta&t=__mOP0LXBP0yEQHWhLr-GpfSuQU9VN2EFCTbhaSvzg4",
    link: "#",
  },
];

export default function TeamSection() {
  return (
    <section className="b py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-5xl border-t px-6">
        <span className="text-caption -ml-6 -mt-3.5 block w-max bg-gray-50 px-6 dark:bg-gray-950 text-[#130515]">
          Team
        </span>
        <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
          <div className="sm:w-2/5">
            <h2 className="text-3xl font-bold sm:text-4xl">Our Team</h2>
          </div>
          <div className="mt-6 sm:mt-0">
            <p>
              Diverse talents, united by a passion for building innovative
              solutions. Our team combines expertise in frontend development,
              UI/UX design, and blockchain technology to create seamless
              experiences.
            </p>
          </div>
        </div>
        <div className="mt-12 md:mt-24">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => (
              <div key={index} className="group overflow-hidden">
                <img
                  className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                  src={member.avatar}
                  alt="team member"
                  width="826"
                  height="1239"
                />
                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-title text-base font-medium transition-all duration-500 group-hover:tracking-wider">
                      {member.name}
                    </h3>
                    <span className="text-xs">_0{index + 1}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {member.role}
                    </span>
                    <Link
                      href={member.link}
                      className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      {" "}
                      LinkedIn
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
