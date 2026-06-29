import Link from "next/link";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Circle, Clock3 } from "lucide-react";

export const ds = {
  navy: "#0A1A3F",
  blue: "#1B3FA0",
  yellow: "#F2C200",
  silver: "#C7CDD6",
  canvas: "#F5F7FB",
  ink: "#0A1A3F",
  muted: "#66718F"
};

type Tone = "blue" | "yellow" | "green" | "red" | "silver" | "navy";

const toneStyles: Record<Tone, string> = {
  blue: "bg-[#EAF0FF] text-[#1B3FA0] ring-[#C8D8FF]",
  yellow: "bg-[#FFF5C7] text-[#745E00] ring-[#F7DC67]",
  green: "bg-[#EAF8F0] text-[#17833F] ring-[#BDECCB]",
  red: "bg-[#FFF0F0] text-[#B42318] ring-[#FFD0D0]",
  silver: "bg-[#F3F6FA] text-[#56617D] ring-[#DDE3EC]",
  navy: "bg-[#E8EDF8] text-[#0A1A3F] ring-[#C7CDD6]"
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-[#E2E7F0] pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1B3FA0]">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0A1A3F] md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#66718F]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function Card({
  children,
  className,
  padded = true,
  id
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        "rounded-[18px] border border-[#DDE3EC] bg-white shadow-[0_18px_55px_rgba(10,26,63,0.08)]",
        padded && "p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  action,
  caption
}: {
  title: string;
  action?: React.ReactNode;
  caption?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[#101828]">{title}</h2>
        {caption ? <p className="mt-1 text-sm font-medium text-[#66718F]">{caption}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  href,
  className
}: {
  children: React.ReactNode;
  variant?: "primary" | "cta" | "secondary" | "ghost" | "dark";
  href?: string;
  className?: string;
}) {
  const classes = clsx(
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition",
    variant === "primary" && "bg-[#1B3FA0] text-white shadow-[0_14px_28px_rgba(27,63,160,0.22)] hover:bg-[#143486]",
    variant === "cta" && "bg-[#F2C200] text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.28)] hover:brightness-95",
    variant === "secondary" && "border border-[#C7CDD6] bg-white text-[#0A1A3F] hover:bg-[#F7F9FC]",
    variant === "ghost" && "text-[#1B3FA0] hover:bg-[#EAF0FF]",
    variant === "dark" && "bg-[#0A1A3F] text-white hover:bg-[#06112A]",
    className
  );

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}

export function Badge({ children, tone = "blue" }: { children: React.ReactNode; tone?: Tone }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-black ring-1", toneStyles[tone])}>
      {children}
    </span>
  );
}

export function IconTile({ icon: Icon, tone = "blue" }: { icon: LucideIcon; tone?: Tone }) {
  return (
    <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", toneStyles[tone])}>
      <Icon size={20} />
    </span>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "blue",
  trend
}: {
  label: string;
  value: string;
  detail: string;
  icon?: LucideIcon;
  tone?: Tone;
  trend?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-[#0A1A3F]">{value}</p>
        </div>
        {icon ? <IconTile icon={icon} tone={tone} /> : null}
      </div>
      <p className="mt-3 text-sm font-medium leading-5 text-[#66718F]">{detail}</p>
      {trend ? <p className="mt-3 text-xs font-black text-[#17833F]">{trend}</p> : null}
    </Card>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "yellow" | "green" }) {
  const fill = tone === "yellow" ? "bg-[#F2C200]" : tone === "green" ? "bg-[#25B44B]" : "bg-[#1B3FA0]";
  return (
    <div className="h-3 overflow-hidden rounded-full bg-[#E2E9F5]">
      <div className={clsx("h-full rounded-full", fill)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function ActivityItem({
  icon,
  title,
  detail,
  meta,
  tone = "blue"
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
  meta?: string;
  tone?: Tone;
}) {
  return (
    <div className="grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-[#E8ECF3] py-3 last:border-0">
      <IconTile icon={icon} tone={tone} />
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-[#0A1A3F]">{title}</p>
        <p className="mt-0.5 truncate text-xs font-medium text-[#66718F]">{detail}</p>
      </div>
      {meta ? <span className="text-xs font-bold text-[#66718F]">{meta}</span> : null}
    </div>
  );
}

export function Timeline({
  items
}: {
  items: Array<{ title: string; detail: string; state?: "done" | "active" | "queued"; meta?: string }>;
}) {
  return (
    <div className="grid gap-0">
      {items.map((item) => (
        <div className="grid grid-cols-[32px_1fr_auto] gap-3 border-b border-[#E8ECF3] py-3 last:border-0" key={item.title}>
          <span className="pt-0.5">
            {item.state === "done" ? (
              <CheckCircle2 className="text-[#25B44B]" size={20} />
            ) : item.state === "active" ? (
              <Clock3 className="text-[#F2C200]" size={20} />
            ) : (
              <Circle className="text-[#AAB4C6]" size={20} />
            )}
          </span>
          <div>
            <p className="text-sm font-black text-[#0A1A3F]">{item.title}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#66718F]">{item.detail}</p>
          </div>
          {item.meta ? <span className="text-xs font-bold text-[#66718F]">{item.meta}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function ObjectList({
  items
}: {
  items: Array<{ title: string; detail: string; value?: string; badge?: string; tone?: Tone; icon?: LucideIcon }>;
}) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-3"
          key={`${item.title}-${item.detail}`}
        >
          {item.icon ? <IconTile icon={item.icon} tone={item.tone ?? "blue"} /> : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#0A1A3F]">{item.title}</p>
            <p className="mt-1 truncate text-xs font-medium text-[#66718F]">{item.detail}</p>
          </div>
          {item.value ? <span className="text-lg font-black text-[#1B3FA0]">{item.value}</span> : null}
          {item.badge ? <Badge tone={item.tone ?? "blue"}>{item.badge}</Badge> : null}
        </div>
      ))}
    </div>
  );
}

export function ShellGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6">{children}</div>;
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="inline-flex items-center gap-1 text-sm font-black text-[#1B3FA0]" href={href}>
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}
