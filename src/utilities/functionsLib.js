/** 
   * Dates 
   */

import { format } from 'date-fns';
import { el } from 'date-fns/locale'; // Εισαγωγή της locale για Ελληνικά

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

// Dates conversion to DD/MM/YYYY DDDD (e.g., 23/04/2025 Τετάρτη)
export function formatDayOfWeek(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") return "";
  const date = new Date(dateStr);

  try {
    const dayOfWeek = format(date, 'EEEE', { locale: el });
    return dayOfWeek
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

// Dates conversion to DDDD DD/MM (e.g., 23/04 \n Τετάρτη)
export function formatDateShort3(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") return "";
  const date = new Date(dateStr);

  try {
    const dayOfWeek = format(date, 'EEEE', { locale: el });
    const dayMonth = format(date, 'dd/MM');
    return `${dayMonth}\n${dayOfWeek}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

// Dates conversion to DDD DD/MM (e.g., Τετ 23/04)
export function formatDateShort2(dateStr) {
  if (!dateStr || dateStr === "0000-00-00") return "";
  const date = new Date(dateStr);

  try {
    return format(date, 'dd/MM EEE', { locale: el });
  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Ή κάποια άλλη ένδειξη σφάλματος
  }
}

export // Dates conversion to DD/MM/YY
  function formatDateMidium(dateStr) {
  if (!isValidDate(dateStr)) return "";

  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return 'Invalid Date Format';
  }

  const year = parts[0].slice(2); // Παίρνουμε τα δύο τελευταία ψηφία του έτους
  const month = parts[1];
  const day = parts[2];

  return `${day}/${month}/${year}`;
}