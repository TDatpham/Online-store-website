import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// Premium palette for dark theme
const COLORS = [
  "#6c63ff", "#f857a6", "#10b981", "#f59e0b",
  "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6",
];

const darkTooltipStyle = {
  backgroundColor: "#1c1e2a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontSize: "13px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
};

const tickStyle = { fill: "#64748b", fontSize: 12 };
const gridStyle = { stroke: "rgba(255,255,255,0.05)" };

/** Pie Chart: Revenue Distribution */
export function SalesByCategoryPie({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value: Number(value) || 0,
  }));
  if (chartData.length === 0)
    return <p style={{ color: "#64748b", textAlign: "center" }}>No data available.</p>;

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={115}
          innerRadius={40}
          paddingAngle={2}
          labelLine={false}
          label={renderCustomLabel}
        >
          {chartData.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={darkTooltipStyle} />
        <Legend
          wrapperStyle={{ color: "#94a3b8", fontSize: "13px", paddingTop: "12px" }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Bar Chart: Sales by Category */
export function SalesByCategoryBar({ data }) {
  const chartData = Object.entries(data || {}).map(([name, sold]) => ({
    name,
    sold: Number(sold) || 0,
  }));
  if (chartData.length === 0)
    return <p style={{ color: "#64748b", textAlign: "center" }}>No data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
        <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={darkTooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          wrapperStyle={{ color: "#94a3b8", fontSize: "13px" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="sold" name="Units Sold" radius={[6, 6, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Area/Line Chart: Daily Revenue
 * data: Array of { date: "2026-03-01", revenue: 1200 }
 */
export function RevenueByDayLine({ data }) {
  if (!data || data.length === 0)
    return <p style={{ color: "#64748b", textAlign: "center" }}>No order data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 30 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
        <XAxis
          dataKey="date"
          tick={tickStyle}
          angle={-35}
          textAnchor="end"
          interval="preserveStartEnd"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={tickStyle}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={darkTooltipStyle}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "13px", paddingTop: "16px" }} iconType="circle" iconSize={8} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Daily Revenue ($)"
          stroke="#6c63ff"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={{ r: 3, fill: "#6c63ff", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#6c63ff", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Area/Line Chart: Revenue by Category
 * data: Object { category: revenue, ... }
 */
export function RevenueByCategoryLine({ data }) {
  const chartData = Object.entries(data || {}).map(([name, revenue]) => ({
    name,
    revenue: Number(Number(revenue).toFixed(2)),
  }));

  if (chartData.length === 0)
    return <p style={{ color: "#64748b", textAlign: "center" }}>No category revenue data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 30 }}>
        <defs>
          <linearGradient id="catRevenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f857a6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f857a6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
        <XAxis
          dataKey="name"
          tick={tickStyle}
          angle={-20}
          textAnchor="end"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={tickStyle}
          tickFormatter={(v) => `$${v.toLocaleString()}`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={darkTooltipStyle}
          formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
        />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "13px", paddingTop: "16px" }} iconType="circle" iconSize={8} />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Category Revenue ($)"
          stroke="#f857a6"
          strokeWidth={2.5}
          fill="url(#catRevenueGrad)"
          dot={({ cx, cy, index }) => (
            <circle key={index} cx={cx} cy={cy} r={5} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={1.5} />
          )}
          activeDot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
