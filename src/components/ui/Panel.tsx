import clsx from "clsx";

export function Panel({
  icon,
  title,
  desc,
  tone = "ink",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  tone?: "ink" | "accent";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={clsx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
            tone === "accent" ? "bg-accent text-white" : "bg-ink text-white",
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">
            {title}
          </p>
          {desc && <p className="mt-0.5 text-xs text-ink-soft">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
