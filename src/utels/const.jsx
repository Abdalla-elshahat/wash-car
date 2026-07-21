import Cookies from "js-cookie";
export const Domain = "http://localhost:4000";
export const token = Cookies.get("token") || "";

export function formatTime12H(timeStr) {
  if (!timeStr) return "—";
  if (timeStr.toLowerCase().includes("am") || timeStr.toLowerCase().includes("pm")) {
    return timeStr;
  }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const paddedHours = String(hours).padStart(2, '0');
  return `${paddedHours}:${minutes} ${ampm}`;
}