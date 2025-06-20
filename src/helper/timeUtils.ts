export const getCurrentTime12Hour = (): string => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit'
  });
};