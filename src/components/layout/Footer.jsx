import { SiKofi, SiModrinth, SiCurseforge, SiDiscord } from "react-icons/si";

const LINKS = [
  {
    label: "zmoonmaru",
    href: null,
    icon: SiDiscord,
  },
  {
    label: "Ko-fi",
    href: "https://ko-fi.com/zmoonmaru",
    icon: SiKofi,
  },
  {
    label: "Modrinth",
    href: "https://modrinth.com/user/zmoonmaru",
    icon: SiModrinth,
  },
  {
    label: "CurseForge",
    href: "https://www.curseforge.com/members/zmoonmaru/",
    icon: SiCurseforge,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          Built by{" "}
          <span className="font-mono text-text-secondary">zmoonmaru</span> for
          the Cobblemon community. Nothing you upload here ever leaves your
          browser.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map(({ label, href, icon: Icon }) =>
            href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors"
              >
                <Icon size={14} />
                {label}
              </a>
            ) : (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs text-text-muted"
              >
                <Icon size={14} />
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
