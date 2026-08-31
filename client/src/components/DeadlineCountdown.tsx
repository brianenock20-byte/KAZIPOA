import { useEffect, useState } from "react";

function getRemaining(deadlineIso: string, now = Date.now()) {
  const remainingMs = new Date(deadlineIso).getTime() - now;
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) return null;
  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export function formatDeadlineCountdown(deadlineIso: string, now = Date.now()) {
  const remaining = getRemaining(deadlineIso, now);
  if (!remaining) return "Deadline passed";
  if (remaining.days > 0) return `${remaining.days}d ${remaining.hours}h left`;
  if (remaining.hours > 0) return `${remaining.hours}h ${remaining.minutes}m left`;
  return `${Math.max(1, remaining.minutes)}m left`;
}

export default function DeadlineCountdown({ deadlineIso }: { deadlineIso: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const label = formatDeadlineCountdown(deadlineIso, now);
  const remainingMs = new Date(deadlineIso).getTime() - now;
  const isExpired = !Number.isFinite(remainingMs) || remainingMs <= 0;
  const isCritical = !isExpired && remainingMs < 24 * 60 * 60 * 1000;
  return <span className={`deadline-countdown${isExpired ? " expired" : isCritical ? " critical" : ""}`} role="timer" aria-label={isExpired ? "Deadline passed" : `Time remaining: ${label}`}><span aria-hidden="true">◷</span>{label}</span>;
}
