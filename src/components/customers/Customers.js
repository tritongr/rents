/**
 * =============================================
 * Βασικό Customers component με δυνατότητα CRUD
 * Καλεί το CustomerModal για Create/Update
 * =============================================
 */

import "./Customers.scss"
import { isValidDate, isDatePast, formatDateShort, formatDateMidium } from "../../utilities/functionsLib"

import html2pdf from 'html2pdf.js'

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Confirm from "../utilities/Confirm"
import CollapsibleHeader from "../utilities/CollapsibleHeader"          // Toggles a panel (show/hide)
import { CustomerModal } from "./CustomerModal"                         // Modal form

function Customers({ rents, items, customers, setCustomers, nullCustomer, API }) {

  if (!customers || customers.length === 0) {
    return <div>Loading...</div>;
  }

  /**
   * States
   */

  // Ελέγχει την εμφάνιση του <Confirm /> για την διαγραφή records
  const [isConfirmShowing, setIsConfirmShowing] = useState(false)

  // Collapsible customers panel toggle
  const [isCollapsiblePanelOpen, setIsCollapsiblePanelOpen] = useState(true);

  // O current customer όπου έγινε κλικ σε κάποιο button (Edit ή Delete)
  const [editingCustomer, setEditingCustomer] = useState({});

  // Toggle show/hide customer modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Customer modal mode (New or Edit customer)
  const [isNewCustomer, setIsNewCustomer] = useState(true);

  // Sorting & filtering
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [showNoPaidOnly, setShowNoPaidOnly] = useState(false)
  const [showNoRetOnly, setShowNoRetOnly] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")

  const [expandedCustomerIds, setExpandedCustomerIds] = useState([]);

  /** 
     * New record
    */

  // New button clicked

  function onAddClick() {
    setEditingCustomer(nullCustomer)
    setIsNewCustomer(true)
    setIsModalOpen(true)
  }

  // Save new button clicked 
  // *** AXIOS ***
  function onSaveNew() {

    // Axios parameters
    const axiosVars = {
      method: "POST",
      url: API.URL + "customers",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingCustomer
    }

    // Success new record
    // Το response.data περιέχει το id του νέου record π.χ. {id: 139}
    function handleSuccess(response) {

      setCustomers(response.data)
      setEditingCustomer(nullCustomer)
      setIsModalOpen(false)

      toast.success('Ο πελάτης προστέθηκε!')

    }

    // Fail save new record
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την αποθήκευση."
      toast.error(msg)
      console.error("Error saving new editingCustomer: ", error)
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
  function onEditClick(customer) {
    setEditingCustomer(customer)
    setIsNewCustomer(false)
    setIsModalOpen(true)
  }

  // Save edit button clicked 
  // *** AXIOS ***
  function onSaveEdit() {

    // Axios parameters
    const axiosVars = {
      method: "PUT",
      url: API.URL + "customers",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingCustomer
    }

    // Success save edited record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {

      setCustomers(response.data)
      setEditingCustomer(nullCustomer)
      setIsModalOpen(false)

      toast.info('Ο πελάτης ενημερώθηκε!')

    }

    // Fail save edited record 
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την ενημέρωση."
      toast.error(msg)
      console.error("Error saving editingCustomer: ", error)
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
  function onDeleteClick(customer) {
    setEditingCustomer(customer)
    setIsConfirmShowing(true)
  }

  // Delete button clicked *** AXIOS ***
  // ΠΡΟΟΣΟΧΗ! καλείται από το <Confirm /> και όχι από εδώ.
  function onDelete() {

    // Axios parameters
    const axiosVars = {
      method: "DELETE",
      url: API.URL + "customers",
      headers: { "X-WP-Nonce": API.NONCE },
      data: editingCustomer
    };

    // Success delete record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {
      console.log(response.data)
      setCustomers(response.data)
      setEditingCustomer(nullCustomer)
      toast.warn('Ο πελάτης διαγράφηκε!') // toast message
    }

    // Fail delete record
    function handleError(error) {
      const msg = error.response?.data?.error || "Κάτι πήγε στραβά κατά την διαγραφή."
      toast.error(msg)
      console.error("Error deleting customer: ", error)
    }

    // Axios call
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  /**
   * Sorting & Filtering
   */

  // Φιλτράρισμα βάσει searchText και is_pending
  const filteredCustomers = customers
    .filter(c => !showPendingOnly || c.is_pending == 1)
    .filter(c => !showNoRetOnly || c.no_returned == 1)
    .filter(c => !showNoPaidOnly || c.no_paid == 1)
    .filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))

  // Sorting Λειτουργία
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortColumn === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }

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


  // Customer icons
  function getCustomerIcons(customer) {

    var icons = ""

    if (customer.is_pending != 1) {
      return "✅"
    }
    if (customer.no_returned == 1) {
      icons = "📺"
    }
    if (customer.no_paid == 1) {
      icons = icons + "💲"
    }

    return icons
  }

  // Rent icons
  function getRentIcons(rent, customer) {

    var icon = ""

    if (customer.is_pending != 1) {
      return "✅"
    }

    // 📅❌

    if (isDatePast(rent.end_date)) {
      icon = "❌"
    } else {
      icon = "📅"
    }
    return icon + getCustomerIcons(customer)
  }


  // Is pending column
  function getIsPending(customer) {


    // ΝΟΤΕ: active rent είναι αυτή με κενή ret_date
    //       δλδ o πελάτης δεν έχει ανεπίστρεπτα = έχει επιστρέψει τον εξοπλισμό
    // ========================================================================

    // Αν δεν εκκρεμεί ο πελάτης (ret_date και paid_date συμπληρωμένες)
    if (customer.is_pending != 1) {
      return "Όχι ✅"
    }

    var parcelIcon = ""
    var dollarIcon = ""
    var statusIcon = ""

    // Άν ο πελάτης δεν έχει εκκρεμείς ενοικιάσεις (έχει επιστρέψει τον εξοπλισμό)
    // τότε μόνο χρωστάει. Όλες οι ret_dates στα rents του είναι συμπληρωμένες.
    if (customer.active_rents.length = 0) {
      return "Ναι ❌💲"
    }

    // Αν δεν επέστρεψε εξοπλισμό
    if (customer.no_returned == 1) {
      parcelIcon = "📺" // 📦
    }

    // Αν δεν πλήρωσε
    if (customer.no_paid == 1) {
      dollarIcon = "💲"
    }

    return "Ναι " + parcelIcon + dollarIcon
  }

  /**
   *  Expand/Collaps customers list
   * 
   */

  // Global expand
  const toggleAllCustomers = () => {
    if (expandedCustomerIds.length === sortedCustomers.length) {
      setExpandedCustomerIds([]);
    } else {
      setExpandedCustomerIds(sortedCustomers.map(c => c.id));
    }
  };


  // Expand customer's rents 
  function toggleExpandedCustomer(customerId) {
    setExpandedCustomerIds(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  }

  // Τα Items names από τον rented_items array 
  function getRentedItemsNames(items_ids) {

    const itemNames = items_ids.map((iId) => {
      const item = items.find((i) => i.id == iId);
      return item ? item.name : 'Άγνωστο είδος';
    });

    return itemNames.map((name, index) => (
      <div key={index}>{name}</div>
    ));
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
    const fullTitle = `ΠΕΛΑΤΕΣ στις ${timestamp}`;
    const filename = `Rents_Customers_${timestamp}.pdf`

    // Ενημερώνουμε το κείμενο του τίτλου και το εμφανίζουμε προσωρινά
    titleElement.textContent = fullTitle;
    titleElement.style.display = 'block';

    // Τα options του html2pdf
    const opt = {
      margin: 10,
      filename, //`Rents_${timestamp.replace(/[\/: ]/g, '-')}.pdf`, // Χρησιμοποιούμε το timestamp στο filename
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
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

  /**
   *  Rendering
   */
  return (
    <div className="customers-wrapper">

      {/* Collapsible header */}
      <div>
        <CollapsibleHeader
          title="Πελάτες"
          isCollapsiblePanelOpen={isCollapsiblePanelOpen}
          setIsCollapsiblePanelOpen={setIsCollapsiblePanelOpen}
        />
      </div>

      {isCollapsiblePanelOpen && (
        <div id="customers-top-section">

          {/* Add New  + PDF + Expand buttons */}
          <div id="customers-new-button">
            {/* Add New + PDF buttons */}
            <button
              title="Νέος πελάτης"
              onClick={onAddClick}
              className="button-add-new"
            >
              <span class="dashicons dashicons-plus-alt2"></span>
            </button>

            <button
              title="Download PDF"
              onClick={handleDownloadPdf}
              className="button-delete hide-on-mobile"
            >
              <span class="dashicons dashicons-download"></span>
            </button>

            {/* Global expand/collapse button */}
            <button
              onClick={toggleAllCustomers}
              className="button-dash-icon-up"
              title={
                expandedCustomerIds.length === sortedCustomers.length
                  ? "Απόκρυψη ιστορικών"
                  : "Εμφάνιση ιστορικών"
              }
            >
              <span
                className={`dashicons ${expandedCustomerIds.length === sortedCustomers.length
                  ? "dashicons-arrow-up-alt2"
                  : "dashicons-arrow-down-alt2"
                  }`}
              ></span>
            </button>
          </div>

          {/* Checkboxes */}
          <div id="customers-checkboxes" >

            {/* Container για is_pending και no_returned */}
            <div>
              {/* is_pending */}
              <label>
                <input
                  type="checkbox"
                  checked={showPendingOnly}
                  onChange={() => { setShowPendingOnly(!showPendingOnly); setShowNoPaidOnly(false); setShowNoRetOnly(false); }}
                />
                &nbsp;Εκκρεμείς&nbsp;&nbsp;
              </label>

              {/* no_returned */}
              <label>
                <input
                  type="checkbox"
                  checked={showNoRetOnly}
                  onChange={() => { setShowNoRetOnly(!showNoRetOnly); setShowNoPaidOnly(false); setShowPendingOnly(false) }}
                />
                &nbsp;Δεν επέστρεψαν&nbsp;&nbsp;
              </label>
            </div>

            {/* no_paid */}
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={showNoPaidOnly}
                  onChange={() => { setShowNoPaidOnly(!showNoPaidOnly); setShowNoRetOnly(false); setShowPendingOnly(false) }}
                />
                &nbsp;Δεν πλήρωσαν
              </label>
            </div>
          </div>

          {/* Search */}
          <div id="customers-search-bar">
            <input
              type="text"
              placeholder="🔍 Αναζήτηση πελάτη..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
              style={{ width: "100%", paddingRight: "2em", margin: "0", border: "solid 1px red" }}
            />
            {searchText && (
              <button className="button-clear-inside" onClick={() => setSearchText("")}>
                ✖
              </button>
            )}
          </div>
        </div>
      )}

      {/* Ο Πίνακας */}
      {
        isCollapsiblePanelOpen && (
          <div className="pdf-container">
            <h3 ref={titleRef} style={{ display: 'none', textAlign: 'center', marginBottom: '10px' }}>ΠΕΛΑΤΕΣ</h3>
            <table className="" ref={tableRef}>

              {/* Table header */}
              <thead className="">
                <tr>
                  {/* Sortable column name */}
                  <th
                    className="sortable-column-header"
                    onClick={() => handleSortToggle("name")}
                  >
                    Όνομα ({sortedCustomers.length}) {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="">Επικοινωνία</th>
                  <th className="">Σχόλια</th>
                  <th
                    className="sortable-column-header"
                    onClick={() => handleSortToggle("is_active")}
                  >
                    Εκκρεμεί {sortColumn === "is_active" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="">Actions</th>
                </tr>
              </thead>

              {/* Table data */}
              <tbody>
                {sortedCustomers.map(customer => (
                  <React.Fragment
                    key={customer.id}
                  >
                    <tr
                      style={{ borderTop: "2px solid  #0073a8", borderRight: "2px solid  #0073a8", borderLeft: "2px solid  #0073a8" }}
                      className={customer.is_pending == 1 ? "pending-row" : ""}>

                      {/* Name */}
                      <td
                        className="sortable-column-header"
                        onClick={() => onEditClick(customer)}>
                        {customer.name + " - "}

                        <b>{customer.rents_count}</b>
                        {customer.rents_pending_count > 0 ? "/" : ""}
                        <span
                          style={{ fontWeight: "bold", color: "red" }}
                        >
                          {customer.rents_pending_count > 0 ? customer.rents_pending_count : ""}
                        </span>

                      </td>

                      {/* Phone */}
                      <td style={{ whiteSpace: "pre-wrap" }}>{customer.phone}</td>

                      {/* Notes */}
                      <td style={{ whiteSpace: "pre-wrap" }}>{customer.notes}</td>

                      {/* Is pending */}
                      <td style={{ textAlign: "center", whiteSpace: 'pre-wrap' }}>
                        <div dangerouslySetInnerHTML={{ __html: getIsPending(customer) }} />
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons">

                          {/* Expand Rents */}
                          <button
                            title={
                              expandedCustomerIds.includes(customer.id)
                                ? "Απόκρυψη ιστορικού"
                                : "Εμφάνιση ιστορικού"
                            }
                            className="button-save"
                            onClick={() => toggleExpandedCustomer(customer.id)}
                          >
                            <span className={`dashicons ${expandedCustomerIds.includes(customer.id)
                              ? "dashicons-arrow-up-alt2"
                              : "dashicons-arrow-down-alt2"
                              }`}></span>
                          </button>

                          {/* Edit button */}
                          <button
                            title="Επεξεργασία"
                            className="button-edit"
                            onClick={() => onEditClick(customer)}
                            style={{ marginRight: 7 }}
                          >
                            <span className="dashicons dashicons-edit"></span>
                          </button>

                          {/* Delete */}
                          <button
                            title="Διαγραφή"
                            className="button-delete"
                            onClick={() => onDeleteClick(customer)}
                            style={{ marginRight: 7 }}>
                            <span class="dashicons dashicons-trash"></span>
                          </button>

                        </div>
                      </td>
                    </tr>

                    {/* Expanded rents row */}
                    {
                      expandedCustomerIds.includes(customer.id) && (
                        <tr
                          className="expanded-row"
                          style={{ borderBottom: "2px solid  #0073a8", borderRight: "2px solid  #0073a8", borderLeft: "2px solid  #0073a8" }}
                        >
                          <td colSpan={5}>
                            <div className="expanded-container">
                              <h4
                                className="sortable-column-header"
                                style={{ marginBottom: 10 }}
                                onClick={() => toggleExpandedCustomer(customer.id)}
                              >

                                {getCustomerIcons(customer)}{" "}
                                <b> {customer.rents_count}</b>
                                {customer.rents_pending_count > 0 ? "/" : ""}
                                <span
                                  style={{ fontWeight: "bold", color: "red" }}
                                >
                                  {customer.rents_pending_count > 0 ? customer.rents_pending_count : ""}{" "}
                                </span>

                                <strong>
                                  {customer.name}
                                </strong>

                                <span style={{ fontSize: "large" }}> ιστορικό ενοικιάσεων</span>
                              </h4>

                              <table className="expanded-rents-table">
                                <thead>
                                  <tr>
                                    {/* Empty first column just for spacing */}
                                    <th style={{ width: "5%" }}></th>
                                    <th style={{ textAlign: "center" }} >Εξοπλισμός</th>
                                    <th style={{ textAlign: "center" }} >Έναρξη</th>
                                    <th style={{ textAlign: "center" }} >Λήξη</th>
                                    <th style={{ textAlign: "center" }} >Επιστροφή</th>
                                    <th style={{ textAlign: "center" }} >Πληρωμή</th>
                                    <th style={{ textAlign: "center" }}>Παρατηρήσεις</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rents
                                    .filter(r => r.customer_id === customer.id)
                                    .map((rent, index) => (
                                      <tr
                                        key={index}
                                        // backgroundColor: isValidDate(rent.paid_date) && isValidDate(rent.ret_date) ? '#d6ffd6' : "#d6e8ff" }classname={isValidDate(rent.paid_date) && isValidDate(rent.ret_date) ? "active-row" : ""}
                                        style={{ backgroundColor: isValidDate(rent.paid_date) && isValidDate(rent.ret_date) ? '#d6ffd6' : "#d6e8ff" }}
                                      >
                                        <td>{getRentIcons(rent, customer)} </td> {/* empty spacing cell */}
                                        <td>{getRentedItemsNames(rent.items)}</td>
                                        <td style={{ textAlign: "center" }} >{formatDateMidium(rent.start_date)}</td>
                                        <td style={{ textAlign: "center" }} >{formatDateMidium(rent.end_date)}</td>
                                        <td style={{ textAlign: "center" }} >{isValidDate(rent.ret_date) ? formatDateMidium(rent.ret_date) : "-"}</td>
                                        <td style={{ textAlign: "center" }} >{isValidDate(rent.paid_date) ? formatDateMidium(rent.paid_date) : "-"}</td>
                                        <td style={{ textAlign: "center", whiteSpace: 'pre-wrap', textAlign: "left" }} >{rent.notes}</td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )
                    }
                  </React.Fragment>
                ))}
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
        isModalOpen && (<CustomerModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          editingCustomer={editingCustomer}
          setEditingCustomer={setEditingCustomer}
          onSaveEdit={onSaveEdit}
          onSaveNew={onSaveNew}
          isNewCustomer={isNewCustomer}
        />)
      }

      {/* το Confirmation on delete */}
      <Confirm
        message={`Να διαγραφεί ο πελάτης ${editingCustomer.id} ;`}
        onConfirmYes={onDelete}
        isShowing={isConfirmShowing}
        setIsShowing={setIsConfirmShowing}
      />

    </div >

  )

}
export default Customers