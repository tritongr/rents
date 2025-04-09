/**
 * =============================================
 * Βασικό Items component με δυνατότητα CRUD
 * Καλεί το ItemModal για Create/Update
 * =============================================
 */

import "./Items.scss"

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
  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
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
      console.error("Error saving new editingItem: ", error)
      toast.error("Αποτυχία δημιουργίας!")
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

      // // Το τοπικό items ενημερώνεται από το editingItem
      // setItems(prevItems => (
      //   prevItems.map(item => (item.id === editingItem.id ? editingItem : item))
      // ))

      // // toast message
      // toast.info('Το είδος ενημερώθηκε!')

      // // Sort by name
      // sortDefault()

    }

    // Fail save edited record 
    function handleError(error) {
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

  // Φιλτράρισμα βάσει searchText και Available Filter
  const filteredItems = items
    .filter(item => !showAvailableOnly || item.is_available == 1) // active items
    .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase())) // name search

  // Sorting Λειτουργία
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortColumn === "name") {
      return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    }
    if (sortColumn === "is_available") {
      return sortDirection === "asc" ? b.is_available - a.is_available : a.is_available - b.is_available
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
    <div className="items-wrapper">

      {/* Collapsible header */}
      <div>
        <CollapsibleHeader
          title="Εξοπλισμός"
          isCollapsiblePanelOpen={isCollapsiblePanelOpen}
          setIsCollapsiblePanelOpen={setIsCollapsiblePanelOpen}
        />
      </div>

      {/* Add New item Button */}
      {isCollapsiblePanelOpen && (
        <button
          title="Νέο είδος"
          onClick={onAddClick}
          className="button-add-new"
        >
          <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
        </button>
      )}

      {/* Filter controls  */}
      {isCollapsiblePanelOpen && (
        <div style={{ display: "flex", alignItems: "center", marginLeft: "5px" }}>

          {/* Toggle showAvailable filter */}
          <div style={{ flex: "1" }} >
            <label className="active-filter" style={{ whiteSpace: "nowrap" }} >
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={() => setShowAvailableOnly(!showAvailableOnly)}
              />
              &nbsp;Διαθέσιμα &nbsp;&nbsp;
            </label>
          </div>

          {/* Search item input */}
          <div style={{ flex: "5" }}>
            <input
              type="text"
              placeholder="🔍 Αναζήτηση εξοπλισμού..."
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
                  Όνομασία {sortColumn === "name" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Περιγραφή</th>
                <th
                  className="sortable-column-header"
                  onClick={() => handleSortToggle("is_available")}
                >
                  Διαθέσιμο {sortColumn === "is_available" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
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
                    className={item.is_available != 0 ? "active-row" : ""}
                  >
                    {/* Name */}
                    <td>{item.id} - {item.name}</td>

                    {/* Description */}
                    <td>{item.description}</td>

                    {/* Is Available */}
                    <td style={{ textAlign: "center" }} >
                      {item.is_available != 0 ? "✅" : "❌"}
                    </td>
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