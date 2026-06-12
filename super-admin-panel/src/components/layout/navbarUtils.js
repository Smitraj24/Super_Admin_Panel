export const getGreeting = (h = new Date().getHours()) =>
  h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";

export const getGreetingIcon = (h = new Date().getHours()) =>
  h < 12 ? "🌅" : h < 18 ? "☀️" : "🌙";

export const getTimeStr = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

export const getDateStr = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export const getTimeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};