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

  /**
   * Customers
   */

  // Null row/record *** to be modified
  const nullCustomer = { id: 0, name: "", notes: "", phone: "", active: false }
  const [customers, setCustomers] = useState([])

  // Αρχικά δεδομένα *** to be modified
  // const [customers, setCustomers] = useState([
  //   { id: 1, name: "John Doe", notes: "fsdfsad", phone: "6944444444", active: false },
  //   { id: 2, name: "Jane Smith", notes: "gdsfgdgdgsd", phone: "6955555555", active: true },
  //   { id: 3, name: "Κώστας Παπαδόπουλος", notes: "fggbvcxvbxcb", phone: "6966666666", active: false },
  //   { id: 4, name: "Νίκος Αδαμίδης", notes: "sdfsjfjs", phone: "6977777777", active: true },
  // ]);

  // Global API parameters
  const customersAPI = {
    URL: rentsGlobal.root_url + "/wp-json/rents/v1/customers",
    NONCE: rentsGlobal.nonce
  }

  // Load all customers 
  useEffect(loadAllCustomers, [])
  function loadAllCustomers() {
    const axiosVars = {
      method: "GET",
      url: customersAPI.URL,
      headers: { "X-WP-Nonce": customersAPI.NONCE }
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
              customersAPI={customersAPI}
            />
          },
          {
            name: "items",
            title: "Εξοπλισμος",
            content: <Items />
          },
          {
            name: "rents",
            title: "Ενοικιάσεις",
            content: <Rents />

            // content: <Rents customers={customers} items={items} itemCategories={itemCategories} rentStatus={rentStatus} rents={rents} setRents={setRents} />
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