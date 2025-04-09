import "./Main.scss"

import React, { useState, useEffect } from "react"
import { createRoot } from 'react-dom/client'
import axios from "axios"
import { ToastContainer, Slide } from 'react-toastify'

import { TabsPanel } from "./utilities/TabsPanel"
import Customers from "./customers/Customers"
import Items from "./items/Items"


function Rents() {
  return (
    <h2>Rents Content</h2>
  )
}

function Main() {

  const nullCustomer = { id: 0, name: "", notes: "", is_active: false }
  const [customers, setCustomers] = useState([])

  const nullItem = { id: 0, name: "", description: "", is_available: true }
  const [items, setItems] = useState([])


  // Global API parameters
  const API = {
    URL: rentsGlobal.root_url + "/wp-json/rents/v1/",
    NONCE: rentsGlobal.nonce
  }

  // Load all customers 
  useEffect(loadAllCustomers, [])
  function loadAllCustomers() {
    const axiosVars = {
      method: "GET",
      url: API.URL + "customers",
      headers: { "X-WP-Nonce": API.NONCE }
    }
    // Handle success
    function handleSuccess(response) {
      // Ενημέρωση του state customers
      setCustomers(response.data)
    }
    //Handle error
    function handleError(error) {
      console.error("Error fetching all customers: ", error)
    }
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  // Load all items 
  useEffect(loadAllItems, [])
  function loadAllItems() {
    const axiosVars = {
      method: "GET",
      url: API.URL + "items",
      headers: { "X-WP-Nonce": API.NONCE }
    }
    // Handle success
    function handleSuccess(response) {
      // Ενημέρωση του state items
      setItems(response.data)
    }
    //Handle error
    function handleError(error) {
      console.error("Error fetching all items: ", error)
    }
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  return (
    <div className="app-wrapper">
      {/* App title */}
      <div className="app-header">
        <h1>Διαχείριση Ενοικιάσεων</h1>
      </div>

      {/* Tabs */}
      <TabsPanel
        tabs={[
          {
            name: "Customers",
            title: "Πελάτες",
            content: <Customers
              customers={customers}
              setCustomers={setCustomers}
              nullCustomer={nullCustomer}
              API={API}
            />
          },
          {
            name: "Items",
            title: "Εξοπλισμός",
            content: <Items
              items={items}
              setItems={setItems}
              nullItem={nullItem}
              API={API}
            />
          },
          // {
          //   name: "rents",
          //   title: "Ενοικιάσεις",
          //   content: <Rents />

          //   // content: <Rents customers={customers} items={items} itemCategories={itemCategories} rentStatus={rentStatus} rents={rents} setRents={setRents} />
          // },
        ]}
      />

      {/* το ToastContainer */}
      <ToastContainer
        position="bottom-center"
        autoClose={5000} // Κλείνει μετά από 3 δευτερόλεπτα
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={false}
        draggable
        closeButton={false}
        theme='colored'
        transition={Slide}
      // style={{ backgroundColor: '#e6f4ea', color: '#28a745' }}
      />
    </div>
  )

}

const root = createRoot(document.getElementById('rents-app'));
root.render(<Main />);