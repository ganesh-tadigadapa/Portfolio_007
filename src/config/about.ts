import { heroConfig } from "@/config/hero";

/**
 * Everything on the About page. Sourced from Ganesh's resume (Nov 2026) and projects.
 * (The phone number on the resume is deliberately not published here.)
 */
export const aboutConfig = {
  headline: ["From college assignments", "to systems that ship."],
  intro:
    "I'm Ganesh Tadigadapa — a **Computer Science & Engineering** student at Lovely Professional University who builds things **end to end**: full-stack products, the **cloud infrastructure** they run on, and the **pipelines that ship them**.",
  quote:
    "Most of my projects start with something that annoyed me. If I keep running into the same problem, I'd rather build the fix than wait for one.",

  stats: [
    { value: "7.92", label: "CGPA · B.Tech CSE" },
    { value: "3", label: "Oracle certifications" },
    { value: "200+", label: "DSA problems solved" },
    { value: "1st", label: "DRIVe Dev hackathon" },
  ],

  meta: [
    { label: "Location", value: heroConfig.location },
    { label: "Status", value: "Open to opportunities" },
    { label: "Focus", value: "Full-stack · Cloud · DevOps · Applied AI" },
  ],

  story: {
    title: "How it started",
    paragraphs: [
      "My first projects were small web apps for people around me — **LPU Nexus**, a one-stop page for campus services and a CGPA calculator. They taught me that something simple and useful beats something clever that nobody opens.",
      "Coursework pushed me deeper. A cloud assignment became a full **AWS** deployment — a Node.js portal on **EC2** behind an **Application Load Balancer**, **RDS** and **S3**, Auto Scaling from 2 to 6 instances, all provisioned as code with **CloudFormation**.",
      "For **Smart India Hackathon** I built **RetinaX**, an explainable diabetic-retinopathy screening system: a model that grades fundus images (0–4) with **92% accuracy**, **Grad-CAM** heatmaps, an ICDR rule cross-check that flags uncertain cases for doctor review, and support in four languages.",
      "Now I'm building **Zenkai**, which pulls internships, hackathons and scholarships from **20+ official sources** every 6 hours, dedupes them with SHA-256 fingerprints and ranks each one for every student with a 100-point matching engine.",
    ],
  },

  skills: [
    { group: "Languages", items: ["C++", "Python", "TypeScript", "JavaScript", "C", "SQL"] },
    { group: "Frontend", items: ["React.js", "Next.js", "Tailwind CSS", "HTML5", "CSS3"] },
    { group: "Backend", items: ["FastAPI", "REST APIs", "Node.js"] },
    { group: "Databases", items: ["PostgreSQL", "MySQL", "Oracle Database"] },
    {
      group: "Cloud & DevOps",
      items: ["AWS", "Linux", "Bash", "Docker", "GitHub Actions", "Git", "Vercel", "Render"],
    },
    {
      group: "Core CS",
      items: ["Data Structures & Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks"],
    },
  ],

  journey: {
    title: "Journey",
    items: [
      {
        date: "Oct 2026",
        title: "Zenkai — opportunity aggregator",
        detail:
          "Full-stack platform collecting opportunities from 20+ sources, refreshed every 6 hours by GitHub Actions cron jobs.",
        href: "https://getzenkai.vercel.app",
      },
      {
        date: "Sep – Oct 2026",
        title: "Three Oracle certifications",
        detail: "OCI Architect Associate, Agentic AI Foundations Associate and AI Database Foundations Associate.",
      },
      {
        date: "Aug – Sep 2026",
        title: "RetinaX — explainable AI for diabetic retinopathy",
        detail:
          "Retinal screening with Grad-CAM, an ICDR cross-check, kiosk mode, WhatsApp PDF reports and a hospital finder. Docker + CI with pytest.",
        href: "https://github.com/ganesh-tadigadapa/retinaX",
      },
      {
        date: "Jun – Jul 2026",
        title: "Data Structures & Algorithms training — LPU",
        detail:
          "50-hour summer programme: arrays, linked lists, stacks, queues and trees, sorting and searching, and complexity analysis.",
        href: "https://drive.google.com/file/d/1B1dK9MaXiUvDy9VWa2wpdmgYL8HC58xA/view",
      },
      {
        date: "Apr 2026",
        title: "Student assignment system on AWS",
        detail:
          "EC2 behind an ALB, RDS and S3, Auto Scaling 2–6 with CloudWatch alarms in a custom VPC — all as CloudFormation.",
        href: "https://github.com/ganesh-tadigadapa/assignment_aws",
      },
      {
        date: "Aug 2024",
        title: "Started B.Tech CSE at LPU",
        detail: "Where most of these projects began — as assignments I didn't want to stop at the demo.",
      },
    ],
  },

  certifications: [
    {
      name: "Oracle Cloud Infrastructure Certified Architect Associate",
      issuer: "Oracle",
      date: "Oct 2026",
      href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=2B9ACC82F145F44A0BB350EB58C7EC3A202D22C53CCE2E09B858FCF8314CA488",
    },
    {
      name: "Agentic AI Certified Foundations Associate",
      issuer: "Oracle",
      date: "Oct 2026",
      href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=95119DBE16ECF872D2F83999A8DD136C0ADBF5F434330EB546EB8D5B99C85840",
    },
    {
      name: "Oracle AI Database Certified Foundations Associate",
      issuer: "Oracle",
      date: "Sep 2026",
      href: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=5A42F4D72A683335248C181FD50758414CF1318CA68E4138C8E5C058FA4B44D2",
    },
  ],

  achievements: [
    { title: "DRIVe Dev — 1st Place", detail: "Hackathon winner" },
    { title: "CODE STORM — Finalist", detail: "Among 200+ teams" },
    { title: "200+ DSA problems", detail: "LeetCode, GeeksforGeeks and more, in C++" },
    { title: "NTSE Stage 1", detail: "National Talent Search Examination, NCERT" },
  ],

  education: [
    {
      school: "Lovely Professional University",
      degree: "B.Tech — Computer Science & Engineering",
      score: "CGPA 7.92",
      place: "Punjab, India",
      dates: "Aug 2024 – Present",
    },
    {
      school: "Sri Chaitanya College",
      degree: "Intermediate",
      score: "95%",
      place: "Hyderabad, Telangana",
      dates: "Apr 2022 – Mar 2024",
    },
    {
      school: "Sri Chaitanya Techno School",
      degree: "Matriculation",
      score: "100%",
      place: "Hyderabad, Telangana",
      dates: "Apr 2021 – Mar 2022",
    },
  ],

  principles: {
    title: "How I work",
    items: [
      {
        title: "Build the fix",
        description:
          "Zenkai, Zekrom and Splitly all started as things that annoyed me. Real problems make better projects.",
      },
      {
        title: "Go past the demo",
        description:
          "A model is the easy part — quality gates, explanations and a doctor-review path are what make RetinaX usable.",
      },
      {
        title: "Be honest about the data",
        description:
          "Show where information came from, check model output before trusting it, and respect robots.txt and rate limits.",
      },
      {
        title: "Ship it properly",
        description:
          "CI, Docker, infrastructure as code and a live URL. A project isn't done until someone else can use it.",
      },
    ],
  },

  connectLinks: [
    { name: "Email", href: "mailto:ganeshtadigadapa1@gmail.com", icon: "mail" as const },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/ganesh-tadigadapa", icon: "linkedin" as const },
    { name: "GitHub", href: "https://github.com/ganesh-tadigadapa", icon: "github" as const },
  ],
};
