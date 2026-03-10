import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
} from "@fluentui/react-components";
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import { useState, useMemo } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import type { Meeting } from "@/types";

const useStyles = makeStyles({
  container: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: "8px",
    ...shorthands.border("1px", "solid", tokens.colorNeutralStroke2),
    padding: "16px",
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  dayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 4px",
    borderRadius: "6px",
    cursor: "pointer",
    minHeight: "64px",
    pointerEvents: "auto" as const,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  dayCellSelected: {
    backgroundColor: "#e8ebf9",
    ...shorthands.border("2px", "solid", "#5b5fc7"),
  },
  meetingDot: {
    height: "4px",
    borderRadius: "2px",
    marginTop: "4px",
    width: "80%",
  },
});

interface WeekCalendarStripProps {
  meetings: Meeting[];
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
}

export const WeekCalendarStrip: React.FC<WeekCalendarStripProps> = ({ meetings, selectedDate, onDateSelect }) => {
  const styles = useStyles();
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today, { weekStartsOn: 1 }));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 6);
  const label = `${format(weekStart, "MMM d")} — ${format(weekEnd, "MMM d, yyyy")}`;

  const getMeetingsForDay = (day: Date) =>
    meetings.filter((m) => isSameDay(new Date(m.date), day));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button
          appearance="subtle"
          icon={<ChevronLeft20Regular />}
          onClick={() => setWeekStart(subWeeks(weekStart, 1))}
        />
        <Text weight="semibold" size={400}>{label}</Text>
        <Button
          appearance="subtle"
          icon={<ChevronRight20Regular />}
          onClick={() => setWeekStart(addWeeks(weekStart, 1))}
        />
      </div>
      <div className={styles.grid}>
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const dayMeetings = getMeetingsForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : isToday ? styles.dayCellSelected : ""}`}
              onClick={() => onDateSelect?.(day)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDateSelect?.(day); } }}
              role="button"
              tabIndex={0}
            >
              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                {format(day, "EEE")}
              </Text>
              <Text weight={isToday ? "bold" : "regular"} size={400}>
                {format(day, "d")}
              </Text>
              {dayMeetings.map((m) => (
                <div
                  key={m.id}
                  className={styles.meetingDot}
                  style={{ backgroundColor: m.avatarColor }}
                  title={m.name}
                >
                  <Text size={100} style={{ color: "#fff", fontSize: "9px", textAlign: "center", display: "block" }}>
                    {m.name.split(" ")[0]}
                  </Text>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
