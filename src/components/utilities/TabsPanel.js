import React, { useState } from "react";
import "./TabsPanel.scss"; // 🔹 SCSS αρχείο για styling

export function TabsPanel({ tabs }) {

  const [activeTab, setActiveTab] = useState(tabs[0]?.name || ""); // 🔹 Default το πρώτο tab
  const [dummy, setDummy] = useState("")

  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={`tab ${activeTab === tab.name ? "active" : "no-active"}`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="tab-content-container">
        {tabs.map((tab) =>
          activeTab === tab.name
            ? <div key={tab.name}>{tab.content}</div>
            : null
        )}
      </div>
    </div>
  );
};


