/**
 * =============================================
 * Βασικό Rents component με δυνατότητα CRUD
 * Καλεί το RentModal για Create/Update
 * =============================================
 */

import "./Rents.scss"
import { isValidDate, isDatePast, formatDateShort } from "../../utilities/functionsLib"

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

  const [showNotReturnedOnly, setShowNotReturnedOnly] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  console.log("items => ", items)

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

  // Sorting Λειτουργία
  // const sortedRents = [...filteredRents].sort((a, b) => {
  //   if (sortColumn === "name") {
  //     return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  //   }
  //   if (sortColumn === "is_active") {
  //     return sortDirection === "asc" ? b.is_active - a.is_active : a.is_active - b.is_active
  //   }
  //   return 0
  // });

  // Εναλλαγή κατεύθυνσης sorting
  function handleSortToggle(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

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
  const filteredRents = rents.filter((rent) => {
    if (showUnreturned && (isValidDate(rent.ret_date) || !isDatePast(rent.end_date))) return false; // Αν θέλουμε μόνο μη επιστραμμένα
    if (showUnpaid && (isValidDate(rent.paid_date) || !isDatePast(rent.end_date))) return false; // Αν θέλουμε μόνο ανεξόφλητα
    if (showFutured && isDatePast(rent.start_date)) return false; // Αν θέλουμε μόνο μεννλοντικές ενοικιάσεις
    return true;
  })

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
      {isCollapsiblePanelOpen && (
        <div>
          <button
            title="Νέα ενοικίαση"
            onClick={onAddClick}
            className="button-add-new"
          >
            <span style={{ marginTop: "2px" }} class="dashicons dashicons-plus-alt2"></span>
          </button>

        </div>
      )}

      {/* Filter controls  */}
      {isCollapsiblePanelOpen && (
        <div className="filters" style={{ marginBottom: '1em', fontSize: "small" }}>

          {/* Unreturned */}
          <label style={{ marginRight: '1em' }}>
            <input
              type="checkbox"
              checked={showUnreturned}
              onChange={() => { setShowUnreturned(!showUnreturned); setShowUnpaid(false); setShowFutured(false) }}
            />
            {' '}Δεν επεστράφησαν
          </label>

          {/* Unpaid */}
          <label style={{ marginRight: '1em' }}>
            <input
              type="checkbox"
              checked={showUnpaid}
              onChange={() => { setShowUnpaid(!showUnpaid); setShowUnreturned(false); setShowFutured(false) }}
            />
            {' '}Ανεξόφλητες
          </label>

          {/* Unpaid */}
          <label>
            <input
              type="checkbox"
              checked={showFutured}
              onChange={() => { setShowFutured(!showFutured); setShowUnpaid(false); setShowUnreturned(false) }}
            />
            {' '}Μελλοντικές
          </label>
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
                  onClick={() => handleSortToggle("customerName")}
                >
                  Πελάτης ({filteredRents.length}) {sortColumn === "customerName" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="">Είδη</th>
                <th className="">Έναρξη</th>
                <th className="">Λήξη</th>
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
                filteredRents.map(rent => {
                  // const rentCustomer = getRentCustomer(rent) // customer object (of current rent) 
                  const rentItems = getRentedItemsNames(rent.items) // items array of objects (of current rent)
                  return (

                    // Data row
                    <tr
                      key={rent.id}
                      className={rent.paid_date && rent.paid_date !== "0000-00-00" ? "active-row" : ""}
                    >

                      {/* Data Cells */}
                      {/* ---------- */}

                      {/* Renter's customer name */}
                      <td>{rent.id} - {rent.customer_name}</td>

                      {/* Items rented */}
                      <td>{rentItems}</td>

                      {/* Start date 📅*/}
                      <td className="td-center" >
                        {isValidDate(rent.start_date) ?
                          formatDateShort(rent.start_date) + (!isDatePast(rent.start_date) ? " 📅" : "") :
                          ""}
                      </td>

                      {/* End date */}
                      <td className="td-center" >{rent.end_date && rent.end_date !== "0000-00-00" ? formatDateShort(rent.end_date) : ""}</td>


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




