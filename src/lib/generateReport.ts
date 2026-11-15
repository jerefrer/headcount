import { parseZoomCsvBuffer } from "@/core/parser";
import { deduplicate } from "@/core/processor";
import { aggregate, combinedFor } from "@/core/aggregator";
import type { AttendeeRow } from "@/core/types";
import type { AggregateStats, ProcessedSource } from "@/types/report";

export function deriveRoomLabel(filename: string): string {
  const stem = filename.replace(/\.[^.]+$/, "");
  const low = stem.toLowerCase();
  if (low.includes("main")) return "Main Room";
  if (low.includes("chinese")) return "Chinese Room";
  return stem;
}

export interface GenerateInput {
  files: File[];
  /** Filenames per day, in day order (as produced by the grouping step). */
  days: string[][];
  title: string;
  thresholds: number[];
}

export interface GeneratedReport {
  stats: AggregateStats;
  combined: AttendeeRow[];
}

/** Parse, deduplicate and aggregate the given files — entirely in the browser. */
export async function generateReport({ files, days, title, thresholds }: GenerateInput): Promise<GeneratedReport> {
  const filesByName = new Map(files.map((f) => [f.name, f]));
  const built: { sources: ProcessedSource[] }[] = [];
  for (const filenames of days) {
    const sources: ProcessedSource[] = [];
    for (const name of filenames) {
      const f = filesByName.get(name);
      if (!f) continue;
      const parsed = parseZoomCsvBuffer(await f.arrayBuffer());
      sources.push({
        attendees: deduplicate(parsed.attendees),
        meta: parsed.meta,
        roomLabel: filenames.length === 1 ? "Main Room" : deriveRoomLabel(name),
      });
    }
    if (sources.length > 0) built.push({ sources });
  }
  const input = { title, thresholds, days: built };
  return { stats: aggregate(input), combined: combinedFor(input) };
}
