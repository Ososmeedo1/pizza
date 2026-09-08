import {cn} from "@/lib/utils";

function ContactCard({
  icon,
  title,
  children,
  href = null,
  external = false,
}) {
  const sharedClasses = cn(
    "rounded-2xl border border-border bg-surface p-6 shadow-soft",
    href &&
      "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:shadow-clay"
  );

  const content = (
    <>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-brand">
        {icon}
      </div>
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </>
  );

  if (href) {
    const linkProps = external
      ? {target: "_blank", rel: "noopener noreferrer"}
      : {};
    return (
      <a href={href} className={sharedClasses} {...linkProps}>
        {content}
      </a>
    );
  }

  return <div className={sharedClasses}>{content}</div>;
}

export {ContactCard};