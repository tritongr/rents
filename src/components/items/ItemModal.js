/**
 * =========================================
 * Edit & Add Modal Form for Items Table
 * =========================================
 */

import "./ItemModal.scss"

import React, { useState, useEffect, useRef } from 'react';

export function ItemModal({
  isModalOpen,
  setIsModalOpen,
  editingItem,
  setEditingItem,
  onSaveEdit,
  onSaveNew,
  isNewItem
}) {

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
  const header = isNewItem ? "Νέο Είδος" : "Επεξεργασία Είδους"
  const headerClass = isNewItem ? "new-record-header" : "edit-record-header"

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
            value={editingItem.name}
            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            placeholder="Εισάγετε ονομασία"
          />
          <input
            type="text"
            value={editingItem.description}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            placeholder="Εισάγετε περιγραφή"
          />
        </div>

        {/* Buttons */}
        <div className="modal-actions">

          {/* Save */}
          <button
            title={isNewItem ? "Προσθήκη" : "Ενημέρωση"}
            className="button-save"
            onClick={isNewItem ? onSaveNew : onSaveEdit}
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