<div style={{ display: "flex", alignItems: "center", marginLeft: "5px", fontSize: "small" }}>

  {/* Toggle showAvailable filter */}
  <div style={{ flex: "1" }} >
    <label className="active-filter" style={{ whiteSpace: "nowrap" }} >
      <input
        type="checkbox"
        checked={showAvailableOnly}
        onChange={() => { setShowRentedOnly(false); setShowAvailableOnly(!showAvailableOnly) }}
      />
      &nbsp;Διαθέσιμα &nbsp;&nbsp;
    </label>
  </div>

  {/* Toggle showRented filter */}
  <div style={{ flex: "1" }} >
    <label className="active-filter" style={{ whiteSpace: "nowrap" }} >
      <input
        type="checkbox"
        checked={showRentedOnly}
        onChange={() => { setShowAvailableOnly(false); setShowRentedOnly(!showRentedOnly) }}
      />
      &nbsp;Νοικιασμένα &nbsp;&nbsp;
    </label>
  </div>

  {/* Search item input */}
  <div style={{ flex: "4" }}>
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