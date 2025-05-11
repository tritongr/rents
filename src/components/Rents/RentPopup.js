import { isValidDate, isDatePast } from "../../utilities/functionsLib"

import { useEffect, useRef } from "react";

function RentPopup({ rentPopup, setRentPopup, rentToCopy, createGoogleCalendarEvent, calendarButtonText, handleSendToKeep }) {
  const popupRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setRentPopup(null);
      }
    };

    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setRentPopup(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setRentPopup]);

  if (!rentPopup) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 999
      }}
    >
      <div
        ref={popupRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fffde7",
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.3)",
          zIndex: 1000,
          maxWidth: "70%",
          minWidth: "300px",
          maxHeight: "80vh",
          overflowY: "auto",
          whiteSpace: "pre-wrap"
        }}
      >
        {/* X button */}
        <button
          onClick={() => setRentPopup(null)}
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "1.2em",
            cursor: "pointer"
          }}
        >
          ✖
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h3 style={{ textAlign: "center" }}>{rentPopup.customer_name}</h3>
        </div>

        <div style={{ marginTop: "10px" }}>
          <div dangerouslySetInnerHTML={{ __html: rentToCopy(rentPopup) }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", rowGap: "4px", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
          <div>
            {/* Events button */}
            <button
              title="Δημιουργία calendar event(s)"
              className="button-edit"
              onClick={() => {
                createGoogleCalendarEvent(rentPopup);
                // setRentPopup(null);
              }}
            >
              {calendarButtonText(rentPopup)}
            </button>

            {/* Έως event button */}
            {(!isDatePast(rentPopup.start_date) && !isDatePast(rentPopup.end_date)) &&
              (
                <button
                  title="Δημιουργία Έως event"
                  className="button-edit"
                  onClick={() => {
                    createGoogleCalendarEvent(rentPopup, true);
                    // setRentPopup(null);
                  }}
                >
                  Έως 📅
                </button>
              )
            }
          </div>

          <div>
            {/* Keep button */}
            <button
              title="Άνοιγμα του Keep"
              className="button-edit"
              onClick={() => {
                handleSendToKeep(rentPopup);
                // setRentPopup(null);
              }}
            >
              Keep&nbsp;📝
            </button>

            {/* Email button */}
            <button
              title="Προετοιμασία αποστολής email στο procompusound@gmail.com"
              className="button-edit"
              onClick={() => {
                const to = "malatantis@gmail.com,procompusound@gmail.com";
                const subject = encodeURIComponent(`Ενοικίαση: ${rentPopup.customer_name}`);
                const body = encodeURIComponent(`${rentPopup.customer_name}\n\n${rentToCopy(rentPopup)}`);
                const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}&bcc=mmalatantis@gmail.com`;
                window.location.href = mailtoLink;
              }}
            >
              Email&nbsp;📧
            </button>

            {/* Exit button */}
            <button className="button-save" onClick={() => setRentPopup(null)}>
              <span className="dashicons dashicons-exit"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RentPopup;