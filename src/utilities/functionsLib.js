/** 
   * Dates 
   */

import { addDays, format, endOfDay, startOfDay, setMinutes, setSeconds, differenceInDays, subDays } from 'date-fns';
import { zonedTimeToUtc, formatInTimeZone } from "date-fns-tz";
import { el } from 'date-fns/locale'; // Εισαγωγή της locale για Ελληνικά

// Datetime με ώρα 23:59
export function formatDateEnd(date) {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
      console.error("Invalid date provided:", date);
      return null;
    }

    // Παίρνουμε το τέλος της ημέρας (23:59:59)
    const endOfDate = endOfDay(parsedDate);

    // Ορίζουμε τα λεπτά σε 59 και τα δευτερόλεπτα σε 0 (όπως ζητήθηκε)
    const endTime = setSeconds(setMinutes(endOfDate, 59), 0);

    return endTime; // Επιστρέφει ένα νέο Date object με την ώρα 23:59:00
  } catch (error) {
    console.error("Error formatting end date:", error);
    return null;
  }
}

// Datetime με ώρα 00:01
export function formatDateStart(date) {
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
      console.error("Invalid date provided:", date);
      return null;
    }

    // Παίρνουμε την αρχή της ημέρας (00:00:00)
    const startOfDate = startOfDay(parsedDate);

    // Ορίζουμε τα λεπτά σε 1 και τα δευτερόλεπτα σε 0
    const startTime = setSeconds(setMinutes(startOfDate, 1), 0);

    return startTime; // Επιστρέφει ένα νέο Date object με την ώρα 00:01:00
  } catch (error) {
    console.error("Error formatting start date:", error);
    return null;
  }
}

// Dates difference date2 - date1
export function dateDifferenceInDays(date1, date2) {
  try {
    // Μετατροπή των εισερχόμενων τιμών σε Date objects αν είναι strings
    const parsedDate1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const parsedDate2 = typeof date2 === 'string' ? new Date(date2) : date2;

    // Έλεγχος αν οι parsedDate είναι έγκυρα Date objects
    if (!(parsedDate1 instanceof Date) || isNaN(parsedDate1) ||
      !(parsedDate2 instanceof Date) || isNaN(parsedDate2)) {
      console.error("Invalid date provided:", date1, "or", date2);
      return null; // Ή κάποια άλλη ένδειξη σφάλματος
    }

    // Υπολογισμός της διαφοράς σε ημέρες
    const difference = differenceInDays(parsedDate1, parsedDate2);

    return difference;
  } catch (error) {
    console.error("Error calculating difference between dates:", error);
    return null; // Ή κάποια άλλη ένδειξη σφάλματος
  }
}

// Substract days from date
export function dateSubstractDays(date, days) {
  try {
    // Αν το 'date' είναι string, προσπαθούμε να το μετατρέψουμε σε Date object
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    // Έλεγχος αν το parsedDate είναι έγκυρο Date object
    if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
      console.error("Invalid date provided:", date);
      return null; // Ή κάποια άλλη ένδειξη σφάλματος
    }

    // Αφαιρούμε τις ημέρες
    const pastDate = subDays(parsedDate, days);

    // return pastDate; // Επιστρέφουμε το νέο Date object
    // Αν θέλεις να επιστρέψεις μια μορφοποιημένη ημερομηνία:
    return format(pastDate, 'yyyy-MM-dd'); // Ή όποια άλλη μορφή θέλεις
  } catch (error) {
    console.error("Error subtracting days from date:", error);
    return null; // Ή κάποια άλλη ένδειξη σφάλματος
  }
}

// Add days to date
export function dateAddDays(date, days) {
  try {
    // Αν το 'date' είναι string, προσπαθούμε να το μετατρέψουμε σε Date object
    const parsedDate = typeof date === 'string' ? new Date(date) : date;

    // Έλεγχος αν το parsedDate είναι έγκυρο Date object
    if (!(parsedDate instanceof Date) || isNaN(parsedDate)) {
      console.error("Invalid date provided:", date);
      return null; // Ή κάποια άλλη ένδειξη σφάλματος
    }

    // Προσθέτουμε τις ημέρες
    const futureDate = addDays(parsedDate, days);

    // return futureDate; // Επιστρέφουμε το νέο Date object
    // Αν θέλεις να επιστρέψεις μια μορφοποιημένη ημερομηνία:
    return format(futureDate, 'yyyy-MM-dd'); // Ή όποια άλλη μορφή θέλεις
  } catch (error) {
    console.error("Error adding days to date:", error);
    return null; // Ή κάποια άλλη ένδειξη σφάλματος
  }
}

// UTC Datetime
export function formatDateUTC(dateString) {
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return format(utcDate, "yyyyMMdd'T'HHmmss'Z'");
}

// UTC Datetime με ώρα 00:01
export function formatDateUTCStart(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 1));
  return formatInTimeZone(date, "UTC", "yyyyMMdd'T'HHmmss'Z'");
}
// UTC Datetime με ώρα 23:59
export function formatDateUTCEnd(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 23, 59));
  return formatInTimeZone(date, "UTC", "yyyyMMdd'T'HHmmss'Z'");
}

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