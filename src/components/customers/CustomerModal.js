/**
 * =========================================
 * Edit & Add Modal Form for Customers Table
 * =========================================
 */

import "./CustomerModal.scss"

import React, { useState, useEffect, useRef } from 'react';

export function CustomerModal({
  isModalOpen,
  setIsModalOpen,
  editingCustomer,
  setEditingCustomer,
  onSaveEdit,
  onSaveNew,
  isNewCustomer
}) {


  console.log("editing cusromer", editingCustomer)
  /**
   * States
   */

  // Focus στο 1ο πεδίο
  const refControl = useRef(null)
  useEffect(() => {
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
  const header = isNewCustomer ? "Νέος Πελάτης" : "Επεξεργασία Πελάτη"
  const headerClass = isNewCustomer ? "new-record-header" : "edit-record-header"

  return (
    <div className='modal-wraper modal-overlay'>

      {/* Content wraper */}
      <div className="modal-content">

        {/* Header */}
        <div className="modal-header">
          <p className={headerClass}>{header}</p>
        </div>

        {/* Fields */}
        <div>
          <input
            ref={refControl}
            type="text"
            value={editingCustomer.name}
            onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
            placeholder="Εισάγετε όνομα"
          />
          <input
            type="text"
            value={editingCustomer.phone}
            onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
            placeholder="Τηλέφωνο, επικοινωνία κλπ."
          />
          <textarea
            value={editingCustomer.notes}
            onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
            placeholder="Σχόλια"
            rows="3"
          />
        </div>

        {/* Buttons */}
        <div className="modal-actions">

          {/* Save */}
          <button
            title={isNewCustomer ? "Προσθήκη" : "Ενημέρωση"}
            className="button-save"
            onClick={isNewCustomer ? onSaveNew : onSaveEdit}
          >
            <span class="dashicons dashicons-saved"></span>
          </button>

          {/* Cancel */}
          <button
            title="Ακύρωση"
            className="button-cancel"
            onClick={() => setIsModalOpen(false)}
          >
            <span class="dashicons dashicons-undo"></span>
          </button>

        </div>

      </div>

    </div>
  )
}