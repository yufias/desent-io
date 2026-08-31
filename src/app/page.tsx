export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          desent-io
        </h1>
        <p className="mt-4 text-lg text-black/60 dark:text-white/60">
          Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript
        </p>

        <p className="mt-8 text-black/70 dark:text-white/70">
          Edit{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            src/app/page.tsx
          </code>{" "}
          to get started. Styles live in{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            src/app/globals.css
          </code>
          .
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js docs
          </a>
          <a
            className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Tailwind docs
          </a>
        </div>
      </div>
    </main>
  );
}
