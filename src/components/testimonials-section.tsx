import React from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Sarah M.",
    username: "@sarah_health",
    body: "Clara helped me understand my lab results when I was overwhelmed with medical jargon. Incredibly helpful!",
    img: "https://avatar.vercel.sh/sarahm",
  },
  {
    name: "David K.",
    username: "@david_k",
    body: "The mental health chatbot feature helped me manage my anxiety during a stressful period. Really impressed.",
    img: "https://avatar.vercel.sh/davidk",
  },
  {
    name: "Priya R.",
    username: "@priya_wellness",
    body: "As someone with a chronic condition, the ability to track my medical history in one place has been game-changing.",
    img: "https://avatar.vercel.sh/priyar",
  },
  {
    name: "Michael T.",
    username: "@michael_tech",
    body: "The telemedicine integration made it so easy to connect with my doctor when I couldn't travel. Amazing service!",
    img: "https://avatar.vercel.sh/michaelt",
  },
  {
    name: "Emily L.",
    username: "@emily_life",
    body: "I was skeptical about AI diagnosis, but Clara correctly identified my skin condition and suggested treatments.",
    img: "https://avatar.vercel.sh/emilyl",
  },
  {
    name: "Carlos V.",
    username: "@carlos_health",
    body: "The multilingual support means my grandmother can finally use a health app in her native language. Thank you!",
    img: "https://avatar.vercel.sh/carlosv",
  },
  {
    name: "Aisha J.",
    username: "@aisha_j",
    body: "Clara explained my X-ray results in simple terms and helped me prepare questions for my doctor. Invaluable!",
    img: "https://avatar.vercel.sh/aishaj",
  },
  {
    name: "Thomas W.",
    username: "@tom_wellness",
    body: "I've tried many health apps, but Clara's AI accuracy and user-friendly design is unmatched. Highly recommend!",
    img: "https://avatar.vercel.sh/thomasw",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4 mx-2",
        "border-gray-800/50 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors duration-300",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt={`Avatar of ${name}`} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-blue-400">{username}</p>
        </div>
      </div>
      <blockquote className="mt-3 text-sm text-gray-300">{body}</blockquote>
    </figure>
  );
};

export function TestimonialsSection() {
  return (
    <section className="w-full py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            What our <span className="text-blue-300">users</span> are saying
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of people who trust Clara with their health and wellness journey.
          </p>
        </div>
      </div>
      
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden gap-6">
        <Marquee pauseOnHover className="[--duration:30s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:30s]">
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-black"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-black"></div>
      </div>
    </section>
  );
} 