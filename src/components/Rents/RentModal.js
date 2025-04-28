/**
 * =========================================
 * Edit & Add Modal Form for Rents Table
 * =========================================
 */

import "./RentModal.scss"
import { isValidDate, isDatePast, formatDateShort } from "../../utilities/functionsLib"

import React, { useState, useEffect, useRef } from 'react'

import Select, { components } from "react-select";

export function RentModal({
  isModalOpen,
  setIsModalOpen,
  editingRent,
  setEditingRent,
  customers,
  items,
  rents,
  selectedItems,
  setSelectedItems,
  selectedCustomer,
  setSelectedCustomer,
  onSaveEdit,
  onSaveNew,
  isNewRent
}) {

  /**
   * States
   */

  // Focus στο 1ο πεδίο
  const refControl = useRef(null)

  useEffect(() => {

    // Ενημέρωση των selectedCustomer και selectedItems
    if (!isNewRent) {
      const selItemsForDropDown = editingRent.items.map(iId => {
        const item = items.find(i => i.id == iId)
        return { label: item.name, value: parseInt(item.id) }
      })
      setSelectedItems(selItemsForDropDown)

      const customer = customers.find(c => c.id == editingRent.customer_id)
      setSelectedCustomer({ label: customer.name, value: parseInt(customer.id) })
    } else {
      setSelectedCustomer(null)
      setSelectedItems([])
    }

    if (refControl.current) {
      refControl.current.focus()
    }
  }, [])

  /**
   * Functions
   */

  if (!isModalOpen) {
    return null
  }
  const header = isNewRent ? "Νέα Ενοικίαση" : "Επεξεργασία Ενοικίασης"
  const headerClass = isNewRent ? "new-record-header" : "edit-record-header"

  // Dates & Text input changes
  function handleInputChange(e) {

    const { name, value, type, checked } = e.target
    setEditingRent(r => ({ ...r, [name]: value }))
  }

  // Styles για Customers dropdown
  const selectCustomerStyle = {
    control: (styles) => ({ ...styles, textAlign: "left", backgroundColor: "#FFFFE0" }), // the div control wrapper
    option: (styles, state) => {
      return ({
        ...styles,
        textAlign: "left",
        backgroundColor: !state.isFocused && !state.isSelected ? "#FFFFE0" : styles.backgroundColor
      })
    }, // η λίστα με τα options
    multiValue: (styles, state) => ({ ...styles, }), // η λίστα με τα options
    multiValueLabel: (styles, state) => ({ ...styles, textAlign: "left", }), // η λίστα με τα options
    multiValueRemove: (styles, state) => ({ ...styles, cursor: "pointer", }), // το x που το διαγράφει
  }

  // Styles για Items dropdown
  const selectItemsStyle = {
    control: (styles) => ({ ...styles, textAlign: "left", backgroundColor: "#D7FEC8" }), // the div control wrapper
    option: (styles, state) => {
      return ({
        ...styles,
        textAlign: "left",
        backgroundColor: !state.isFocused && !state.isSelected ? "#D7FEC8" : styles.backgroundColor
      })
    }, // η λίστα με τα options
    multiValue: (styles, state) => ({ ...styles, backgroundColor: "#8BE78B", color: "black" }), // η λίστα με τα options
    multiValueLabel: (styles, state) => ({ ...styles, textAlign: "left", color: "black" }), // η λίστα με τα options
    multiValueRemove: (styles, state) => ({ ...styles, cursor: "pointer", }), // το x που το διαγράφει
    valueContainer: (provided) => ({
      ...provided,
      maxHeight: "6em", // περίπου 4 γραμμές (δοκίμασε 5em ή 6em)
      overflowY: "auto",
      flexWrap: "wrap",
    }),
  }

  /**
   * Get items for dropdown list
   */
  const CheckboxOption = (props) => {
    return (
      <components.Option {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "left",
            whiteSpace: "nowrap",
            overflow: "hidden",
            gap: "6px", // μικρό κενό ανάμεσα στο checkbox και το label
            fontSize: "0.9em", // πιο μαζεμένο μέγεθος
            lineHeight: "1.2em", // μειωμένο line spacing
            padding: "4px 8px", // ελαφρύ padding
          }}
        >
          <div style={{ flex: "1", textAlign: "center" }} flex="1">
            <input
              type="checkbox"
              checked={props.isSelected}
              onChange={() => null}
              style={{
                margin: 0,
                padding: 0,
                verticalAlign: "middle"
              }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
                flex: 1
              }}
            >
              {props.label}
            </span>
          </div>
        </div>
      </components.Option>
    );
  };

  function getItems() {

    const richItems = items.map(i => {

      var iLabel = ""
      var iIcon = ""
      var isDisabled = false


      if (i.active_rents.length > 0) { // Αν υπάρχουν iActiveRentDates τα βάζουμε στο iLabel

        const iActiveRentDates = i.active_rents.map(ar => {
          if (isDatePast(ar.start_date)) {
            iIcon = "❌ "
            isDisabled = true
          } else {
            if (iIcon != "❌ ") {
              iIcon = "📅 "
            }
          }

          return formatDateShort(ar.start_date) + "-" + formatDateShort(ar.end_date)
        }
        ).toString()

        iLabel = iIcon + i.name + " (" + iActiveRentDates + ")"

      } else { // Αν υπάρχουν iActiveRentDates το iLabel είναι το ι.ναμε
        iLabel = i.name
      }

      return { label: iLabel, value: parseInt(i.id) }

      //return ({ label: (i.is_rented == 1 ? "❌ " : "") + i.name, value: parseInt(i.id) }))
    }
    )

    return richItems
  }

  return (
    <div className='modal-wraper modal-overlay' >

      {/* Content wraper */}
      <div
        className="modal-content"
        style={{
          overflowY: "auto", // 👈 περιορισμός ύψους
          maxHeight: "90vh" // 👈 scrollbar όταν χρειάζεται
        }}

      >

        {/* Header */}
        <div className="modal-header">
          <p className={headerClass}>{header}</p>
        </div>
        {/* Fields */}
        <div>

          {/* Customer single select */}
          <Select
            placeholder="Επιλέξτε πελάτη..."
            options={customers.map(c => ({ label: c.name, value: c.id }))}
            value={selectedCustomer}
            hideSelectedOptions={false}
            onChange={selection => setSelectedCustomer(selection)}
            styles={selectCustomerStyle}
          />

          {/* Items multi select */}
          <Select
            placeholder="Επιλέξτε εξοπλισμό..."
            //  components={{ Option: CheckboxOption }}
            closeMenuOnSelect={false} // σημαντικό για να ΜΗΝ κλείνει κάθε φορά
            options={getItems()}

            // options={
            //   items.map(i => ({ label: (i.is_rented == 1 ? "❌ " : "") + i.name, value: parseInt(i.id) }))
            // }

            value={selectedItems}
            onChange={selection => setSelectedItems(selection)}
            isMulti
            styles={selectItemsStyle}
          />

          {/* Notes */}
          <textarea
            value={editingRent.notes}
            onChange={(e) => setEditingRent({ ...editingRent, notes: e.target.value })}
            placeholder="Σχόλια"
            rows="5"
          />

          <div style={{ display: "flex" }}>

            {/* Έναρξη */}
            <div style={{ flex: "1", margin: 0, maxWidth: "50%" }}>
              <span style={{ fontSize: "small", color: "#0073a8" }}>Έναρξη</span><br />
              < input
                type="date"
                name="start_date"
                value={editingRent.start_date}
                onChange={handleInputChange}

              />
            </div>

            {/* Λήξη */}
            <div style={{ flex: "1", margin: 0, maxWidth: "50%" }}>
              <span style={{ fontSize: "small", color: "#0073a8" }}>Λήξη</span><br />
              <input
                type="date"
                name="end_date"
                value={editingRent.end_date}
                onChange={handleInputChange}
              />
            </div>
          </div>


          <div style={{ display: "flex" }}>
            {/* Επιστροφή */}
            <div style={{ flex: "1", margin: 0, maxWidth: "50%" }}>
              <span style={{ fontSize: "small", color: "#0073a8" }}>Επεστράφη</span><br />
              <input
                type="date"
                name="ret_date"
                value={editingRent.ret_date}
                onChange={handleInputChange}
              />
            </div>

            {/* Πληρωμή */}
            <div style={{ flex: "1", margin: 0, maxWidth: "50%" }}>
              <span style={{ fontSize: "small", color: "#0073a8" }}>Εξοφλήθη</span><br />
              <input
                type="date"
                name="paid_date"
                value={editingRent.paid_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className="modal-actions">

          {/* Save */}
          <button
            title={isNewRent ? "Προσθήκη" : "Ενημέρωση"}
            className="button-save"
            onClick={isNewRent ? onSaveNew : onSaveEdit}
          >
            <span class="dashicons dashicons-saved"></span>
          </button>

          {/* Cancel */}
          <button
            title="Ακύρωση"
            className="button-cancel"
            onClick={() => { setSelectedItems([]); setIsModalOpen(false) }}
          >
            <span class="dashicons dashicons-undo"></span>
          </button>

        </div>

      </div>

    </div >
  )
}