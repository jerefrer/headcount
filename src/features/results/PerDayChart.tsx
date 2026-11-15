import { Card } from "@/components/ui/card";
import { strings } from "@/constants/strings";
import { useChartColors } from "@/lib/useChartColors";
import type { PerDayStat } from "@/types/report";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { perDay: PerDayStat[]; }

export function PerDayChart({ perDay }: Props) {
  const c = useChartColors();
  if (perDay.length < 2) return null;
  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {strings.results.panels.perDay}
      </h3>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <BarChart data={perDay}>
            <CartesianGrid stroke={c.border} strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke={c.muted} fontSize={12} />
            <YAxis stroke={c.muted} fontSize={12} />
            <Tooltip />
            <Bar dataKey="unique" fill={c.primary} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
