/**
 * Confirmation dialog για το delete των records.
 * USAGE στο parent component π.χ.  <Customers />
 * 
 * 1. Import το τρέχον: import Confirm from "../utilities/Confirm"
 * 2. States στο parent:   const [isConfirmShowing, setIsConfirmShowing] = useState(false)
 * 3. Set state στην pre-delete function (onDeleteClick): 
 * 4. function onDeleteClick(customer) {
        setEditingCustomer(customer)
        setIsConfirmShowing(true)
      }
 * 5. Render το <Confirm /> στέλνοντας το message και την actual delete function (onDelete)
      <Confirm
        message="Να διαγραφεί ο πελάτης;"
        onConfirmYes={onDelete}
        isShowing={isConfirmShowing}
        setIsShowing={setIsConfirmShowing}
      />
 */

import React from "react";
import "./Confirm.scss" // CSS για στυλ

function Confirm({ message, onConfirmYes, onConfirmNo, isShowing, setIsShowing }) {

  return (isShowing && (
    <div className="confirm-overlay">
      <div className="confirm-box">
        <p>{message}</p>
        <div className="confirm-actions">
          <button onClick={() => { onConfirmYes(); setIsShowing(false); }}>Ναι</button>
          <button onClick={() => setIsShowing(false)}>Όχι</button>
        </div>
      </div>
    </div>)
  )
}
export default Confirm

