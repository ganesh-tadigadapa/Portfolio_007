
/**
 * Everything on the About page. Sourced from Ganesh's resume (Nov 2026) and projects.
 * (The phone number on the resume is deliberately not published here.)
 */
export const aboutConfig = {
  headline: ["From college assignments", "to systems that ship."],
  intro:
    "I'm Ganesh Tadigadapa — a **Computer Science & Engineering** student at Lovely Professional University who builds things **end to end**: full-stack products, the **cloud infrastructure** they run on, and the **pipelines that ship them**.",
  stats: [
    { value: "7.92", label: "CGPA · B.Tech CSE" },
    { value: "3", label: "Oracle certifications" },
    { value: "200+", label: "DSA problems solved" },
    { value: "1st", label: "DRIVe Dev hackathon" },
  ],

  story: {
    title: "How I got here",
    paragraphs: [
      "I started with small web apps for people around me, then coursework pushed me into the cloud — a full **AWS** deployment with load balancing, Auto Scaling, RDS and S3, provisioned as code with **CloudFormation**.",
      "For **Smart India Hackathon** I built **RetinaX**, an explainable diabetic-retinopathy screening system (**92% accuracy**, Grad-CAM, doctor-review flags). Now I'm building **Zenkai**, which ranks opportunities from **20+ sources** for every student.",
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

};
