/**
 * =============================================
 * Βασικό Customers component με δυνατότητα CRUD
 * Καλεί το CustomerModal για Create/Update
 * =============================================
 */

import "./Customers.scss"

import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Confirm from "../utilities/Confirm"
import CollapsibleHeader from "../utilities/CollapsibleHeader"          // Toggles a panel (show/hide)
import { CustomerModal } from "./CustomerModal"                         // Modal form

function Customers({ customers, setCustomers, nullCustomer, API }) {

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
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

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

  // Φιλτράρισμα βάσει searchText και Active Filter
  const filteredCustomers = customers
    .filter(customer => !showActiveOnly || customer.is_active == 1) // is_active filter
    .filter(customer => customer.name.toLowerCase().includes(searchText.toLowerCase())) // name search

  // Sorting Λειτουργία
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortColumn === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    if (sortColumn === "is_active") {
      return sortDirection === "asc" ? b.is_active - a.is_active : a.is_active - b.is_active
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

      {/* Add New Customer Button */}
      {isCollapsiblePanelOpen && (
        <button
          title="Νέος πελάτης"
          onClick={onAddClick}
          className="button-add-new"
        >
          <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
        </button>
      )}

      {/* Filter controls  */}
      {isCollapsiblePanelOpen && (
        <div style={{ display: "flex", alignItems: "center", marginLeft: "5px" }}>

          {/* Toggle showActive filter */}
          <div style={{ flex: "1" }} >
            <label className="active-filter" style={{ whiteSpace: "nowrap" }} >
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={() => setShowActiveOnly(!showActiveOnly)}
              />
              &nbsp;Ενεργοί &nbsp;&nbsp;
            </label>
          </div>

          {/* Search customer input */}
          <div style={{ flex: "5" }}>
            <input
              type="text"
              placeholder="🔍 Αναζήτηση πελάτη..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
            />
            {searchText && (
              <button className="button-clear" onClick={() => setSearchText("")}>
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
          <table className="">

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
              {
                // Filtered + Sorted customers
                sortedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className={customer.is_pending == 1 ? "pending-row" : ""}
                  >
                    {/* Name */}
                    <td>{customer.name}</td>
                    {/* Notes */}
                    <td style={{ whiteSpace: "pre-wrap" }}>{customer.notes}</td>
                    {/* Active */}
                    <td style={{ textAlign: "center" }} >
                      {customer.is_pending == 1 ? "Ναι ✅" : "Όχι ❌"}
                    </td>
                    {/* Action buttons */}
                    <td>
                      <div id="action-buttons">
                        {/* Edit button */}
                        <button
                          title="Επεξεργασία γραμμής"
                          className="button-edit"
                          onClick={() => onEditClick(customer)}
                          style={{ marginRight: 7 }}
                        >
                          <span className="dashicons dashicons-edit"></span>
                        </button>

                        {/* Delete button */}
                        <button
                          title="Διαγραφή γραμμής"
                          className="button-delete"
                          onClick={() => onDeleteClick(customer)}
                        >
                          <span class="dashicons dashicons-trash"></span>
                        </button>
                      </div>
                    </td>
                  </tr>))
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