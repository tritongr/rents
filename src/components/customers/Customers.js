/**
 * =============================================
 * Βασικό Customers component με δυνατότητα CRUD
 * Καλεί το CustomerModal για Crete/Update
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

function Customers({ customers, setCustomers, nullCustomer, customersAPI }) {

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
      url: customersAPI.URL,
      headers: { "X-WP-Nonce": customersAPI.NONCE },
      data: editingCustomer
    }

    // Success new record
    // Το response.data περιέχει το id του νέου record π.χ. {id: 139}
    function handleSuccess(response) {

      const newId = response.data.id
      setCustomers(prevCustomers => ([...prevCustomers, { ...editingCustomer, id: newId }]))

      setEditingCustomer(nullCustomer)
      setIsModalOpen(false)
      toast.success('Ο νέος πελάτης προστέθηκε!') // toast message

      // Sort by name
      sortDefault()
    }

    // Fail save new record
    function handleError(error) {
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
      url: customersAPI.URL,
      headers: { "X-WP-Nonce": customersAPI.NONCE },
      data: editingCustomer
    }

    // Success save edited record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {

      // Το τοπικό customers ενημερώνεται από το editingCustomer
      setCustomers(prevCustomers => (
        prevCustomers.map(customer => (customer.id === editingCustomer.id ? editingCustomer : customer))
      ))

      setEditingCustomer(nullCustomer)
      setIsModalOpen(false)

      // toast message
      toast.info('Ο πελάτης ενημερώθηκε!')

      // Sort by name
      sortDefault()

    }

    // Fail save edited record 
    function handleError(error) {
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
      url: customersAPI.URL,
      headers: { "X-WP-Nonce": customersAPI.NONCE },
      data: editingCustomer
    };

    // Success delete record
    // Το response.data περιέχει ολόκληρο τον πίνακα
    function handleSuccess(response) {
      setCustomers(response.data)
      toast.warn('Ο πελάτης διαγράφηκε!') // toast message
    }

    // Fail delete record
    function handleError(error) {
      console.error("Error deleting item: ", error)
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
    .filter(customer => !showActiveOnly || customer.active != 0) // active customers
    .filter(customer => customer.name.toLowerCase().includes(searchText.toLowerCase())) // name search

  // Sorting Λειτουργία
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortColumn === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    if (sortColumn === "active") {
      return sortDirection === "asc" ? b.active - a.active : a.active - b.active
    }

    return 0
  });

  // Εναλλαγή κατεύθυνσης sorting
  function handleSortToggle(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      sortDefault()
    }
  }

  // Εναλλαγή κατεύθυνσης sorting
  function sortDefault() {
    setSortColumn("name");
    setSortDirection("asc");
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
          title="Νέα γραμμή"
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
            <thead className="">
              <tr>
                {/* Sortable column name */}
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("name")}
                >
                  Όνομα {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Σχόλια</th>
                <th className="">Τηλέφωνο</th>
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("active")}
                >
                  Active {sortColumn === "active" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                // Filtered + Sorted customers
                sortedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className={customer.active != 0 ? "active-row" : ""}
                  >
                    {/* Name */}
                    <td>{customer.id} - {customer.name}</td>
                    {/* Notes */}
                    <td>{customer.notes}</td>
                    {/* Phone */}
                    <td>{customer.phone}</td>
                    {/* Active */}
                    <td style={{ textAlign: "center" }} >
                      {customer.active != 0 ? "✅" : "❌"}
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
        message={`Να διαγραφεί ο πελάτης ${editingCustomer.name} ;`}
        onConfirmYes={onDelete}
        isShowing={isConfirmShowing}
        setIsShowing={setIsConfirmShowing}
      />

    </div >

  )

}
export default Customers