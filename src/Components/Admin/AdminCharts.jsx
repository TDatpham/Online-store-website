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
} from "recharts";

const COLORS = ["#db4444", "#4a90e2", "#50c878", "#ffad33", "#9b59b6", "#1abc9c", "#e74c3c", "#3498db"];

export function SalesByCategoryPie({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value: Number(value) || 0 }));
  if (chartData.length === 0) return <p className="chartNoData">Chưa có dữ liệu.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) => `${name}: ${value}`}
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SalesByCategoryBar({ data }) {
  const chartData = Object.entries(data || {}).map(([name, sold]) => ({ name, sold: Number(sold) || 0 }));
  if (chartData.length === 0) return <p className="chartNoData">Chưa có dữ liệu.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="sold" name="Sold (units)">
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueByMonthLine({ data }) {
  const chartData = Object.entries(data || {})
    .map(([month, revenue]) => ({
      monthKey: parseInt(month, 10),
      month: `Tháng ${parseInt(month, 10)}`,
      revenue: Number(Number(revenue).toFixed(2)),
    }))
    .sort((a, b) => a.monthKey - b.monthKey);
  if (chartData.length === 0) return <p className="chartNoData">Chưa có dữ liệu.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
        <Legend />
        <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#4a90e2" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function OrdersCountByMonthLine({ data }) {
  const chartData = Object.entries(data || {})
    .map(([month, count]) => ({
      monthKey: parseInt(month, 10),
      month: `Tháng ${parseInt(month, 10)}`,
      count: Number(count) || 0,
    }))
    .sort((a, b) => a.monthKey - b.monthKey);
  if (chartData.length === 0) return <p className="chartNoData">Chưa có dữ liệu.</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v) => [v, "Orders"]} />
        <Legend />
        <Line type="monotone" dataKey="count" name="Orders" stroke="#50c878" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
