/** 
   * Dates 
   */

// Valid date check
export function isValidDate(dateStr) {
  return dateStr && dateStr !== "0000-00-00";
}

// Check if date is past
export function isDatePast(date) {

  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0')

  const newToday = `${year}-${month}-${day}`

  return (date < newToday)
}

// Dates converion από dd/mm/yyyy σε yyyy-mm-dd
export function convertDateToSql(dateStr) {
  const [d, m, y] = dateStr.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// Dates converion από yyyy-mm-dd σε dd/mm/yyyy
export function convertDateToDisplay(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// Dates conversion to DD/MM
export function formatDateShort(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};
