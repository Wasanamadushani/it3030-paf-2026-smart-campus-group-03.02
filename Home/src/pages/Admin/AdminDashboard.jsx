import { useMemo, useState } from "react";
import Calendar from "react-calendar";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../../styles/adminDashboard.css";
import "react-calendar/dist/Calendar.css";

const FACILITY_SNAPSHOT = [
  {
    name: "Lecture Hall A1",
    type: "Room",
    status: "ACTIVE",
  },
  {
    name: "Lecture Hall B2",
    type: "Room",
    status: "ACTIVE",
  },
  {
    name: "Networking Lab",
    type: "Lab",
    status: "ACTIVE",
  },
  {
    name: "Software Lab",
    type: "Lab",
    status: "OUT_OF_SERVICE",
  },
  {
    name: "Projector Kit",
    type: "Equipment",
    status: "ACTIVE",
  },
  {
    name: "Portable PA System",
    type: "Equipment",
    status: "OUT_OF_SERVICE",
  },
];

const FACILITY_TYPE_DATA = [
  { label: "Rooms", count: 2 },
  { label: "Labs", count: 2 },
  { label: "Equipment", count: 2 },
];

const BAR_COLORS = ["#60a5fa", "#3b82f6", "#2563eb"];

const QUICK_INSIGHTS = [
  { icon: "MU", label: "Most Used Facility", value: "Lecture Hall A1" },
  { icon: "TB", label: "Total Bookings", value: "148" },
  { icon: "PD", label: "Peak Usage Day", value: "Monday" },
];

const RECENT_ACTIVITY = [
  {
    icon: "ADD",
    text: "Lecture Hall A1 added",
    time: "2 hours ago",
  },
  {
    icon: "UPD",
    text: "Networking Lab booking window updated",
    time: "4 hours ago",
  },
  {
    icon: "MNT",
    text: "Portable PA System moved to maintenance",
    time: "Yesterday",
  },
  {
    icon: "STS",
    text: "Software Lab updated to ACTIVE",
    time: "2 days ago",
  },
];

const BOOKING_NOTES_BY_DATE = {
  "2026-04-14": "2 bookings",
  "2026-04-15": "No bookings",
  "2026-04-16": "1 booking",
};

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const totalFacilities = FACILITY_SNAPSHOT.length;
  const activeFacilities = FACILITY_SNAPSHOT.filter((facility) => facility.status === "ACTIVE").length;
  const outOfServiceFacilities = totalFacilities - activeFacilities;
  const activePercentage = Math.round((activeFacilities / totalFacilities) * 100);
  const outOfServicePercentage = 100 - activePercentage;

  const statusPieData = useMemo(
    () => [
      { name: "Active", value: activeFacilities, color: "#16a34a" },
      { name: "Out of Service", value: outOfServiceFacilities, color: "#ef4444" },
    ],
    [activeFacilities, outOfServiceFacilities]
  );

  const selectedDateKey = toDateKey(selectedDate);
  const selectedDateBookingNote = BOOKING_NOTES_BY_DATE[selectedDateKey] || "No bookings";

  function handleDateChange(value) {
    if (Array.isArray(value)) {
      setSelectedDate(value[0] ?? new Date());
      return;
    }

    setSelectedDate(value);
  }

  return (
    <div className="admin-dashboard-container">
        <section className="admin-stats-grid" aria-label="Admin facility summary">
          <article className="admin-card admin-stat-card">
            <p>Total Facilities</p>
            <strong>{totalFacilities}</strong>
          </article>

          <article className="admin-card admin-stat-card">
            <p>Active Facilities</p>
            <strong>{activeFacilities}</strong>
          </article>

          <article className="admin-card admin-stat-card">
            <p>Out of Service</p>
            <strong>{outOfServiceFacilities}</strong>
          </article>
        </section>

        <section className="admin-analytics-grid" aria-label="Facilities analytics charts">
          <article className="admin-card admin-chart-card">
            <h3>Facility Overview</h3>

            <div className="admin-chart-wrap" aria-label="Facilities by type bar chart">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={FACILITY_TYPE_DATA}>
                  <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#dbe4f4" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={{ stroke: "#dbe4f4" }} />
                  <Tooltip cursor={{ fill: "rgba(37, 99, 235, 0.08)" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {FACILITY_TYPE_DATA.map((entry, index) => (
                      <Cell key={entry.label} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="admin-card admin-chart-card">
            <h3>Status Distribution</h3>

            <div className="admin-chart-wrap" aria-label="Status distribution pie chart">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {statusPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={24} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-status-legend">
              <p>
                <span className="admin-legend-dot admin-legend-active" />
                Active Facilities ({activePercentage}%)
              </p>
              <p>
                <span className="admin-legend-dot admin-legend-out" />
                Out of Service ({outOfServicePercentage}%)
              </p>
            </div>
          </article>
        </section>

        <section className="admin-overview-grid" aria-label="Availability and quick insights">
          <article className="admin-card admin-calendar-card">
            <h3>Facility Availability Calendar</h3>
            <div className="admin-calendar-wrap">
              <Calendar onChange={handleDateChange} value={selectedDate} />
            </div>
            <p className="admin-calendar-note">{selectedDateBookingNote}</p>
            <p className="admin-calendar-selected">
              Selected Date: <strong>{formatDate(selectedDate)}</strong>
            </p>
          </article>

          <div className="admin-insights-left">
            <article className="admin-card admin-chart-card">
              <h3>Quick Insights</h3>
              <div className="admin-quick-insights-grid">
                {QUICK_INSIGHTS.map((item) => (
                  <article key={item.label} className="admin-quick-card">
                    <span className="admin-quick-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </article>

            <article className="admin-card admin-activity-card">
              <h3>Recent Activity</h3>

              <ul className="admin-activity-list">
                {RECENT_ACTIVITY.map((activity) => (
                  <li key={`${activity.text}-${activity.time}`}>
                    <span className="admin-activity-icon" aria-hidden="true">
                      {activity.icon}
                    </span>
                    <div>
                      <strong>{activity.text}</strong>
                      <p>{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </div>
  );
}
