
function HelpPopup() {


  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.2)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // backdropFilter: "blur(4px)" //blur background
    }}
      onClick={() => setShowHelpPopup(false)} // κλείνει αν κλικάρεις έξω
    >
      {/* Popup div */}
      <div
        onClick={(e) => e.stopPropagation()} // για να μην κλείνει αν κλικάρεις μέσα
        className="fade-in"
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "20px",
          width: "90%",
          maxWidth: "400px",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Επεξήγηση φίλτρων</h3>
        <ul style={{ paddingLeft: "1.2em", fontSize: "14px", lineHeight: "1.5" }}>
          <li><strong>Μελλοντικές:</strong> Ενοικιάσεις που ξεκινούν μετά από σήμερα και πρέπει να  προετοιμάσουμε τον εξοπλισμό.</li>
          <li><strong>Σε εξέλιξη:</strong> Ενοικιάσεις που ξεκίνησαν αλλά δεν έχουν λήξη ακόμη.</li>
          <li><strong>Για παραλαβή:</strong> Ενοικιάσεις που δεν έχουν επιστραφεί ενώ έχει περάσει η ημ. λήξης και πρέπει να ανακτήσουμε τον εξοπλισμό.</li>
          <li><strong>Για είσπραξη:</strong> Ενοικιάσεις για τις οποίες δεν πληρωθήκαμε ενώ έχει περάσει η ημ. λήξης.</li>
          <li><strong>Δεν επεστράφησαν:</strong> Δεν έχει οριστεί ημερομηνία επιστροφής.</li>
          <li><strong>Ανεξόφλητες:</strong> Δεν έχει καταχωρηθεί ημερομηνία πληρωμής.</li>
          <li><strong>Ολοκληρωμένες:</strong> Έχουν πληρωθεί και επιστραφεί.</li>
          <li><strong>Μη Ολοκληρωμένες:</strong> Λείπει είτε η πληρωμή είτε η επιστροφή.</li>
        </ul>
        <div style={{ textAlign: "right", marginTop: "15px" }}>
          <button onClick={() => setShowHelpPopup(false)} className="button-save">Κλείσιμο</button>
        </div>
      </div>
    </div>
  )
}

export default HelpPopup 