import React, { useState } from 'react';

function NotesCellWithTooltip({ rent, copyToClipboard, setRentPopup }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="notes-cell-container"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ position: 'relative', overflow: 'hidden' }} // Για να μην ξεχειλίζει το tooltip
    >
      <span className="notes-content truncated">
        {rent.notes.length > 100 ? rent.notes.slice(0, 100) + '...' : rent.notes}
      </span>
      {isHovering && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            top: '100%', // Εμφανίζεται κάτω από το στοιχείο
            left: '0',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '8px',
            zIndex: 1, // Για να είναι πάνω από άλλα στοιχεία
            whiteSpace: 'normal', // Για να χωράει όλο το κείμενο
            wordBreak: 'break-word', // Για να μην σπάει λέξεις αν είναι πολύ μακριές
            minWidth: '200px', // Προαιρετικά: ένα ελάχιστο πλάτος
          }}
        >
          {rent.notes}
        </div>
      )}
      <style jsx>{`
        .notes-cell-container {
          display: block; /* Ή inline-block ανάλογα με το layout */
        }
        .notes-content.truncated {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

export default NotesCellWithTooltip;