import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-lg font-semibold tracking-tight">
            GATHER
          </div>
          <p className="mt-1 max-w-sm text-sm text-muted">
            One experience is a story. Thousands become a pattern.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <Link href="/share" className="hover:text-pen">
            Share an experience
          </Link>
          <Link href="/insights" className="hover:text-pen">
            Insights
          </Link>
          <Link href="/insights/explore" className="hover:text-pen">
            Explore
          </Link>
          <Link href="/about" className="hover:text-pen">
            About
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-muted">
        GATHER is anonymous by design. No names, no profiles, no doxxing.
        Just patterns.
      </p>
    </footer>
  );
}
