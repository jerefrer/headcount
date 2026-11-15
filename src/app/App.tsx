import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { strings } from "@/constants/strings";
import { useReportWizard, inspectFilesLocal } from "@/hooks/useReportWizard";
import { useSharedReport } from "@/hooks/useSharedReport";
import { UploadStep } from "@/features/wizard/UploadStep";
import { GroupingStep } from "@/features/wizard/GroupingStep";
import { OptionsStep } from "@/features/wizard/OptionsStep";
import { WizardStepper } from "@/features/wizard/WizardStepper";
import { ResultsView } from "@/features/results/ResultsView";
import { buildXlsx } from "@/core/xlsx";
import { buildShareUrl, encodeReport, toShareable } from "@/core/shareUrl";
import type { AttendeeRow } from "@/core/types";
import type { AggregateStats, ShareableReport } from "@/types/report";
import { generateReport } from "@/lib/generateReport";
import { groupByDate } from "@/lib/grouping";
import { SampleDataButton } from "@/features/landing/SampleDataButton";
import { ExportGuide, Faq, Privacy, WhatYouGet } from "@/features/landing/IntroSections";
import { SiteFooter } from "@/features/landing/SiteFooter";

function BrandMark() {
  return (
    <div aria-hidden="true" className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
      <span className="block h-3 w-3 rounded-full bg-primary-foreground/95 ring-4 ring-primary-foreground/20" />
    </div>
  );
}

function statsFromShared(s: ShareableReport): AggregateStats {
  return {
    title: s.title,
    generatedAt: s.generatedAt,
    days: s.days,
    rooms: s.rooms.map((r) => ({
      dayLabel: s.days[r.dayIdx]?.date ?? "",
      roomLabel: r.label,
      webinarId: r.webinarId,
      uniqueAttendees: 0,
      totalUsersZoom: "",
      uniqueViewersZoom: "",
      durationMinutesZoom: "",
    })),
    topLine: s.topLine,
    countries: s.countries,
    thresholds: s.thresholds,
    perDay: s.perDay,
    histogram: s.histogram,
    retention: s.retention,
    peak: s.peak,
  };
}

const SAMPLE_FILES = ["sample-day-1.csv", "sample-day-2.csv"];

export default function App() {
  const shared = useSharedReport();
  const w = useReportWizard();
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [combined, setCombined] = useState<AttendeeRow[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleError, setSampleError] = useState(false);

  const handleFiles = useCallback(async (files: File[]) => {
    const merged = [...w.files.filter((f) => !files.some((n) => n.name === f.name)), ...files];
    w.setFiles(merged);
    const res = await inspectFilesLocal(merged);
    w.applyInspection(res);
  }, [w]);

  const runGenerate = useCallback(async () => {
    const config = w.buildConfig();
    const report = await generateReport({
      files: w.files,
      days: w.grouping.days,
      title: config.topic,
      thresholds: config.thresholds,
    });
    setStats(report.stats);
    setCombined(report.combined);
    w.goToResults();
  }, [w]);

  const loadSample = useCallback(async () => {
    setSampleLoading(true);
    setSampleError(false);
    try {
      const files = await Promise.all(
        SAMPLE_FILES.map(async (name) => {
          const res = await fetch(`${import.meta.env.BASE_URL}sample/${name}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return new File([await res.arrayBuffer()], name, { type: "text/csv" });
        }),
      );
      const grouping = groupByDate(await inspectFilesLocal(files));
      const report = await generateReport({
        files,
        days: grouping.days,
        title: strings.sample.title,
        thresholds: [40, 60],
      });
      setStats(report.stats);
      setCombined(report.combined);
      w.goToResults();
    } catch {
      setSampleError(true);
    } finally {
      setSampleLoading(false);
    }
  }, [w]);

  const handleDownload = useCallback(() => {
    if (!stats) return;
    const blob = buildXlsx(stats, combined ? { combinedAttendees: combined } : {});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(stats.title || "headcount-report").replace(/[^a-z0-9-_]+/gi, "_")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }, [stats, combined]);

  const handleShare = useCallback(async () => {
    if (!stats) return;
    const url = buildShareUrl(window.location.origin, import.meta.env.BASE_URL, encodeReport(toShareable(stats)));
    await navigator.clipboard.writeText(url);
    setToast(strings.results.shareCopied);
    setTimeout(() => setToast(null), 3000);
  }, [stats]);

  const sharedStats = useMemo(() => (shared ? statsFromShared(shared) : null), [shared]);
  if (sharedStats) {
    return (
      <main className="relative min-h-screen bg-background px-4 py-12 sm:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-112 bg-linear-to-b from-primary/6 via-primary/2 to-transparent" />
        <header className="mx-auto mb-10 max-w-3xl text-center">
          <BrandMark />
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            <span className="text-primary">{strings.appTitleBrand}</span>{" "}
            <span className="text-foreground/85">{strings.appTitleRest}</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">{strings.appSubtitle}</p>
        </header>
        <ResultsView
          stats={sharedStats}
          readOnly
          onStartOver={() => {}}
          onDownload={() => {}}
          onShare={() => {}}
        />
        <SiteFooter />
      </main>
    );
  }

  // The explanatory sections only show before any file is loaded or report
  // built; the footer (author, sponsor, source) always shows.
  const isEmpty = !stats && w.files.length === 0;

  return (
    <main className="relative min-h-screen bg-background px-4 py-12 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-112 bg-linear-to-b from-primary/6 via-primary/2 to-transparent" />
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <BrandMark />
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          <span className="text-primary">{strings.appTitleBrand}</span>{" "}
          <span className="text-foreground/85">{strings.appTitleRest}</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">{strings.appSubtitle}</p>
      </header>

      {stats ? (
        <ResultsView
          stats={stats}
          onStartOver={() => { setStats(null); w.reset(); }}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      ) : (
        <Card className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/8 sm:p-10">
          <WizardStepper step={w.step} />
          {w.step === "upload" && (
            <UploadStep files={w.files} results={w.results} isInspecting={false} onFiles={handleFiles} onNext={w.goToGrouping} />
          )}
          {w.step === "grouping" && (
            <GroupingStep grouping={w.grouping} onMove={w.move} onAddDay={w.addDay} onRemoveFile={w.removeFile} onBack={w.goToUpload} onNext={w.goToOptions} canNext={w.canLeaveGrouping} />
          )}
          {w.step === "options" && (
            <OptionsStep topic={w.options.topic} thresholds={w.options.thresholds} onTopic={w.setTopic} onAddThreshold={w.addThreshold} onRemoveThreshold={w.removeThreshold} onBack={w.goToGrouping} onGenerate={runGenerate} />
          )}
        </Card>
      )}

      {isEmpty && (
        <>
          <SampleDataButton loading={sampleLoading} error={sampleError} onClick={loadSample} />
          <ExportGuide />
          <WhatYouGet />
          <Privacy />
          <Faq />
        </>
      )}

      <SiteFooter />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
