import "./CollapsibleHeader.scss"

import React, { useState } from "react";

function CollapsibleHeader({ isCollapsiblePanelOpen, setIsCollapsiblePanelOpen, title }) {

  return (
    <div className="collapsible-panel-wrapper">
      <h2 onClick={() => setIsCollapsiblePanelOpen(!isCollapsiblePanelOpen)} className="collapsible-header">
        <div dangerouslySetInnerHTML={{ __html: title }} />
        <span className={`arrow ${isCollapsiblePanelOpen ? "open" : ""}`}>▼</span>
      </h2>
    </div>
  )

}

export default CollapsibleHeader