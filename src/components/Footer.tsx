export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} JerseyGen. All rights reserved.</p>
        <p>Made with AI · Designed for football lovers.</p>
      </div>
    </footer>
  );
}
