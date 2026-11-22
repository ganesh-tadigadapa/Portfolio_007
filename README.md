# Ganesh Tadigadapa — Portfolio

My personal portfolio: projects, tech stack, GitHub activity and a bit about me. Built with Next.js 15, TypeScript and Tailwind CSS v4.

**GitHub:** [@ganesh-tadigadapa](https://github.com/ganesh-tadigadapa) · **LinkedIn:** [ganesh-tadigadapa](https://www.linkedin.com/in/ganesh-tadigadapa)

## Pages

| Page | Path |
|------|------|
| Home: hero, tech stack, featured projects, GitHub activity, quote and visitor count | `/` |
| About | `/about` |
| Projects | `/projects` |
| Project detail | `/projects/[slug]` |

There's also a command palette (`⌘K` / `Ctrl+K`) and a light/dark theme toggle.

## Running it

Needs Node.js 18+.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # run the production build
```

## Editing content

Almost everything lives in `src/config/`:

| File | What's in it |
|------|--------------|
| `hero.ts` | Name, bio, email, location, social links |
| `meta.ts` | Site title, description, URL, GitHub username |
| `about.ts` | About page story, principles and links |
| `projects.ts` | Project cards (GitHub link, live link, cover, tech) |
| `tech-stack.ts` | Home page tech icons |
| `quote.ts` | Quote and the rotating titles under my name |
| `navigation.ts` | Header, footer and command palette links |

- **Project covers:** put images in `public/assets/projects/` and set `cover` in `projects.ts`.
- **Long project write-ups (optional):** add `content/projects/<slug>.mdx` with `title`, `description`, `date` and `tech` front matter.
- **Tech icons:** come from [Simple Icons](https://simpleicons.org/). Map new names in `src/lib/tech-icons.ts`.

## Visitor counter

Locally the count is stored in `data/visitors.json`. Serverless hosts like Vercel have a read-only filesystem, so in production add an [Upstash Redis](https://upstash.com/) database and set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without them the card just says "Thanks for visiting."

## Deploying

Works on Vercel or any Node.js host. After deploying, set `url` in `src/config/meta.ts` to the real domain so the sitemap and share previews use it.

## Credits

Based on the MIT-licensed portfolio template by [Priyanshu Urmaliya](https://github.com/GitHpriyanshu23). See `LICENSE`.
