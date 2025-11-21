exports.getWeekNumberInMonth = (dateObj) => {
  const d = new Date(dateObj);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const dayOfMonth = d.getDate();
  const weekNumber = Math.ceil((dayOfMonth + first.getDay()) / 7);
  return weekNumber;
};
