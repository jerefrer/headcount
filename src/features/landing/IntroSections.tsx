import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { strings } from "@/constants/strings";
import { RichText } from "@/features/landing/RichText";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function Section({ id, heading, children }: { id: string; heading: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mx-auto mt-14 max-w-3xl">
      <h2 id={id} className="mb-5 text-center text-2xl font-semibold tracking-tight text-foreground">{heading}</h2>
      {children}
    </section>
  );
}

export function ExportGuide() {
  return (
    <Section id="export-guide" heading={strings.exportGuide.heading}>
      <ol className="grid gap-4 sm:grid-cols-3">
        {strings.exportGuide.steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-border/70 bg-card p-5">
            <span aria-hidden="true" className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
            <h3 className="font-medium text-foreground">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground"><RichText text={s.body} /></p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Shot({ shot }: { shot: typeof strings.whatYouGet.dashboard | typeof strings.whatYouGet.xlsx }) {
  return (
    <figure>
      <img
        src={asset(shot.src)}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        className="h-auto w-full rounded-xl border border-border/70 shadow-xl shadow-primary/8"
      />
      <figcaption className="mt-3 text-center text-sm text-muted-foreground">{shot.caption}</figcaption>
    </figure>
  );
}

export function WhatYouGet() {
  return (
    <Section id="what-you-get" heading={strings.whatYouGet.heading}>
      <div className="space-y-8">
        <Shot shot={strings.whatYouGet.dashboard} />
        <Shot shot={strings.whatYouGet.xlsx} />
      </div>
    </Section>
  );
}

export function Privacy() {
  return (
    <Section id="privacy" heading={strings.privacy.heading}>
      <Card className="rounded-2xl border border-border/70 bg-card p-6 text-center">
        <p className="text-muted-foreground">{strings.privacy.body}</p>
      </Card>
    </Section>
  );
}

export function Faq() {
  const items = strings.faq.items;
  return (
    <Section id="faq" heading={strings.faq.heading}>
      <dl className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={item.q}
            className={`rounded-2xl border border-border/70 bg-card p-5 ${i === items.length - 1 && items.length % 2 === 1 ? "sm:col-span-2" : ""}`}
          >
            <dt className="font-medium text-foreground">{item.q}</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              <RichText
                text={item.a}
                link={
                  <a
                    href="https://github.com/jerefrer/headcount"
                    target="_blank"
                    rel="noopener"
                    className="rounded-sm text-primary underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {strings.faq.sourceLinkLabel}
                  </a>
                }
              />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
