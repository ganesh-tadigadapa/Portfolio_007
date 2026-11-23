export type Project = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tech: string[];
  href: string;
  website?: string;
  featured?: boolean;
  /** Optional cover image for project cards */
  cover?: string;
  /** Animated recording of the live site, played over the cover on hover */
  preview?: string;
  gradient: string;
};

export const projects: Project[] = [
  {
    slug: "zenkai",
    title: "Zenkai",
    date: "09.2026",
    description:
      "Pulls internships, hackathons, scholarships and certifications from 20+ official sources every 6 hours, dedupes them, and ranks each listing for every student with a 0-100 match score.",
    tech: ["Next.js", "TypeScript", "FastAPI", "Python", "PostgreSQL", "GitHub Actions"],
    href: "https://github.com/ganesh-tadigadapa/Zenkai",
    website: "https://getzenkai.vercel.app",
    featured: true,
    cover: "/assets/projects/zenkai.jpg",
    preview: "/assets/projects/zenkai.webp",
    gradient: "from-blue-500/25 via-indigo-500/15 to-violet-500/25",
  },
  {
    slug: "retinax",
    title: "RetinaX",
    date: "09.2026",
    description:
      "Diabetic retinopathy screening from fundus photos, built for Smart India Hackathon: ICDR severity grade, Grad-CAM explanations and a PDF report for doctors.",
    tech: ["TensorFlow", "FastAPI", "Python", "Next.js", "TypeScript", "Docker"],
    href: "https://github.com/ganesh-tadigadapa/retinaX",
    website: "https://retinexai.vercel.app",
    featured: true,
    cover: "/assets/projects/retinax.jpg",
    preview: "/assets/projects/retinax.webp",
    gradient: "from-red-500/20 via-rose-500/15 to-pink-500/20",
  },
  {
    slug: "vautify",
    title: "Vautify",
    date: "09.2026",
    description:
      "Distributed object store in Go with checksum-verified reads, self-healing repair, versioning and configurable partition quorums.",
    tech: ["Go", "Docker"],
    href: "https://github.com/ganesh-tadigadapa/vautify",
    website: "https://vault-store-865.netlify.app/",
    featured: true,
    cover: "/assets/projects/vautify.jpg",
    preview: "/assets/projects/vautify.webp",
    gradient: "from-blue-500/25 via-indigo-500/15 to-slate-500/20",
  },
  {
    slug: "lpu-nexus",
    title: "LPU Nexus",
    date: "11.2024",
    description:
      "One place for LPU students: campus services, food courts, a CGPA/SGPA calculator and a grade converter.",
    tech: ["JavaScript", "HTML", "CSS"],
    href: "https://github.com/ganesh-tadigadapa/lpu-nexus",
    website: "https://lpunexus.netlify.app/",
    featured: true,
    cover: "/assets/projects/lpu-nexus.jpg",
    preview: "/assets/projects/lpu-nexus.webp",
    gradient: "from-amber-500/20 via-orange-500/15 to-red-500/20",
  },
  {
    slug: "splitly",
    title: "Splitly",
    date: "05.2026",
    description:
      "Group expense splitter with AI: scan receipts, add expenses in plain English and ask a chatbot who owes what.",
    tech: ["React", "Node.js", "MongoDB", "Gemini"],
    href: "https://github.com/ganesh-tadigadapa/Splitly",
    website: "https://splitly-pied.vercel.app/",
    cover: "/assets/projects/splitly.jpg",
    preview: "/assets/projects/splitly.webp",
    gradient: "from-indigo-500/25 via-slate-500/15 to-fuchsia-500/20",
  },
  {
    slug: "snipex",
    title: "Snipex",
    date: "11.2026",
    description:
      "Convert up to 30 files at once (documents, slides, sheets, images, PDFs) across 110 format routes and download them as one zip.",
    tech: ["TypeScript", "FastAPI", "Python", "Docker"],
    href: "https://github.com/ganesh-tadigadapa/Snipex",
    website: "https://zekrom-09tu.onrender.com/",
    cover: "/assets/projects/snipex.jpg",
    preview: "/assets/projects/snipex.webp",
    gradient: "from-violet-500/25 via-purple-500/15 to-fuchsia-500/25",
  },
  {
    slug: "thread-visualize",
    title: "Thread Visualize",
    date: "12.2025",
    description:
      "Browser simulator that shows how an OS schedules threads on CPU cores and syncs them with semaphores and monitors.",
    tech: ["JavaScript", "HTML", "CSS"],
    href: "https://github.com/ganesh-tadigadapa/thread_visualize",
    website: "https://threadvisualize.netlify.app",
    cover: "/assets/projects/thread-visualize.jpg",
    preview: "/assets/projects/thread-visualize.webp",
    gradient: "from-slate-500/20 via-zinc-500/15 to-sky-500/20",
  },
];
