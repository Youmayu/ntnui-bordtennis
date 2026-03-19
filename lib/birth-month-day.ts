export function isValidBirthMonthDay(month: number, day: number) {
  if (!Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(Date.UTC(2024, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}
