import { heroConfig } from "@/config/hero";

export const aboutConfig = {
  headline: ["From college assignments", "to systems that ship."],
  intro:
    "I'm Ganesh Tadigadapa — a **Computer Science student** at Lovely Professional University who likes building things **end to end**: a backend that does the real work, a frontend people actually enjoy using, and the **pipeline that ships it**.",
  quote:
    "Most of my projects start with something that annoyed me. If I keep running into the same problem, I'd rather build the fix than wait for one.",
  traits: ["Curious", "Builder", "Focused", "Persistent"] as const,
  traitStyles: {
    Curious:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300",
    Builder:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300",
    Focused:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300",
    Persistent:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/40 dark:text-violet-300",
  },
  meta: [
    { label: "Location", value: heroConfig.location },
    { label: "Status", value: "Open to opportunities" },
    { label: "Focus", value: "Full-stack · Cloud · DevOps" },
  ],
  story: {
    title: "How it started",
    paragraphs: [
      "My first projects were small web apps for people around me — **LPU Nexus**, a one-stop page for campus services and a CGPA calculator, and a movie search site for Telugu, Hindi and Tamil films. They taught me that something simple and useful beats something clever that nobody opens.",
      "Coursework pushed me deeper. An OS class turned into **Thread Visualize**, a simulator for thread scheduling and semaphores. A cloud computing assignment became a full **AWS** setup with a load balancer, Auto Scaling, RDS, S3, Lambda and CloudFormation — because putting one server on EC2 didn't feel like learning anything.",
      "For **Smart India Hackathon** I built **RetinaX**, a diabetic retinopathy screening tool: a CNN that grades fundus photos, Grad-CAM explanations, and a PDF report a doctor can check. It showed me how much work sits around a model — quality checks, calibration, and an interface people can trust.",
      "Lately most of my time goes into **cloud, DevOps and distributed systems**: **Vautify**, an object store in Go that verifies every byte and repairs itself, and **Zenkai**, which pulls student opportunities from 20+ sources every 6 hours on GitHub Actions.",
    ],
  },
  principles: {
    title: "How I work",
    items: [
      {
        title: "Build the fix",
        description:
          "Zenkai, Zekrom, NightShift and Splitly all started as things that annoyed me. Real problems make better projects.",
      },
      {
        title: "Go past the demo",
        description:
          "Replication is easy; repairing corrupt replicas is the interesting part. I like working through the hard edge cases.",
      },
      {
        title: "Be honest about the data",
        description:
          "Show where information came from, check model output before trusting it, and never return bytes you can't verify.",
      },
      {
        title: "Ship it properly",
        description:
          "CI, Docker, sensible auth and a live URL. A project isn't done until someone else can use it.",
      },
    ],
  },
  beyond: {
    title: "Beyond the code",
    paragraphs: [
      "I practise **DSA in C++** every day — LeetCode and the Striver sheet — and even built a Chrome extension that commits my accepted solutions to GitHub automatically.",
      "I'm always looking for the next thing to learn, and I like **learning in public** by keeping my work open on GitHub.",
    ],
  },
  connectLinks: [
    {
      name: "Email",
      href: "mailto:ganeshtadigadapa1@gmail.com",
      icon: "mail" as const,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/ganesh-tadigadapa",
      icon: "linkedin" as const,
    },
    {
      name: "GitHub",
      href: "https://github.com/ganesh-tadigadapa",
      icon: "github" as const,
    },
  ],
};
