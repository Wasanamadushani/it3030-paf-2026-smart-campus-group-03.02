import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CalendarView({ title = "Availability Calendar" }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (value) => {
    if (Array.isArray(value)) {
      setSelectedDate(value[0] ?? new Date());
      return;
    }

    setSelectedDate(value);
  };

  return (
    <article className="fac-calendar-card" aria-label="Facility availability calendar">
      <h2>{title}</h2>
      <p className="fac-calendar-subtitle">Select a date to check availability for that day.</p>

      <div className="fac-calendar-widget">
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>

      <p className="fac-calendar-selected">
        Selected Date: <strong>{formatDate(selectedDate)}</strong>
      </p>
    </article>
  );
}
