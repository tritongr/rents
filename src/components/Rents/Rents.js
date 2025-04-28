/**
 * =============================================
 * Βασικό Rents component με δυνατότητα CRUD
 * Καλεί το RentModal για Create/Update
 * =============================================
 */

import "./Rents.scss"

import { format } from 'date-fns';
import { isValidDate, isDatePast, formatDateShort, formatDateShort3, formatDayOfWeek, formatDateMidium, formatDateEnd, formatDateStart } from "../../utilities/functionsLib"

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Confirm from "../utilities/Confirm"
import CollapsibleHeader from "../utilities/CollapsibleHeader"  // Toggles a panel (show/hide)
import { RentModal } from "./RentModal"                         // Modal form

function Rents({ rents, setRents, nullRent, items, customers, API }) {

  /**
   * States
   */

  // Selected Customer object για single react-select dropdown {label: "Χρήστος", value: n}, ...}
  const [selectedCustomer, setSelectedCustomer] = useState({})

  // Selected Items array για react-select dropdown [{label: "lorem", value: n}, ...]
  const [selectedItems, setSelectedItems] = useState([])

  // Ελέγχει την εμφάνιση του <Confirm /> για την διαγραφή records
  const [isConfirmShowing, setIsConfirmShowing] = useState(false)

  // Collapsible rents panel toggle
  const [isCollapsiblePanelOpen, setIsCollapsiblePanelOpen] = useState(true)

  // Το current rent όπου έγινε κλικ σε κάποιο button (Edit ή Delete)
  const [editingRent, setEditingRent] = useState({});

  // Toggle show/hide rent modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rent modal mode (New or Edit rent)
  const [isNewRent, setIsNewRent] = useState(true);

  // Sorting & filtering
  const [showUnreturned, setShowUnreturned] = useState(false)
  const [showUnpaid, setShowUnpaid] = useState(false)
  const [showFutured, setShowFutured] = useState(false)
  const [showToCollect, setShowToCollect] = useState(false)
  const [showToGetPaid, setShowToGetPaid] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showNotCompleted, setShowNotCompleted] = useState(false) //showInProgress
  const [showInProgress, setShowInProgress] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState("start_date")
  const [sortDirection, setSortDirection] = useState("asc")

  // Show popup help
  const [showHelpPopup, setShowHelpPopup] = useState(false);

  // Rent poup
  const [isHovered, setIsHovered] = useState(null)
  const [rentPopup, setRentPopup] = useState(null)


  // Ακούμε το Esc για να κλείσουμε το help modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowHelpPopup(false);
      }
    }

    if (showHelpPopup) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    }
  }, [showHelpPopup]);


  /**
   *  Validation
   */
  function validRent() {

    if (!selectedCustomer || Object.keys(selectedCustomer).length == 0) {
      toast.error('Δεν επιλέξατε πελάτη.')
      return false
    }
    if (!selectedItems || selectedItems.length == 0) {
      toast.error('Δεν επιλέξατε εξοπλισμό.')
      return false
    }
    if (!editingRent.start_date || editingRent.start_date === "0000-00-00") {
      toast.error("Η ημερομηνία έναρξης είναι υποχρεωτική.")
      return false
    }
    if (!editingRent.end_date || editingRent.end_date === "0000-00-00") {
      toast.error("Η ημερομηνία λήξης είναι υποχρεωτική.")
      return false
    }
    if (editingRent.end_date < editingRent.start_date) {
      toast.error("Η ημερομηνία έναρξης δεν μπορεί να είναι μεταγενέστερη της ημερομηνίας λήξης.")
      return false
    }

    // Προετοιμασία του new/edited rent record for axios
    return {
      customer_id: parseInt(selectedCustomer.value),
      rented_items: selectedItems.map(i => parseInt(i.value)),
      start_date: editingRent.start_date,
      end_date: editingRent.end_date,
      ret_date: editingRent.ret_date,
      paid_date: editingRent.paid_date,
      notes: editingRent.notes
    }
  }

  /** 
     * New rent
    */

  // New button clicked
  function onAddClick() {
    setEditingRent(nullRent)
    setIsNewRent(true)
    setIsModalOpen(true)
  }

  // Save new button clicked 
  // *** AXIOS ***
  function onSaveNew() {

    // Get valid record for axios
    const validNewRent = validRent()
    if (!validNewRent) {
      return
    }

    // Axios parameters
    const axiosVars = {
      method: "POST",
      url: API.URL + "rents",
      headers: { "X-WP-Nonce": API.NONCE },
      data: validNewRent
    }

    // Success new record
    // Το response.data 
    function handleSuccess(response) {

      console.log("response.data: ", response.data)

      const newRent = response.data
      setRents([...rents, response.data])

      console.log("newRent: ", newRent)
      console.log("rents: ", rents)

      setSelectedItems([])
      setSelectedCustomer({})
      setIsModalOpen(false)

      toast.success('Η ενοικίαση προστέθηκε!')

      copyToClipboard(rentToCopy(newRent))
      createGoogleCalendarEvent(newRent)

      setEditingRent(nullRent)

    }

    // Fail save new record
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την αποθήκευση.";
      toast.error(msg)
      console.error("Error saving new editingRent: ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /** 
   * Edit rent
  */

  // Edit button clicked
  function onEditClick(rent) {
    setEditingRent(rent)
    setIsNewRent(false)
    setIsModalOpen(true)
  }

  // Save edit button clicked 
  // *** AXIOS ***
  function onSaveEdit() {

    // Get valid record for axios
    const validEditRent = validRent()
    if (!validEditRent) {
      return
    }

    // Axios parameters
    const axiosVars = {
      method: "PUT",
      url: API.URL + "rents",
      headers: { "X-WP-Nonce": API.NONCE },
      data: { ...validEditRent, id: parseInt(editingRent.id) }
    }

    // Success save edited record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {

      const updateRent = response.data
      setRents(prev => prev.map(rent => rent.id === response.data.id ? response.data : rent));

      setEditingRent(nullRent)
      setSelectedItems([])
      setIsModalOpen(false)

      toast.info('Η ενοικίαση ενημερώθηκε!')

      copyToClipboard(rentToCopy(updateRent))

    }

    // Fail save edited record 
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την ενημέρωση.";
      toast.error(msg)
      console.log("Error saving edit: ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /**
   * Delete rent
   */

  //  Εμφανίζει το <Confirm />
  function onDeleteClick(rent) {
    setEditingRent(rent)
    setIsConfirmShowing(true)
  }

  // Delete button clicked *** AXIOS ***
  // ΠΡΟΟΣΟΧΗ! καλείται από το <Confirm /> και όχι από εδώ.
  function onDelete() {

    // Axios parameters
    const axiosVars = {
      method: "DELETE",
      url: API.URL + "rents",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingRent
    };

    // Success delete record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {
      setRents(response.data)
      toast.warn('Η ενοικίαση διαγράφηκε!') // toast message
    }

    // Fail delete record
    function handleError(error) {
      const msg = error.response?.data?.message || "Κάτι πήγε στραβά κατά την διαγραφή."
      toast.error("Η διαγραφή απέτυχε.")
      console.log("Error deleting rent => ", error)
      console.log("msg", msg)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /**
   * Sorting & Filtering
   */

  // Φιλτράρισμα βάσει searchText και is_rented Filter

  // const filteredRents = rents
  //   .filter(rent => {
  //     if (showNotReturnedOnly) {
  //       return !rent.is_returned
  //     } else {
  //       return true
  //     }
  //   })
  //   .filter(rent => String(rent.notes).toLowerCase().includes(searchText.toLowerCase())) // notes search



  // Τα Items name από τον rented_items array 
  function getRentedItemsNames(rented_items) {

    const itemNames = rented_items.map((itemId) => {
      const item = items.find((i) => i.id == itemId);
      return item ? item.name : 'Άγνωστο είδος';
    }).filter((i, index) => index < 3);

    const suffix = rented_items.length > 3 ? "\n+" + (rented_items.length - 3) + " ακόμη..." : ""

    return itemNames.join("\n") + suffix

    // return itemNames.map((name, index) => (
    //   <div key={index}>{name}</div>
    // ));
  }

  // Return date
  function getReturnDate(rent) {
    if (isValidDate(rent.ret_date)) {
      return formatDateShort(rent.ret_date) + " ✅"
    } else {
      if (isDatePast(rent.end_date)) {
        return "Όχι ❌"
      } else {
        return "Όχι 📅"
      }
    }
  }

  // Paid date
  function getPaidDate(rent) {
    if (isValidDate(rent.paid_date)) {
      return formatDateShort(rent.paid_date) + " ✅"
    } else {
      if (isDatePast(rent.end_date)) {
        return "Όχι ❌"
      } else {
        return "Όχι 📅"
      }
    }
  }

  /**
   * Filters
   */
  // Φιλτράρισμα βάσει searchText και is_pending
  const filteredRents = rents
    .filter(r => !showInProgress || (isDatePast(r.start_date) && (!isDatePast(r.end_date))))  // Σε εξέλιξη
    .filter(r => !showFutured || !isDatePast(r.start_date))  // Μελλοντικές
    .filter(r => !showToCollect || (isDatePast(r.end_date) && !isValidDate(r.ret_date)))  // Για παραλλαβή
    .filter(r => !showToGetPaid || (isDatePast(r.end_date) && !isValidDate(r.paid_date)))  // Για είσπραξη
    .filter(r => !showUnreturned || !isValidDate(r.ret_date)) // Μη επιστραμμένα
    .filter(r => !showUnpaid || !isValidDate(r.paid_date)) // Ανεξόφλητα
    .filter(r => !showCompleted || (isValidDate(r.ret_date) && isValidDate(r.paid_date))) // Oλοκληρωμένες
    .filter(r => !showNotCompleted || (!isValidDate(r.ret_date) && !isValidDate(r.paid_date))) // Μη ολοκληρωμένες
    .filter(r => r.customer_name.toLowerCase().includes(searchText.toLowerCase()) || r.notes.toLowerCase().includes(searchText.toLowerCase()))

  /**
   * Sorting
   */

  const sortedRents = [...filteredRents].sort((a, b) => {

    // Κατά ονομα 
    if (sortColumn === "customer_name") {
      return sortDirection === "asc"
        ? a.customer_name.localeCompare(b.customer_name)
        : b.customer_name.localeCompare(a.customer_name);
    }

    // Κατά ημ. επιστροφής
    if (sortColumn === "start_date") {
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);

      return sortDirection === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }

    // Κατά ημ. επιστροφής
    if (sortColumn === "end_date") {
      const dateA = new Date(a.end_date);
      const dateB = new Date(b.end_date);

      return sortDirection === "asc"
        ? dateA - dateB
        : dateB - dateA;
    }

    return 0;
  });

  // Εναλλαγή κατεύθυνσης sorting
  function handleSortToggle(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  /**
   * Clipboard copy
   */
  function rentToCopy(rent) {

    const itemNames = rent.items.map((itemId, index) => {
      const item = items.find((i) => i.id == itemId)
      return item ? "(" + (index + 1) + ")" + item.name : 'Άγνωστο είδος'
    })

    const customerPhone = (rent.customer_phone + "").trim().length > 0 ? "\n" + rent.customer_phone : ""
    const customerNotes = (rent.customer_notes + "").trim().length > 0 ? "\n" + rent.customer_notes : ""
    const rentNotes = (rent.notes + "").trim().length > 0 ? "\n" + rent.notes : ""
    const lastModified = isValidDate(rent.last_modified) ? "\n(Τελ. ενημ.: " + rent.last_modified + ")" : ""

    const text = `***ΣΤΟΙΧΕΙΑ ΕΝΟΙΚΙΑΣΗΣ***\n\nΠΕΛΑΤΗΣ:\n${rent.customer_name}${customerPhone}${customerNotes}\n\nΕΞΟΠΛΙΣΜΟΣ (${itemNames.length}):\n${itemNames.join(", ")}\n\nΣΧΟΛΙΑ:${rentNotes} \n\nΗΜΕΡΟΜΗΝΙΕΣ:\nΈναρξη: ${formatDateMidium(rent.start_date) + ", " + formatDayOfWeek(rent.start_date)}\nΛήξη: ${formatDateMidium(rent.end_date) + ", " + formatDayOfWeek(rent.end_date)}${lastModified}`

    console.log(text)

    return text

  }

  function copyToClipboard(textToCopy) {

    if (!navigator.clipboard?.writeText) {
      toast.warn('Η αντιγραφή στο clipboard δεν έγινε!')
      return
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {

        toast.success('Η ενοικίαση αντιγράφηκε στο clipboard! \nΜπορείτε να την επικολλήσετε')
        console.log("Copied to clipboard!");
      })
      .catch((err) => {
        toast.error('Η αντιγραφή στο clipboard απέτυχε!')
        console.error("Failed to copy: ", err);
      });
  }

  // Handle send to keep
  const handleSendToKeep = async (rent) => {

    // copyToClipboard(rentToCopy(rent))

    try {
      // await navigator.clipboard.writeText(text);
      // alert("Αντιγράφηκε στο clipboard!");

      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
      const isAndroid = /android/i.test(userAgent);
      const isIOS = /iphone|ipad|ipod/i.test(userAgent);

      if (isMobile) {
        if (isAndroid) {
          // Προσπάθεια ανοίγματος της Keep App μέσω intent
          window.location.href =
            "intent://keep.google.com/#Intent;package=com.google.android.keep;scheme=https;end";
        } else if (isIOS) {
          // iPhone/iPad: άνοιγμα απλά στον browser
          window.open("https://keep.google.com", "_blank");
        }
      } else {
        // Desktop
        window.open("https://keep.google.com", "_blank");
      }
    } catch (err) {
      toast.error('To keep δεν μπορεί να ανοίξει!')
      console.error(err);
    }
  }

  /** 
   * Create calendar event
  */
  const createGoogleCalendarEvent = (rent) => {

    // Αν έχει λήξη η ενοικίαση
    if (isDatePast(rent.end_date)) {
      toast.warn('Δεν μπορείτε να δημιουργήσετε event για ενοικίαση που έχει λήξει')
      return
    }


    // Start event parameters
    // ----------------------
    const startEventTitle = rent.customer_name + " ΕΝΑΡΞΗ " + formatDateShort(rent.start_date) + " - " + formatDateShort(rent.end_date)
    // const startEventStartDate = formatDateStart(rent.start_date)
    // const startEventEndDate = formatDateEnd(rent.start_date)
    const startEventStartDate = format(rent.start_date, "yyyyMMdd") // χωρίς ώρα



    // Μορφοποίηση σε ISO 8601
    // const startEventStartDateISO = startEventStartDate.toISOString().replace(/[-:]/g, '').replace(/\.000Z$/, 'Z');
    // const startEventEndDateISO = startEventEndDate.toISOString().replace(/[-:]/g, '').replace(/\.000Z$/, 'Z');

    // End event parameters
    // --------------------
    const endEventTitle = rent.customer_name + " ΛΗΞΗ " + formatDateShort(rent.end_date) + " (από " + formatDateShort(rent.start_date) + ")"
    // const endEventStartDate = formatDateStart(rent.end_date)
    // const endEventEndDate = formatDateEnd(rent.end_date)
    const endEventStartDate = format(rent.end_date, "yyyyMMdd") // χωρίς ώρα

    // Μορφοποίηση σε ISO 8601
    // const endEventStartDateISO = endEventStartDate.toISOString().replace(/[-:]/g, '').replace(/\.000Z$/, 'Z');
    // const endEventEndDateISO = endEventEndDate.toISOString().replace(/[-:]/g, '').replace(/\.000Z$/, 'Z');


    // Δημιουργία events
    // -----------------
    const baseUrl = "https://calendar.google.com/calendar/u/0/r/eventedit";

    // Start event
    if (!isDatePast(rent.start_date)) {// Αν δεν έχει ξεκινήσει η ενοικίαση, δημιουργία event
      const url = `${baseUrl}?text=${encodeURIComponent(startEventTitle)}&details=${encodeURIComponent(rentToCopy(rent))}&dates=${startEventStartDate}/${startEventStartDate}`;
      window.open(url, "_blank");
    }

    // End event
    if (!isDatePast(rent.end_date)) { // Αν δεν έχει λήξει η ενοικίαση, δημιουργία event
      const url = `${baseUrl}?text=${encodeURIComponent(endEventTitle)}&details=${encodeURIComponent(rentToCopy(rent))}&dates=${endEventStartDate}/${endEventStartDate}`;
      window.open(url, "_blank");
    }

  };

  // Calendar button
  function calendarButtonText(rent) {

    // Αν έχει λήξη η ενοικίαση
    if (isDatePast(rent.end_date)) {
      return "Έχει λήξει"
    }

    var text = ""

    // Μελλοντική ενοικίαση
    if (!isDatePast(rent.start_date) && !isDatePast(rent.end_date)) {

      return "Events Από & Έως 📅"

    }

    // Σε εξέλιξη ενοικίαση
    if (!isDatePast(rent.end_date)) {

      return "Event λήξης 📅"

    }




  }

  /**
   *  Rendering
   */

  return (
    <div className="rents-wrapper">

      {/* Collapsible header */}
      <div>
        <CollapsibleHeader
          title="Ενοικιάσεις"
          isCollapsiblePanelOpen={isCollapsiblePanelOpen}
          setIsCollapsiblePanelOpen={setIsCollapsiblePanelOpen}
        />
      </div>

      {/* Wrapper div για add new button, checkboxes, search */}
      {isCollapsiblePanelOpen && (
        <div
          style={{
            id: "rent-top-section",
            padding: "6px 0 6px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            gap: "10px", // προαιρετικό για απόσταση ανάμεσα
            fontSize: "small"
          }}
        >

          {/* New record button div */}
          <div
            id="rent-new-button"
            style={{ alignSelf: "center", flex: "0 0 auto", verticalAlign: "middle" }}
          >
            <button
              title="Νέα ενοικίαση"
              onClick={onAddClick}
              className="button-add-new"
            >
              <span style={{ verticalAlign: "middle" }} class="dashicons dashicons-plus-alt2"></span>
            </button>
          </div>

          {/* Checkboxes + Help Button */}
          <div
            id="rent-checkboxes"
            style={{ flex: "1 1 auto", textAlign: "center" }}>

            {/* Help Button */}
            <button
              onClick={() => setShowHelpPopup(true)}
              title="Επεξήγηση φίλτρων"
              className="hide-on-mobile"
              style={{
                marginLeft: "0.5em",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                verticalAlign: "middle",
                paddingTop: "0",
                paddingBottom: "0"
              }}
            >
              <span className="dashicons dashicons-editor-help" style={{ color: "red" }}></span>
            </button>

            {/* Μελλοντικές */}
            <label title="Ενοικιάσεις με μελλοντική ημερομηνία έναρξης" style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showFutured}
                onChange={() => { setShowFutured(!showFutured); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false); setShowToGetPaid(false) }}
              />
              {' '}Μελλοντικές
            </label>

            {/* Σε εξέλιξη */}
            <label title="Ενοικιάσεις που ξεκίνησαν αλλά δεν έληξαν ακόμη" style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showInProgress}
                onChange={() => { setShowInProgress(!showInProgress); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false); setShowToGetPaid(false); setShowFutured(false); }}
              />
              {' '}Σε εξέλιξη
            </label>

            {/* Για παραλαβή */}
            <label title="Δεν έχουν επιστραφεί ενώ έχουν λήξει" style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showToCollect}
                onChange={() => { setShowToCollect(!showToCollect); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowFutured(false); setShowToGetPaid(false); setShowInProgress(false); }}
              />
              {' '}Για παραλαβή
            </label>

            {/* Για είσπραξη */}
            <label title="Δεν έχουν εισπραχθεί ενώ έχουν λήξει" style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showToGetPaid}
                onChange={() => { setShowToGetPaid(!showToGetPaid); setShowToCollect(false); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowFutured(false); setShowInProgress(false); }}
              />
              {' '}Για είσπραξη
            </label>

            <div className="hide-on-mobile">
              {/* Δεν επεστράφησαν */}
              <label title="Δεν έχει καταχωρηθεί επιστροφή" style={{ marginRight: '1em' }}>
                <input
                  type="checkbox"
                  checked={showUnreturned}
                  onChange={() => { setShowUnreturned(!showUnreturned); setShowUnpaid(false); setShowFutured(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false); setShowToGetPaid(false); setShowInProgress(false); }}
                />
                {' '}Δεν επεστράφησαν
              </label>

              {/* Ανεξόφλητες */}
              <label title="Δεν έχει καταχωρηθεί πληρωμή" style={{ marginRight: '1em' }}>
                <input
                  type="checkbox"
                  checked={showUnpaid}
                  onChange={() => { setShowUnpaid(!showUnpaid); setShowUnreturned(false); setShowFutured(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false); setShowToGetPaid(false); setShowInProgress(false); }}
                />
                {' '}Ανεξόφλητες
              </label>

              {/* Ολοκληρωμένες */}
              <label title="Πλήρως εξοφλημένες και επιστραμμένες" style={{ marginRight: '1em' }}>
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={() => { setShowCompleted(!showCompleted); setShowUnpaid(false); setShowUnreturned(false); setShowFutured(false); setShowNotCompleted(false); setShowToCollect(false); setShowToGetPaid(false); setShowInProgress(false); }}
                />
                {' '}Ολοκληρωμένες
              </label>

              {/* Μη Ολοκληρωμένες */}
              <label title="Λείπει είτε επιστροφή είτε πληρωμή" style={{ marginRight: '1em' }}>
                <input
                  type="checkbox"
                  checked={showNotCompleted}
                  onChange={() => { setShowNotCompleted(!showNotCompleted); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowFutured(false); setShowToCollect(false); setShowToGetPaid(false); setShowInProgress(false); }}
                />
                {' '}Μη Ολοκληρωμένες
              </label>
            </div>

          </div>

          <div id="rent-search-bar" style={{ flex: "0 0 auto" }}>
            <input
              type="text"
              placeholder="🔍 Αναζήτηση ενοικίασης ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
              style={{ width: "100%", paddingRight: "2em" }} // extra padding right για το κουμπί
            />

            {searchText && (
              <button
                className="button-clear-inside hide-on-mobile"
                onClick={() => setSearchText("")}
                title="Καθαρισμός"
              >
                ✖
              </button>
            )}
          </div>

        </div>)
      }

      {/* Ο Πίνακας */}
      {
        isCollapsiblePanelOpen && (
          <table className="">

            {/* Table header */}
            <thead className="">
              <tr>
                {/* Sortable column name */}
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("customer_name")}
                >
                  Πελάτης ({filteredRents.length}) {sortColumn === "customer_name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Είδη</th>

                {/* Sortable column έναρξη */}
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("start_date")}
                >
                  Έναρξη {sortColumn === "start_date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>

                {/* Sortable column λήξη */}
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("end_date")}
                >
                  Λήξη {sortColumn === "end_date" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>

                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("is_active")}
                >
                  Επεστράφη {sortColumn === "is_returned" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Εξοφλήθη</th>
                <th className="">Παρατηρήσεις</th>
                <th className="">Actions</th>

              </tr>
            </thead>

            {/* Table data */}
            <tbody>
              {
                // Filtered + Sorted rents //sortedRents.
                sortedRents.map(rent => {
                  // const rentCustomer = getRentCustomer(rent) // customer object (of current rent) 
                  // const rentItems = getRentedItemsNames(rent.items) // items array of objects (of current rent)
                  return (

                    // Data row
                    <tr
                      key={rent.id}
                      className={isValidDate(rent.paid_date) && isValidDate(rent.ret_date) ? "active-row" : ""}
                    >

                      {/* Data Cells */}
                      {/* ---------- */}

                      {/* Renter's customer name */}
                      <td
                        className="sortable-column-header"
                        onClick={() => onEditClick(rent)}
                        style={{ whiteSpace: "pre-wrap" }}
                      >

                        {rent.customer_name + "\n" + rent.customer_phone}

                      </td>

                      {/* Items rented */}
                      <td
                        onMouseEnter={() => {
                          setIsHovered(rent.id)
                          // copyToClipboard(rentToCopy(rent))
                        }}
                        onMouseLeave={() => setIsHovered(null)}
                        style={{
                          whiteSpace: "pre-wrap",
                          cursor: "pointer", // για να φαίνεται ότι είναι clickable
                          backgroundColor: isHovered === rent.id ? "#c0d3e8" : "#eef6ff"
                        }}
                        onClick={() => {
                          copyToClipboard(rentToCopy(rent))
                          setRentPopup(rent)
                        }}
                      >
                        {getRentedItemsNames(rent.items)}

                      </td>

                      {/* Start date */}
                      <td
                        className="td-center"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {isValidDate(rent.start_date) ?
                          formatDateShort3(rent.start_date) + (!isDatePast(rent.start_date) ? " 📅" : "") :
                          ""}
                      </td>

                      {/* End date */}
                      <td
                        className="td-center"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {isValidDate(rent.end_date)
                          ? formatDateShort3(rent.end_date) + (!isDatePast(rent.end_date) ? " 📅" : "")
                          : ""}
                      </td>
                      {/* Returned date */}
                      <td className="td-center ">
                        {getReturnDate(rent)}
                      </td>

                      {/* Paid date */}
                      <td className="td-center" >
                        {getPaidDate(rent)}
                      </td>

                      {/* Notes */}
                      <td
                        onMouseEnter={() => {
                          setIsHovered(rent.id)
                          // copyToClipboard(rentToCopy(rent))
                        }}

                        onMouseLeave={() => setIsHovered(null)}

                        style={{
                          whiteSpace: "pre-wrap",
                          cursor: "pointer", // για να φαίνεται ότι είναι clickable
                          backgroundColor: isHovered === rent.id ? "#c0d3e8" : "#eef6ff"
                        }}

                        onClick={() => {
                          copyToClipboard(rentToCopy(rent))
                          setRentPopup(rent)
                        }}
                      >
                        {rent.notes.length > 50 ? rent.notes.slice(0, 50) + "..." : rent.notes}
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div id="action-buttons">
                          {/* Edit button */}
                          <button
                            title="Επεξεργασία γραμμής"
                            className="button-edit"
                            onClick={() => onEditClick(rent)}
                            style={{ marginRight: 7 }}
                          >
                            <span className="dashicons dashicons-edit"></span>
                          </button>

                          {/* Delete button */}
                          <button
                            title="Διαγραφή γραμμής"
                            className="button-delete"
                            onClick={() => onDeleteClick(rent)}
                          >
                            <span class="dashicons dashicons-trash"></span>
                          </button>
                        </div>
                      </td>
                    </tr>)
                })
              }
            </tbody>
          </table>
        )
      }

      {/* 
        * Modal form για Edit & Add record 
        * Εμφανίζεται μόνο όταν isModalOpen = true 
      */}

      {
        isModalOpen && (<RentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          editingRent={editingRent}
          setEditingRent={setEditingRent}
          customers={customers}
          items={items}
          rents={rents}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onSaveEdit={onSaveEdit}
          onSaveNew={onSaveNew}
          isNewRent={isNewRent}
        />)
      }

      {/* το Confirmation on delete */}
      <Confirm
        message={`Να διαγραφεί η ενοικίαση; ${editingRent.id} ;`}
        onConfirmYes={onDelete}
        isShowing={isConfirmShowing}
        setIsShowing={setIsConfirmShowing}
      />

      {/* Help popup */}
      {
        showHelpPopup && (

          // Overlay div
          <div style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // backdropFilter: "blur(4px)" //blur background
          }}
            onClick={() => setShowHelpPopup(false)} // κλείνει αν κλικάρεις έξω
          >
            {/* Popup div */}
            <div
              onClick={(e) => e.stopPropagation()} // για να μην κλείνει αν κλικάρεις μέσα
              className="fade-in"
              style={{
                background: "#fff",
                borderRadius: "10px",
                padding: "20px",
                width: "90%",
                maxWidth: "400px",
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Επεξήγηση φίλτρων</h3>
              <ul style={{ paddingLeft: "1.2em", fontSize: "14px", lineHeight: "1.5" }}>
                <li><strong>Μελλοντικές:</strong> Ενοικιάσεις που ξεκινούν μετά από σήμερα και πρέπει να  προετοιμάσουμε τον εξοπλισμό.</li>
                <li><strong>Σε εξέλιξη:</strong> Ενοικιάσεις που ξεκίνησαν αλλά δεν έχουν λήξη ακόμη.</li>
                <li><strong>Για παραλαβή:</strong> Ενοικιάσεις που δεν έχουν επιστραφεί ενώ έχει περάσει η ημ. λήξης και πρέπει να ανακτήσουμε τον εξοπλισμό.</li>
                <li><strong>Για είσπραξη:</strong> Ενοικιάσεις για τις οποίες δεν πληρωθήκαμε ενώ έχει περάσει η ημ. λήξης.</li>
                <li><strong>Δεν επεστράφησαν:</strong> Δεν έχει οριστεί ημερομηνία επιστροφής.</li>
                <li><strong>Ανεξόφλητες:</strong> Δεν έχει καταχωρηθεί ημερομηνία πληρωμής.</li>
                <li><strong>Ολοκληρωμένες:</strong> Έχουν πληρωθεί και επιστραφεί.</li>
                <li><strong>Μη Ολοκληρωμένες:</strong> Λείπει είτε η πληρωμή είτε η επιστροφή.</li>
              </ul>
              <div style={{ textAlign: "right", marginTop: "15px" }}>
                <button onClick={() => setShowHelpPopup(false)} className="button-save">Κλείσιμο</button>
              </div>
            </div>
          </div>
        )
      }
      {
        false && (
          <div
            style={{
              position: "absolute",
              top: "120px",
              right: "40px",
              width: "320px",
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
              zIndex: 9999
            }}
            onClick={() => setShowHelpPopup(false)} // κλείνει αν κλικάρεις έξω
          >
            <strong>Επεξήγηση φίλτρων:</strong>
            <ul style={{ paddingLeft: "1.2em", marginTop: "10px", fontSize: "13px" }}>
              <li><strong>Μελλοντικές:</strong> Ενοικιάσεις που ξεκινούν μετά από σήμερα.</li>
              <li><strong>Για παραλαβή:</strong> Ενοικιάσεις που δεν έχουν επιστραφεί ενώ έχει περάσει η ημ. λήξης.</li>
              <li><strong>Δεν επεστράφησαν:</strong> Δεν έχει οριστεί ημερομηνία επιστροφής.</li>
              <li><strong>Ανεξόφλητες:</strong> Δεν έχει καταχωρηθεί ημερομηνία πληρωμής.</li>
              <li><strong>Ολοκληρωμένες:</strong> Έχουν πληρωθεί και επιστραφεί.</li>
              <li><strong>Μη Ολοκληρωμένες:</strong> Λείπει είτε η πληρωμή είτε η επιστροφή.</li>
            </ul>
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                onClick={() => setShowHelpPopup(false)}
                className="button-save">
                Κλείσιμο
              </button>
            </div>
          </div>
        )
      }

      {/* Rent popup */}
      {
        rentPopup && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fffde7",
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
              zIndex: 1000,
              maxWidth: "70%",
              minWidth: "300px",
              maxHeight: "80vh", // 👈 περιορισμός ύψους
              overflowY: "auto",  // 👈 scrollbar όταν χρειάζεται
              whiteSpace: "pre-wrap",
              position: "fixed",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setRentPopup(null)}
              style={{
                position: "absolute",
                top: "8px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.2em",
                cursor: "pointer"
              }}
            >
              ✖
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <h3 style={{ textAlign: "center" }} >{rentPopup.customer_name}</h3>
            </div>

            <div style={{ marginTop: "10px" }}>{rentToCopy(rentPopup)}</div>

            {/* Βuttons */}
            <div style={{ display: "flex", flexDirection: "column", rowGap: "4px", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>

              {/* Event button */}

              <button
                title="Δημιουργία calendar event(s)"
                className="button-edit"
                onClick={() => {
                  createGoogleCalendarEvent(rentPopup)
                  setRentPopup(null)
                }}
              >
                {calendarButtonText(rentPopup)}
              </button>

              <div>

                {/* Keep button */}
                <button
                  title="Άνοιγμα του Keep"
                  className="button-edit"
                  onClick={() => {
                    handleSendToKeep(rentPopup)
                    setRentPopup(null)
                  }}
                >
                  Keep&nbsp;📝&nbsp;
                </button>

                {/* eMail button */}
                <button
                  // style={{ marginRight: "0" }}
                  title="Προετοιμασία αποστολής email στο procompusound@gmail.com"
                  className="button-edit"
                  onClick={() => {
                    const to = "malatantis@gmail.com,procompusound@gmail.com";
                    const subject = encodeURIComponent(`Ενοικίαση: ${rentPopup.customer_name}`);
                    const body = encodeURIComponent(`${rentPopup.customer_name}\n\n${rentToCopy(rentPopup)}`);
                    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&bcc=mmalatantis@gmail.com`;
                    window.location.href = mailtoLink;
                  }}
                >
                  Email&nbsp;📧&nbsp;
                </button>

                {/* Close button */}
                <button
                  style={{ marginLeft: "0" }}
                  className="button-save"
                  onClick={() => setRentPopup(null)}
                >
                  <span class="dashicons dashicons-exit"></span>
                </button>
              </div>

            </div>
          </div>
        )
      }

    </div >

  )

}

export default Rents




