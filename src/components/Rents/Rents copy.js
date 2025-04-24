/**
 * =============================================
 * Βασικό Rents component με δυνατότητα CRUD
 * Καλεί το RentModal για Create/Update
 * =============================================
 */

import "./Rents.scss"
import { isValidDate, isDatePast, formatDateShort, formatDateShort3 } from "../../utilities/functionsLib"

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
  const [showCompleted, setShowCompleted] = useState(false)
  const [showNotCompleted, setShowNotCompleted] = useState(false)

  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState("start_date")
  const [sortDirection, setSortDirection] = useState("asc")

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
    // Το response.data περιέχει το id του νέου record π.χ. {id: 139}
    function handleSuccess(response) {

      setRents(response.data)
      setEditingRent(nullRent)
      setSelectedItems([])
      setSelectedCustomer({})
      setIsModalOpen(false)

      toast.success('Η ενοικίαση προστέθηκε!')
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

      setRents(response.data)
      setEditingRent(nullRent)
      setSelectedItems([])
      setIsModalOpen(false)

      toast.info('Η ενοικίαση ενημερώθηκε!')

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
    });

    return itemNames.map((name, index) => (
      <div key={index}>{name}</div>
    ));
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
    .filter(r => !showFutured || !isDatePast(r.start_date))  // Μελλοντικές
    .filter(r => !showToCollect || (isDatePast(r.end_date) && !isValidDate(r.ret_date)))  // Για παραλλαβή
    .filter(r => !showUnreturned || (!isValidDate(r.ret_date) && isDatePast(r.end_date))) // Μη επιστραμμένα
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
   *  Rendering
   */

  if (rents.length == 0) {
    return
  }

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

      {/* Add New Rent Button */}
      {/* {isCollapsiblePanelOpen && (
        <div>
          <button
            title="Νέα ενοικίαση"
            onClick={onAddClick}
            className="button-add-new"
          >
            <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
          </button>

        </div>
      )} */}

      {/* Filter controls & Sort text  */}
      {isCollapsiblePanelOpen && (
        <div style={{ display: "flex", fontSize: "small", alignItems: "center", margin: "10px 3px" }}>

          {/* New record button */}
          <div style={{ flex: "1", padding: "5px" }}>
            <button
              title="Νέα ενοικίαση"
              onClick={onAddClick}
              className="button-add-new"
            >
              <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
            </button>

          </div>

          {/* Checkboxes */}
          <div style={{ flex: "7", padding: "0 " }} >
            {/* Μελλοντικές */}
            <label style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showFutured}
                onChange={() => { setShowFutured(!showFutured); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false) }}
              />
              {' '}Μελλοντικές
            </label>

            {/* To collect */}
            <label style={{ marginRight: '1em', fontWeight: "bold" }}>
              <input
                type="checkbox"
                checked={showToCollect}
                onChange={() => { setShowToCollect(!showToCollect); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowNotCompleted(false); setShowFutured(false); }}
              />
              {' '}Για παραλαβή
            </label>

            {/* Unreturned */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showUnreturned}
                onChange={() => { setShowUnreturned(!showUnreturned); setShowUnpaid(false); setShowFutured(false); setShowCompleted(false); setShowNotCompleted(false); setShowToCollect(false) }}
              />
              {' '}Δεν επεστράφησαν
            </label>

            {/* Unpaid */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showUnpaid}
                onChange={() => { setShowUnpaid(!showUnpaid); setShowUnreturned(false); setShowFutured(false); setShowCompleted(false); etShowNotCompleted(false); setShowToCollect(false) }}
              />
              {' '}Ανεξόφλητες
            </label>

            {/* Completed */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={() => { setShowCompleted(!showCompleted); setShowUnpaid(false); setShowUnreturned(false); setShowFutured(false); setShowNotCompleted(false); setShowToCollect(false) }}
              />
              {' '}Ολοκληρωμένες
            </label>

            {/* Not Completed */}
            <label style={{ marginRight: '1em' }}>
              <input
                type="checkbox"
                checked={showNotCompleted}
                onChange={() => { setShowNotCompleted(!showNotCompleted); setShowUnpaid(false); setShowUnreturned(false); setShowCompleted(false); setShowFutured(false); setShowToCollect(false) }}
              />
              {' '}Μη Ολοκληρωμένες
            </label>
          </div>

          {/* Search rent input */}
          <div style={{ flex: "2" }}>
            <input
              type="text"
              placeholder="🔍 Αναζήτηση ενοικίασης ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-bar"
            />

            {searchText}

            {/* {searchText && (
              <button className="button-clear" onClick={() => setSearchText("")}>
                ✖
              </button>
            )} */}

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
                  const rentItems = getRentedItemsNames(rent.items) // items array of objects (of current rent)
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
                      <td>{rentItems}</td>

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
                      <td style={{ whiteSpace: "pre-wrap" }}>{rent.notes}</td>

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

    </div >

  )

}

export default Rents




