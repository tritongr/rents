/**
 * =============================================
 * Βασικό Customers component με δυνατότητα CRUD
 * Καλεί το CustomerModal για Create/Update
 * =============================================
 */

import "./Customers.scss"
import { isValidDate, isDatePast, formatDateShort, formatDateMidium } from "../../utilities/functionsLib"

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

    statusIcon = "Ναι 📅 "

    const cActiveRents = customer.active_rents.map(ar => {
      console.log("customer: ", customer)
      if (isDatePast(ar.end_date) && customer.nopaid == 1) {
        statusIcon = "Ναι ❌ "
      }
      const items = ar.items.map(i => i.name)
      return "<b>" + formatDateShort(ar.start_date) + "-" + formatDateShort(ar.end_date) + "</b>" + ": " + items
    })

    return statusIcon + parcelIcon + dollarIcon + "\n" + cActiveRents.join("\n")
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
        <div
          id="customers-top-section"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            fontSize: "small",
            gap: "10px", // προαιρετικό για απόσταση ανάμεσα
          }}
        >
          {/* Buttons */}
          <div id="rent-new-button" style={{ flex: "0 0 auto" }}>
            {/* Add New Customer Button */}
            <button
              title="Νέος πελάτης"
              onClick={onAddClick}
              className="button-add-new"
              style={{ margin: "5px 5px 5px 0" }}
            >
              <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
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
          <div id="rent-checkboxes" style={{ flex: "1 1 auto", textAlign: "center" }}>
            {/* is_pending */}
            <label style={{ marginRight: '1em' }} >
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={() => { setShowPendingOnly(!showPendingOnly); setShowNoPaidOnly(false); setShowNoRetOnly(false); }}
              />
              {' '}Εκκρεμείς
            </label>

            {/* no_returned */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showNoRetOnly}
                onChange={() => { setShowNoRetOnly(!showNoRetOnly); setShowNoPaidOnly(false); setShowPendingOnly(false) }}
              />
              {' '}Δεν επέστρεψαν
            </label>

            {/* no_paid */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showNoPaidOnly}
                onChange={() => { setShowNoPaidOnly(!showNoPaidOnly); setShowNoRetOnly(false); setShowPendingOnly(false) }}
              />
              {' '}Δεν πλήρωσαν
            </label>
          </div>

          {/* Search */}
          <div id="rent-search-bar" style={{ flex: "0 0 auto", flexBasis: "250px" }}>
            <input
              type="text"
              placeholder="🔍 Αναζήτηση πελάτη..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
              style={{ width: "100%", paddingRight: "2em", margin: "0" }} // extra padding right για το κουμπί
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
          <div className="grid-wrapper">
            <div className="customers-grid">

              {/* Header */}
              <div className="grid-cell">Όνομα</div>
              <div className="grid-cell">Επικοινωνία</div>
              <div className="grid-cell">Σχόλια</div>
              <div className="grid-cell">Εκκρεμεί</div>
              <div className="grid-cell">Actions</div>

              {/* Πελάτες */}
              {sortedCustomers.map(customer => (
                <React.Fragment key={customer.id}>
                  <div
                    className="grid-cell left"
                    onClick={() => onEditClick(customer)}
                    style={{ cursor: "pointer" }}
                  >
                    {customer.name} - <b>{customer.rents_count}</b>
                    {customer.rents_pending_count > 0 && (
                      <span style={{ fontWeight: "bold", color: "red" }}>
                        /{customer.rents_pending_count}
                      </span>
                    )}
                  </div>

                  <div className="grid-cell left">{customer.phone}</div>
                  <div className="grid-cell left">{customer.notes}</div>
                  <div className="grid-cell">
                    <div dangerouslySetInnerHTML={{ __html: getIsPending(customer) }} />
                  </div>

                  <div className="grid-cell">
                    <div className="action-buttons">
                      <button
                        className="button-save"
                        title={expandedCustomerIds.includes(customer.id) ? "Απόκρυψη ιστορικού" : "Εμφάνιση ιστορικού"}
                        onClick={() => toggleExpandedCustomer(customer.id)}
                      >
                        <span className={`dashicons ${expandedCustomerIds.includes(customer.id)
                          ? "dashicons-arrow-up-alt2"
                          : "dashicons-arrow-down-alt2"}`}></span>
                      </button>

                      <button
                        className="button-edit"
                        title="Επεξεργασία"
                        onClick={() => onEditClick(customer)}
                      >
                        <span className="dashicons dashicons-edit"></span>
                      </button>

                      <button
                        className="button-delete"
                        title="Διαγραφή"
                        onClick={() => onDeleteClick(customer)}
                      >
                        <span className="dashicons dashicons-trash"></span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Rents */}
                  {expandedCustomerIds.includes(customer.id) && (
                    <div className="grid-wrapper" style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
                      <div className="rents-grid">

                        {/* Header */}
                        <div className="grid-cell"></div>
                        <div className="grid-cell">Εξοπλισμός</div>
                        <div className="grid-cell">Έναρξη</div>
                        <div className="grid-cell">Λήξη</div>
                        <div className="grid-cell">Επιστροφή</div>
                        <div className="grid-cell">Πληρωμή</div>
                        <div className="grid-cell">Παρατηρήσεις</div>

                        {/* Rents του πελάτη */}
                        {rents
                          .filter(r => r.customer_id === customer.id)
                          .map((rent, index) => (
                            <React.Fragment key={index}>
                              <div className="grid-cell">{getRentIcons(rent, customer)}</div>
                              <div className="grid-cell left">{getRentedItemsNames(rent.items)}</div>
                              <div className="grid-cell">{formatDateMidium(rent.start_date)}</div>
                              <div className="grid-cell">{formatDateMidium(rent.end_date)}</div>
                              <div className="grid-cell">{isValidDate(rent.ret_date) ? formatDateMidium(rent.ret_date) : "-"}</div>
                              <div className="grid-cell">{isValidDate(rent.paid_date) ? formatDateMidium(rent.paid_date) : "-"}</div>
                              <div className="grid-cell left">{rent.notes}</div>
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}

            </div>
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