/**
 * =============================================
 * Βασικό Items component με δυνατότητα CRUD
 * Καλεί το ItemModal για Create/Update
 * =============================================
 */

import "./Items.scss"
import { isValidDate, isDatePast, formatDateShort } from "../../utilities/functionsLib"

import html2pdf from 'html2pdf.js'

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Confirm from "../utilities/Confirm"
import CollapsibleHeader from "../utilities/CollapsibleHeader"          // Toggles a panel (show/hide)
import { ItemModal } from "./ItemModal"                         // Modal form

function Items({ items, setItems, nullItem, API }) {

  /**
   * States
   */

  // Ελέγχει την εμφάνιση του <Confirm /> για την διαγραφή records
  const [isConfirmShowing, setIsConfirmShowing] = useState(false)

  // Collapsible items panel toggle
  const [isCollapsiblePanelOpen, setIsCollapsiblePanelOpen] = useState(true);

  // O current item όπου έγινε κλικ σε κάποιο button (Edit ή Delete)
  const [editingItem, setEditingItem] = useState({});

  // Toggle show/hide Item modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Item modal mode (New or Edit item)
  const [isNewItem, setIsNewItem] = useState(true);

  // Sorting & filtering
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [showRentedOnly, setShowRentedOnly] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  /** 
     * New record
    */

  // New button clicked
  function onAddClick() {
    setEditingItem(nullItem)
    setIsNewItem(true)
    setIsModalOpen(true)
  }

  // Save new button clicked 
  // *** AXIOS ***
  function onSaveNew() {

    // Axios parameters
    const axiosVars = {
      method: "POST",
      url: API.URL + "items",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingItem
    }

    // Success new record
    // Το response.data περιέχει το id του νέου record π.χ. {id: 139}
    function handleSuccess(response) {

      setItems(response.data)
      toast.success('Το είδος προστέθηκε!')
      setEditingItem(nullItem)
      setIsModalOpen(false)

      // const newId = response.data.id
      // if (newId) {
      //   setItems(prevItems => ([...prevItems, { ...editingItem, id: newId }]))
      //   sortDefault()
      // } else {
      //   toast.error("Αποτυχία προσθήκης!")
      // }
    }

    // Fail save new record
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την αποθήκευση."
      toast.error(msg)
      console.error("Error saving new editingItem: ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /** 
   * Edit record
  */

  // Edit button clicked
  function onEditClick(item) {
    setEditingItem(item)
    setIsNewItem(false)
    setIsModalOpen(true)
  }

  // Save edit button clicked 
  // *** AXIOS ***
  function onSaveEdit() {

    // Axios parameters
    const axiosVars = {
      method: "PUT",
      url: API.URL + "items",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingItem
    }

    // Success save edited record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {

      setItems(response.data)
      setEditingItem(nullItem)
      setIsModalOpen(false)

      toast.info('Το είδος ενημερώθηκε!')

    }

    // Fail save edited record 
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την ενημέρωση."
      toast.error(msg)
      console.error("Error saving editingItem: ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /**
   * Delete record
   */

  //  Εμφανίζει το <Confirm />
  function onDeleteClick(item) {
    setEditingItem(item)
    setIsConfirmShowing(true)
  }

  // Delete button clicked *** AXIOS ***
  // ΠΡΟΟΣΟΧΗ! καλείται από το <Confirm /> και όχι από εδώ.
  function onDelete() {

    // Axios parameters
    const axiosVars = {
      method: "DELETE",
      url: API.URL + "items",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingItem
    };

    // Success delete record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {
      setItems(response.data)
      toast.warn('Το είδος διαγράφηκε!') // toast message
    }

    // Fail delete record
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την διαγραφή."
      toast.error(msg)
      console.log("Error deleting item => ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /**
   * Sorting & Filtering
   */

  // Φιλτράρισμα βάσει searchText και Available Filter

  // Is item available
  function isItemAvailable(item) {
    var ret = true

    if (item.active_rents.length == 0) return true
    item.active_rents.some(rent => {
      if (isDatePast(rent.start_date)) {
        ret = false
      }
    })
    return ret
  }

  // Is item rented
  function isItemRented(item) {
    var ret = true

    if (item.active_rents.length == 0) return false
    item.active_rents.some(rent => {
      if (isDatePast(rent.start_date)) {
        ret = true
      }
    })
    return ret
  }

  // Filter items
  const filteredItems = items
    .filter(item => !showAvailableOnly || isItemAvailable(item))
    .filter(item => !showRentedOnly || isItemRented(item))
    .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()))

  // Sorting Λειτουργία
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortColumn === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    // if (sortColumn === "is_available") {
    //   return sortDirection === "asc" ? b.is_available - a.is_available : a.is_available - b.is_available
    // }

    return 0
  });

  // Εναλλαγή κατεύθυνσης sorting
  function handleSortToggle(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  // Is rented column
  function getIsAvailable(item) {

    // Αν το είδος δεν είναι νοικιασμένο ή προς ενοικίαση (rents.ret_date is empty)
    if (item.active_rents.length == 0) {
      return "Ναι ✅"
    }

    // Αν το είδος είναι νοικιασμένο
    var iIcon = "Μέχρι 📅 "

    const iActiveRents = item.active_rents.map(ar => {
      if (isDatePast(ar.start_date)) {
        iIcon = "Όχι ❌ "
      }
      return "<b>" + formatDateShort(ar.start_date) + "-" + formatDateShort(ar.end_date) + "</b>" + ": " + ar.customer_name
    })

    return iIcon + "\n" + iActiveRents.join("\n")
  }

  /**
    *  PDF Download
    */

  // Handlers στο container div του πίνακα και το h3 του τίτλου
  const tableRef = useRef(null)
  const titleRef = useRef(null)

  async function handleDownloadPdf() {

    // To conainer div των h3 και title 
    const element = document.querySelector('.pdf-container')

    // Απόκρυψη τελευταίας στήλης
    // ==========================
    // Βρίσκουμε όλους τους headers της τελευταίας στήλης (αν υπάρχουν)
    const lastColumnHeaders = element.querySelectorAll('thead tr th:last-child');

    // Βρίσκουμε όλα τα cells της τελευταίας στήλης
    const lastColumnCells = element.querySelectorAll('tbody tr td:last-child');

    // Προσθέτουμε in-line styles για απόκρυψη στην τελευταία στήλη
    lastColumnHeaders.forEach(header => header.style.display = 'none');
    lastColumnCells.forEach(cell => cell.style.display = 'none');

    // Προσθέτουμε την κλάση για απόκρυψη
    // lastColumnHeaders.forEach(header => header.classList.add('hide-on-pdf'));
    // lastColumnCells.forEach(cell => cell.classList.add('hide-on-pdf'));

    // Εμφάνιση του pdf Header
    // =======================
    // Το h3 του pdf title
    const titleElement = titleRef.current;

    // Αποθηκεύουμε την αρχική τιμή του display (αν υπάρχει)
    const originalDisplay = titleElement.style.display
    const originalText = titleElement.textContent; // Αποθηκεύουμε το αρχικό κείμενο (αν υπάρχει)

    // Εμφανίζουμε τον τίτλο προσωρινά
    titleElement.style.display = 'block';

    // Timestamp
    // =========
    const now = new Date()
    // const timestamp = (now.toISOString().slice(0, 19).replace(/T/, '_').replace(/:/g, '-'))
    const timestamp = now.toLocaleString('el-GR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    const fullTitle = `ΕΞΟΠΛΙΣΜΟΣ ${pdfFilterTitle()} στις ${timestamp}`;
    const filename = `Rents_Εξοπλισμός_${pdfFilterTitle()}_${timestamp}.pdf`

    // Ενημερώνουμε το κείμενο του τίτλου και το εμφανίζουμε προσωρινά
    titleElement.textContent = fullTitle;
    titleElement.style.display = 'block';

    // Τα options του html2pdf
    const opt = {
      margin: 10,
      filename, //`Rents_${timestamp.replace(/[\/: ]/g, '-')}.pdf`, // Χρησιμοποιούμε το timestamp στο filename
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    // Δημιουργία του PDF
    // ==================
    html2pdf().from(element).set(opt).save().finally(() => {

      // Επαναφέρουμε το αρχικό κείμενο και την εμφάνιση του h3
      titleElement.textContent = originalText;
      titleElement.style.display = originalDisplay;

      // Επαναφορά της τελευταίας στήλης
      // lastColumnHeaders.forEach(header => header.classList.remove('hide-on-pdf'));
      // lastColumnCells.forEach(cell => cell.classList.remove('hide-on-pdf'));
      lastColumnHeaders.forEach(header => header.style.display = '');
      lastColumnCells.forEach(cell => cell.style.display = '');

    })
  }

  // PDF Title 
  function pdfFilterTitle() {
    var title = ""

    if (showAvailableOnly) {
      title = title + "διαθέσιμος"
    }
    if (showRentedOnly) {
      title = title + "νοικιασμένος"
    }

    return title
  }

  /**
   *  Rendering
   */
  return (
    <div className="items-wrapper">

      {/* Collapsible header */}
      <div>
        <CollapsibleHeader
          title="📺 Εξοπλισμός"
          isCollapsiblePanelOpen={isCollapsiblePanelOpen}
          setIsCollapsiblePanelOpen={setIsCollapsiblePanelOpen}
        />
      </div>

      {/* Wrapper of add new, checkboxes, searcj  */}
      {isCollapsiblePanelOpen && (
        <div
          id="items-top-section"
        >

          {/* Add New  + PDF buttons */}
          <div id="items-new-button">
            <button
              title="Νέο είδος"
              onClick={onAddClick}
              className="button-add-new"
            >
              <span style={{ verticalAlign: "middle" }} class="dashicons dashicons-plus-alt2"></span>
            </button>

            <button
              title="Download PDF"
              onClick={handleDownloadPdf}
              className="button-delete hide-on-mobile"
            >
              <span class="dashicons dashicons-download"></span>
            </button>
          </div>

          {/* Checkboxes  */}
          <div id="items-checkboxes" style={{ display: "flex", justifyContent: "center" }}>

            {/* Toggle showAvailable filter */}
            <div >
              <label >
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={() => { setShowRentedOnly(false); setShowAvailableOnly(!showAvailableOnly) }}
                />
                &nbsp;Διαθέσιμα &nbsp;&nbsp;
              </label>
            </div>

            {/* Toggle showRented filter */}
            <div >
              <label >
                <input
                  type="checkbox"
                  checked={showRentedOnly}
                  onChange={() => { setShowAvailableOnly(false); setShowRentedOnly(!showRentedOnly) }}
                />
                &nbsp;Νοικιασμένα &nbsp;&nbsp;
              </label>
            </div>
          </div>

          {/* Search */}
          <div id="items-search-bar" >
            <input
              type="text"
              placeholder="🔍 Αναζήτηση εξοπλισμού..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
              style={{ width: "100%", paddingRight: "2em", border: "solid 1px red" }}
            />
            {searchText && (
              <button className="button-clear-inside" onClick={() => setSearchText("")}>
                ✖
              </button>
            )}
          </div>
        </div>
      )
      }

      {/* Ο Πίνακας */}
      {
        isCollapsiblePanelOpen && (
          <div className="pdf-container">
            <h4 ref={titleRef} style={{ display: 'none', textAlign: 'center', marginBottom: '10px' }}>ΕΞΟΠΛΙΣΜΟΣ</h4>
            <table className="" ref={tableRef}>

              {/* Table header */}
              <thead className="">
                <tr>
                  {/* Sortable column name */}
                  {/* Όνομασία */}
                  <th
                    className="sortable-column-header"
                    onClick={() => handleSortToggle("name")}
                  >
                    Όνομασία ({filteredItems.length}) {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>

                  {/* Διαθέσιμο */}
                  <th
                    className=""
                  >
                    Διαθέσιμο
                  </th>

                  {/* Σχόλια */}
                  <th className="">Σχόλια</th>

                  {/* Actions */}
                  <th className="">Actions</th>
                </tr>
              </thead>

              {/* Table data */}
              <tbody>
                {
                  // Filtered + Sorted items
                  sortedItems.map(item => (
                    <tr
                      key={item.id}
                      className={item.is_rented != 1 ? "active-row" : ""}
                    >
                      {/* Name */}
                      <td className="sortable-column-header" onClick={() => onEditClick(item)}>{item.name}</td>

                      {/* Is Available */}
                      <td style={{ textAlign: "center", whiteSpace: 'pre-wrap' }} >
                        <div dangerouslySetInnerHTML={{ __html: getIsAvailable(item) }} />
                      </td>

                      {/* Description */}
                      <td style={{ whiteSpace: "pre-wrap" }}>{item.description}</td>

                      {/* Action buttons */}
                      <td>
                        <div id="action-buttons">
                          {/* Edit button */}
                          <button
                            title="Επεξεργασία γραμμής"
                            className="button-edit"
                            onClick={() => onEditClick(item)}
                            style={{ marginRight: 7 }}
                          >
                            <span className="dashicons dashicons-edit"></span>
                          </button>

                          {/* Delete button */}
                          <button
                            title="Διαγραφή γραμμής"
                            className="button-delete"
                            onClick={() => onDeleteClick(item)}
                          >
                            <span class="dashicons dashicons-trash"></span>
                          </button>
                        </div>
                      </td>
                    </tr>))
                }
              </tbody>
            </table>
          </div>
        )
      }

      {/* 
        * Modal form για Edit & Add record 
        * Εμφανίζεται μόνο όταν isModalOpen = true 
      */}

      {
        isModalOpen && (<ItemModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          editingItem={editingItem}
          setEditingItem={setEditingItem}
          onSaveEdit={onSaveEdit}
          onSaveNew={onSaveNew}
          isNewItem={isNewItem}
        />)
      }

      {/* το Confirmation on delete */}
      <Confirm
        message={`Να διαγραφεί το είδος ${editingItem.id} ;`}
        onConfirmYes={onDelete}
        isShowing={isConfirmShowing}
        setIsShowing={setIsConfirmShowing}
      />

    </div >

  )

}
export default Items