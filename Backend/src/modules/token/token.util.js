const normalizeDate = (dateStr, timeZone) => {
  const d = new Date(dateStr);

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);

  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  // Create UTC date corresponding to that local midnight
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
};

// ✅ Get weekday based on hospital timezone
const getDayOfWeek = (date, timeZone) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(new Date(date));
};

export { normalizeDate, getDayOfWeek };
