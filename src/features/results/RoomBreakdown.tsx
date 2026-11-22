import { Card } from "@/components/ui/card";
import { strings } from "@/constants/strings";
import type { RoomBreakdownStat } from "@/types/report";

interface Props { rooms: RoomBreakdownStat[]; }

const MAX_COUNTRIES = 10;

/** One card per room: its own KPIs (unique attendees, countries, thresholds)
 *  and country list, beside the combined report above. */
export function RoomBreakdown({ rooms }: Props) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {strings.results.panels.perRoom}
      </h3>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rooms.map((room, i) => {
          const maxCount = room.countries[0]?.count ?? 1;
          return (
            <Card key={i} className="p-5">
              <h4 className="text-base font-semibold text-foreground">{room.roomLabel}</h4>
              <p className="text-xs text-muted-foreground">
                {[room.dayLabel, room.webinarId].filter(Boolean).join(" · ")}
              </p>
              {room.topic && <p className="mt-1 truncate text-sm" title={room.topic}>{room.topic}</p>}

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{strings.results.panels.roomUnique}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{room.unique}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{strings.results.panels.roomCountries}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{room.countryCount}</dd>
                </div>
                {room.thresholds.map((t) => (
                  <div key={t.mins}>
                    <dt className="text-xs text-muted-foreground">≥ {t.mins} min</dt>
                    <dd className="tabular-nums">
                      <span className="text-xl font-semibold">{t.count}</span>{" "}
                      <span className="text-muted-foreground">{t.pct}%</span>
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-4 space-y-2">
                {room.countries.slice(0, MAX_COUNTRIES).map((c) => (
                  <li key={c.name} className="grid grid-cols-[8rem_1fr_3rem_4rem] items-center gap-3 text-sm">
                    <span className="truncate">{c.name}</span>
                    <div className="h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                    <span className="tabular-nums text-right">{c.count}</span>
                    <span className="tabular-nums text-right text-muted-foreground">{c.pct}%</span>
                  </li>
                ))}
              </ul>
              {room.countries.length > MAX_COUNTRIES && (
                <p className="mt-2 text-xs text-muted-foreground">
                  +{room.countries.length - MAX_COUNTRIES} more
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
