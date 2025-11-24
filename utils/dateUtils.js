exports.getWeekNumberInMonth = (date) => {
  const day = date.getDate();
  const week = Math.ceil(day / 7);
  return week;
};
