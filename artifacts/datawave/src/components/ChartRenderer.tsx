import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function normalize(data: unknown): { rows: Record<string, unknown>[]; xKey: string; yKey: string } {
  if (!Array.isArray(data) || data.length === 0) return { rows: [], xKey: "name", yKey: "value" };
  const first = data[0] as Record<string, unknown>;
  if (!first || typeof first !== "object") return { rows: [], xKey: "name", yKey: "value" };
  const keys = Object.keys(first);
  const xKey =
    keys.find((k) => typeof first[k] === "string") ??
    (keys.includes("name") ? "name" : keys[0] ?? "name");
  const yKey =
    keys.find((k) => k !== xKey && typeof first[k] === "number") ??
    (keys.includes("value") ? "value" : keys[1] ?? "value");
  return { rows: data as Record<string, unknown>[], xKey, yKey };
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  color: "hsl(var(--foreground))",
  fontSize: 12,
};

export function ChartRenderer({
  type,
  data,
  height = 360,
}: {
  type: string;
  data: unknown;
  height?: number;
}) {
  const { rows, xKey, yKey } = normalize(data);

  if (rows.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground text-sm"
        style={{ height }}
        data-testid="chart-empty"
      >
        No chartable data. Provide an array of objects (e.g. [{`{name, value}`}]).
      </div>
    );
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={rows}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={Math.min(height / 2.6, 130)}
            innerRadius={Math.min(height / 4.6, 70)}
            paddingAngle={2}
          >
            {rows.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={COLORS[0]}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLORS[0] }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
        <Bar dataKey={yKey} radius={[6, 6, 0, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
