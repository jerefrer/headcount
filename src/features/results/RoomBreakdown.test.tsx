import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RoomBreakdown } from "./RoomBreakdown";
import type { RoomBreakdownStat } from "@/types/report";

const rooms: RoomBreakdownStat[] = [
  { dayLabel: "", roomLabel: "Main Room", webinarId: "111", topic: "Teaching", unique: 120, countryCount: 2,
    thresholds: [{ mins: 40, count: 90, pct: 75 }], countries: [{ name: "France", count: 100, pct: 83.3 }, { name: "Spain", count: 20, pct: 16.7 }] },
  { dayLabel: "", roomLabel: "Chinese Room", webinarId: "222", topic: "", unique: 30, countryCount: 1,
    thresholds: [{ mins: 40, count: 10, pct: 33.3 }], countries: [{ name: "China", count: 30, pct: 100 }] },
];

describe("RoomBreakdown", () => {
  it("should list each room with its webinar ID, KPIs and countries", () => {
    render(<RoomBreakdown rooms={rooms} />);
    expect(screen.getByText("Main Room")).toBeInTheDocument();
    expect(screen.getByText("Chinese Room")).toBeInTheDocument();
    expect(screen.getByText(/111/)).toBeInTheDocument();
    expect(screen.getByText("Teaching")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("China")).toBeInTheDocument();
    expect(screen.getByText("France")).toBeInTheDocument();
  });
});
