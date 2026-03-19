export function getDaysInMonth(month: number) {
  return new Date(Date.UTC(2024, month, 0)).getUTCDate();
}

export function isValidBirthMonthDay(month: number, day: number) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = getDaysInMonth(month);
  return day >= 1 && day <= daysInMonth;
}
