export const headerNav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
] as const;

export const commandItems = [
  ...headerNav.map((item) => ({ label: item.label, href: item.href })),
  { label: "GitHub", href: "https://github.com/ganesh-tadigadapa", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ganesh-tadigadapa", external: true },
  { label: "Email", href: "mailto:ganeshtadigadapa1@gmail.com", external: true },
];
