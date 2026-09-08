import Image from "next/image";
import {getLocale, getTranslations} from "next-intl/server";
import {ArrowRight, Pizza, Sparkles} from "lucide-react";
import {Link} from "@/i18n/navigation";

const RING_TEXT = "STONE-BAKED • FRESH DOUGH • CAIRO • PIZZATO • ";
const RING_RADIUS = 88;
const RING_DOTS = 16;

async function HeroRing() {
  const locale = await getLocale();
  const isArabic = locale === "ar";

  return (
    <div
      aria-hidden="true"
      className="animate-hero-spin pointer-events-none absolute -inset-7 z-0 aspect-square lg:-inset-10"
    >
      {isArabic ? (
        <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
          {Array.from({length: RING_DOTS}).map((_, index) => {
            const angle = (index / RING_DOTS) * Math.PI * 2;
            const x = 100 + RING_RADIUS * Math.cos(angle);
            const y = 100 + RING_RADIUS * Math.sin(angle);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                className="fill-primary dark:fill-primary-bright"
              />
            );
          })}
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
          <defs>
            <path
              id="pizzato-hero-ring"
              d="M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0"
              fill="none"
            />
          </defs>
          <text
            x="50%"
            fontSize="11"
            fontWeight="800"
            letterSpacing="2"
            className="fill-primary dark:fill-primary-bright"
          >
            <textPath href="#pizzato-hero-ring" startOffset="0%">
              {RING_TEXT}
            </textPath>
          </text>
        </svg>
      )}
    </div>
  );
}

async function HeroVisual({heroImages = []}) {
  const primary = heroImages[0] ?? null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px] lg:max-w-[420px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <HeroRing />
      <div className="relative z-10 aspect-square w-full rotate-2 overflow-hidden rounded-full border-8 border-surface bg-muted shadow-clay-xl">
        {primary ? (
          <Image
            src={primary.url}
            alt={primary.alt || ""}
            fill
            priority
            sizes="(max-width: 1024px) 260px, 420px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Pizza className="h-16 w-16 text-primary-bright" />
          </div>
        )}
      </div>
    </div>
  );
}

function MarqueeBand({items = []}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden bg-primary py-3 text-primary-foreground">
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((copyIndex) => (
          <ul
            key={copyIndex}
            aria-hidden={copyIndex === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center whitespace-nowrap text-caption font-extrabold uppercase tracking-widest"
              >
                <span className="ps-6 sm:ps-10">{item}</span>
                <span aria-hidden="true" className="ms-6 sm:ms-10">
                  ✦
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

export async function HeroSection({heroImages = []}) {
  const t = await getTranslations("home.hero");
  const tHome = await getTranslations("home");
  const marqueeItems = Object.values(tHome.raw("marquee"));

  return (
    <section
      className="relative overflow-hidden bg-background"
      aria-label={t("label")}
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="text-center lg:text-start">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-primary-foreground">
              <Sparkles className="h-4 w-4 text-primary-foreground/70" />
              {t("overline")}
            </p>

            <h1 className="mt-6 text-h1 font-display tracking-tight text-foreground sm:text-display">
              {t("title")}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-body-lg leading-relaxed text-muted-foreground lg:mx-0">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary px-7 text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-clay-md transition duration-200 hover:-translate-y-0.5 hover:shadow-clay-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
              >
                {t("ctaPrimary")}
                <ArrowRight className="h-5 w-5 shrink-0 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          <div className="mt-10 lg:mt-0">
            <HeroVisual heroImages={heroImages} />
          </div>
        </div>
      </div>

      <MarqueeBand items={marqueeItems} />
    </section>
  );
}