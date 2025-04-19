import "./Main.scss"

import React, { useState, useEffect } from "react"
import { createRoot } from 'react-dom/client'
import axios from "axios"
import { ToastContainer, Slide, toast } from 'react-toastify'

import { TabsPanel } from "./utilities/TabsPanel"
import Customers from "./customers/Customers"
import Items from "./items/Items"
import Rents from "./rents/Rents"

function Main() {

  const nullCustomer = { id: 0, name: "", notes: "", is_active: false }
  const [customers, setCustomers] = useState([])

  const nullItem = { id: 0, name: "", description: "", is_available: true }
  const [items, setItems] = useState([])

  const nullRent = { id: 0, customer_id: null, customer_name: null, rented_items: [], start_date: "", end_date: "", ret_date: "", paid_date: "", notes: "" }
  const [rents, setRents] = useState([])

  // Global API parameter
  const API = {
    URL: rentsGlobal.root_url + "/wp-json/rents/v1/",
    NONCE: rentsGlobal.nonce
  }

  // Load all customers 
  useEffect(loadAllCustomers, [rents])
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
      const msg = error.response?.data?.error || "Error fetching all customers.";
      toast.error(msg)
      console.error("Error fetching all customers: ", error)
    }
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  // Load all items 
  useEffect(loadAllItems, [rents])
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
      const msg = error.response?.data?.error || "Error fetching all items.";
      toast.error(msg)
      console.error("Error fetching all items: ", error)
    }
    axios(axiosVars)
      .then(handleSuccess)
      .catch(handleError)
  }

  // Load all rents 
  useEffect(loadAllRents, [])
  function loadAllRents() {
    const axiosVars = {
      method: "GET",
      url: API.URL + "rents",
      headers: { "X-WP-Nonce": API.NONCE }
    }

    // Handle success
    function handleSuccess(response) {
      // Ενημέρωση του state rents
      setRents(response.data)
    }

    //Handle error
    function handleError(error) {
      const msg = error.response?.data?.error || "Error fetching all rents.";
      toast.error(msg)
      console.error("Error fetching all rents: ", error)
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
            name: "rents",
            title: "Ενοικιάσεις",
            content: <Rents
              rents={rents}
              setRents={setRents}
              nullRent={nullRent}
              customers={customers}
              items={items}
              API={API}
            />
          },
          {
            name: "Items",
            title: "Εξοπλισμός ",
            content: <Items
              items={items}
              setItems={setItems}
              nullItem={nullItem}
              API={API}
            />
          },
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

export default Main