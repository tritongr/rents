<?php
if (!defined('ABSPATH')) {
  exit;
}

/**
 * ======
 * Routes
 * ======
 */

add_action('rest_api_init', function () {
  $namespace = 'rents/v1';

  /**
   * Customers routes
   */

  // Get all customers route
  register_rest_route($namespace, '/customers', [
    'methods' => 'GET',
    'callback' => 'get_all_customers',
    'permission_callback' => '__return_true',
  ]);

  // Create a new customer route
  register_rest_route($namespace, '/customers', [
    'methods' => 'POST',
    'callback' => 'create_customer',
    'permission_callback' => '__return_true',
  ]);

  // Update a customer route
  register_rest_route($namespace, '/customers', [
    'methods' => 'PUT',
    'callback' => 'update_customer',
    'permission_callback' => '__return_true',
  ]);

  // Delete a customer route
  register_rest_route($namespace, '/customers', [
    'methods' => 'DELETE',
    'callback' => 'delete_customer',
    'permission_callback' => '__return_true',
  ]);

  /**
   * Items routes
   */

  // Get all items route
  register_rest_route($namespace, '/items', [
    'methods' => 'GET',
    'callback' => 'get_all_items',
    'permission_callback' => '__return_true',
  ]);

  // Create a new item route
  register_rest_route($namespace, '/items', [
    'methods' => 'POST',
    'callback' => 'create_item',
    'permission_callback' => '__return_true',
  ]);

  // Update a item route
  register_rest_route($namespace, '/items', [
    'methods' => 'PUT',
    'callback' => 'update_item',
    'permission_callback' => '__return_true',
  ]);

  // Delete a item route
  register_rest_route($namespace, '/items', [
    'methods' => 'DELETE',
    'callback' => 'delete_item',
    'permission_callback' => '__return_true',
  ]);

  /**
   * Rents routes
   */

  // Get all rents route
  register_rest_route($namespace, '/rents', [
    'methods' => 'GET',
    'callback' => 'get_all_rents',
    'permission_callback' => '__return_true',
  ]);

  // Create a new item route
  register_rest_route($namespace, '/rents', [
    'methods' => 'POST',
    'callback' => 'create_rent',
    'permission_callback' => '__return_true',
  ]);

  // Update a item route
  register_rest_route($namespace, '/rents', [
    'methods' => 'PUT',
    'callback' => 'update_rent',
    'permission_callback' => '__return_true',
  ]);

  // Delete a item route
  register_rest_route($namespace, '/rents', [
    'methods' => 'DELETE',
    'callback' => 'delete_rent',
    'permission_callback' => '__return_true',
  ]);

  /**
   * Rented items routes
   */

  // Get all rents route
  register_rest_route($namespace, '/rented_items', [
    'methods' => 'GET',
    'callback' => 'get_rented_items',
    'permission_callback' => '__return_true',
  ]);

  // Create a new item route
  register_rest_route($namespace, '/rented_items', [
    'methods' => 'POST',
    'callback' => 'create_rented_items',
    'permission_callback' => '__return_true',
  ]);

  // Delete a item route
  register_rest_route($namespace, '/rented_items', [
    'methods' => 'DELETE',
    'callback' => 'delete_rented_items',
    'permission_callback' => '__return_true',
  ]);
});

/**
 * ===================
 * Callback functions
 * ===================
 */

/**
 * -----------------------------
 * CUSTOMERS Call back functions
 * -----------------------------
 */

/**
 * GET all customers
 */

function get_all_customers()
{
  global $wpdb;

  try { // *** On success ***

    $tableCustomers = $wpdb->prefix . 'rent_customers';
    $tableRents = $wpdb->prefix . 'rent_rents';

    // $allCustomers = $wpdb->get_results("SELECT * FROM $tableCustomers ORDER BY name ASC");
    $allCustomers = $wpdb->get_results(
      "
      SELECT 
        c.*, 
        EXISTS (
          SELECT 1 
          FROM $tableRents r 
          WHERE r.customer_id = c.id 
            AND (r.ret_date IS NULL OR r.ret_date = '0000-00-00' OR r.paid_date IS NULL OR r.paid_date = '0000-00-00')
          LIMIT 1
        ) AS is_pending
      FROM $tableCustomers c
      ORDER BY c.name ASC
      ",
      ARRAY_A
    );

    // return $allCustomers;
    return new WP_REST_Response($allCustomers, 200);
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * CREATE new customer
 */
function create_customer(WP_REST_Request $request)
{
  global $wpdb;

  try { // *** On success ***

    // Record sent
    $customer = $request->get_json_params();

    // Table name variable
    $tableCustomers = $wpdb->prefix . 'rent_customers';

    // Τα fields του νέου record που στάλθηκαν
    $name = sanitize_textarea_field($customer["name"]);
    $notes = sanitize_textarea_field($customer["notes"]);

    // Validation των fields
    if (empty($name)) {
      return new WP_REST_Response(['error' => 'Το όνομα είναι υποχρεωτικό'], 500);
    }

    // Insert του νέου record
    $inserted = $wpdb->insert(
      $tableCustomers,
      [
        'name' => $name,
        'notes' => $notes
      ]
    );

    // Inserted id
    $instered_id = $wpdb->insert_id;

    // Is inserteted failed?
    if ($inserted === false or $instered_id === 0):
      return new WP_REST_Response(['error' => 'Αποτυχία δημιουργίας νέου πελάτη.'], 500);
    endif;

    // Επιστροφή του πίνακα
    return get_all_customers();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * UPDATE customer
 */
function update_customer(WP_REST_Request $request)
{
  global $wpdb;

  try { // *** On success ***
    // Record sent
    $customer = $request->get_json_params();

    // Table name variable
    $table = $wpdb->prefix . 'rent_customers';

    // Τα fields που στάλθηκαν
    $id = (int) $customer['id'];
    $name = sanitize_textarea_field($customer["name"]);
    $notes = sanitize_textarea_field($customer["notes"]);

    if (empty($name)) {
      return new WP_REST_Response(['error' => 'Το όνομα είναι υποχρεωτικό'], 500);
    }

    // Προσπάθεια update
    $affected_rows = $wpdb->update(
      $table,
      [
        'name' => $name,
        'notes' => $notes,
      ],
      ['id' => $id], // where
    );

    // Έλεγχος αν πέτυχε το update
    if ($affected_rows === false) {
      // Σφάλμα
      return new WP_REST_Response(['error' => 'Αποτυχία ενημέρωσης του πελάτη.'], 500);
    } elseif ($affected_rows === 0) {
      return new WP_REST_Response(['error' => 'Δεν ενημερώθηκε ο πελάτης.'], 400);
    } else {
      // Επιτυχία
    }
    // Επιστροφή του πίνακα
    return get_all_customers();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * DELETE customer
 */
function delete_customer(WP_REST_Request $request)
{
  global $wpdb;

  try { // *** On success ***

    // Ο customer που στάλθηκε
    $customer = $request->get_json_params();

    // Table names
    $tableCustomers = $wpdb->prefix . 'rent_customers';
    $tableRents = $wpdb->prefix . 'rent_rents';

    // To id του customer που στάλθηκε
    $id = intval($customer['id']);

    // Έλεγχος: Υπάρχει μόνο 1 πελάτης;
    $total_customers = $wpdb->get_var("SELECT COUNT(*) FROM $tableCustomers");

    if ($total_customers <= 1) {
      return new WP_REST_Response(['error' => 'Δεν μπορείτε να διαγράψετε τον τελευταίο πελάτη.'], 500);
    }

    // Έλεγχος αν ο πελάτης έχει rent εγγραφές
    $usage_count = $wpdb->get_var($wpdb->prepare(
      "SELECT COUNT(*) FROM $tableRents WHERE customer_id = %d",
      $id
    ));

    if ($usage_count > 0) {
      return new WP_REST_Response(['error' => 'Δεν μπορείτε να διαγράψετε αυτόν τον πελάτη γιατί έχει ενοικιάσεις.'], 500);
    }

    // Διαγραφή του record
    $wpdb->delete($tableCustomers, ['id' => $id]);
    $deleted = $wpdb->delete($tableCustomers, ['id' => $id]);

    if ($deleted === false) {
      return new WP_REST_Response(['error' => 'Σφάλμα κατά τη διαγραφή του πελάτη.'], 500);
    }

    // Επιστροφή full data 
    return get_all_customers();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * -------------------------
 * ITEMS Call back functions
 * -------------------------
 */

/**
 * GET all items
 * 
 */

function get_all_items(WP_REST_Request $request)
{
  global $wpdb;

  $tableItems = $wpdb->prefix . 'rent_items';
  $tableRentedItems = $wpdb->prefix . 'rent_rented_items';
  $tableRents = $wpdb->prefix . 'rent_rents';
  $tableCustomers = $wpdb->prefix . 'rent_customers';

  // Πάρε όλα τα items
  $all_items = $wpdb->get_results("SELECT * FROM $tableItems ORDER BY name ASC", ARRAY_A);

  // Πάρε όλες τις ενεργές ενοικιάσεις μαζί με πελάτες
  $active_rents_per_item = $wpdb->get_results(
    "
    SELECT 
      i.id AS item_id,
      r.id AS rent_id,
      r.start_date,
      r.end_date,
      r.customer_id,
      c.name AS customer_name
    FROM $tableItems i
    INNER JOIN $tableRentedItems ri ON ri.item_id = i.id
    INNER JOIN $tableRents r ON r.id = ri.rent_id
    INNER JOIN $tableCustomers c ON c.id = r.customer_id
    WHERE r.ret_date IS NULL OR r.ret_date = '0000-00-00'
    ",
    ARRAY_A
  );

  // Οργάνωσε τα active rents ανά item_id
  $grouped_rents = [];
  foreach ($active_rents_per_item as $row) {
    $item_id = $row['item_id'];
    if (!isset($grouped_rents[$item_id])) {
      $grouped_rents[$item_id] = [];
    }
    $grouped_rents[$item_id][] = [
      'id' => intval($row['rent_id']),
      'start_date' => $row['start_date'],
      'end_date' => $row['end_date'],
      'customer_id' => intval($row['customer_id']),
      'customer_name' => $row['customer_name'],
    ];
  }

  // Εμπλούτισε τα items με active_rents και is_rented
  foreach ($all_items as &$item) {
    $item_id = $item['id'];
    $item['active_rents'] = $grouped_rents[$item_id] ?? [];
    $item['is_rented'] = !empty($item['active_rents']);
  }

  return new WP_REST_Response($all_items, 200);
}


function get_all_items_bkp3(WP_REST_Request $request)
{
  global $wpdb;

  $tableItems = $wpdb->prefix . 'rent_items';
  $tableRentedItems = $wpdb->prefix . 'rent_rented_items';
  $tableRents = $wpdb->prefix . 'rent_rents';

  // Πάρε όλα τα items
  $all_items = $wpdb->get_results("SELECT * FROM $tableItems ORDER BY name ASC", ARRAY_A);

  // Πάρε όλες τις ενεργές ενοικιάσεις (rent.ret_date NULL ή '0000-00-00')
  $active_rents_per_item = $wpdb->get_results(
    "
    SELECT 
      i.id AS item_id,
      r.id AS rent_id,
      r.start_date,
      r.end_date
    FROM $tableItems i
    INNER JOIN $tableRentedItems ri ON ri.item_id = i.id
    INNER JOIN $tableRents r ON r.id = ri.rent_id
    WHERE r.ret_date IS NULL OR r.ret_date = '0000-00-00'
    ",
    ARRAY_A
  );

  // Οργάνωσε τα active rents ανά item_id
  $grouped_rents = [];
  foreach ($active_rents_per_item as $row) {
    $item_id = $row['item_id'];
    if (!isset($grouped_rents[$item_id])) {
      $grouped_rents[$item_id] = [];
    }
    $grouped_rents[$item_id][] = [
      'id' => intval($row['rent_id']),
      'start_date' => $row['start_date'],
      'end_date' => $row['end_date'],
    ];
  }

  // Εμπλούτισε τα items με active_rents και is_rented
  foreach ($all_items as &$item) {
    $item_id = $item['id'];
    $item['active_rents'] = $grouped_rents[$item_id] ?? [];
    $item['is_rented'] = !empty($item['active_rents']);
  }

  return new WP_REST_Response($all_items, 200);
}


function get_all_items_bkp2()
{
  global $wpdb;

  try { // *** On success ***

    $tableItems = $wpdb->prefix . 'rent_items';
    $tableRents = $wpdb->prefix . 'rent_rents';
    $tableRentedItems = $wpdb->prefix . 'rent_rented_items';

    $all_items = $wpdb->get_results(
      "
      SELECT 
        i.*, 
        EXISTS (
          SELECT 1 
          FROM $tableRentedItems ri
          INNER JOIN $tableRents r ON ri.rent_id = r.id
          WHERE ri.item_id = i.id 
            AND (r.ret_date IS NULL OR r.ret_date = '0000-00-00')
          LIMIT 1
        ) AS is_rented
      FROM $tableItems i
      ORDER BY i.name ASC
      ",
      ARRAY_A
    );

    // Προσθέτουμε τα active_rents_ids ανά item
    // Θα κάνουμε ένα δεύτερο query που βρίσκει 
    // όλα τα ενεργά rent_id ανά item_id, και μετά το ενώνουμε με το array $all_items.
    $active_rent_links = $wpdb->get_results(
      "
      SELECT ri.item_id, ri.rent_id
      FROM $tableRentedItems ri
      INNER JOIN $tableRents r ON ri.rent_id = r.id
      WHERE r.ret_date IS NULL OR r.ret_date = '0000-00-00'
      ",
      ARRAY_A
    );

    // Τώρα μπορούμε να κάνουμε "ένωση" με βάση το item_id:
    // Ομαδοποιούμε τα rent_ids ανά item_id
    $active_rents_map = [];
    foreach ($active_rent_links as $link) {
      $item_id = $link['item_id'];
      if (!isset($active_rents_map[$item_id])) {
        $active_rents_map[$item_id] = [];
      }
      $active_rents_map[$item_id][] = $link['rent_id'];
    }

    // Προσθέτουμε το πεδίο active_rents_ids σε κάθε item
    foreach ($all_items as &$item) {
      $item_id = $item['id'];
      $item['active_rents_ids'] = $active_rents_map[$item_id] ?? [];
    }

    return new WP_REST_Response($all_items, 200);
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

function get_all_items_bkp()
{
  global $wpdb;

  try { // *** On success ***

    $tableItems = $wpdb->prefix . 'rent_items';
    $tableRents = $wpdb->prefix . 'rent_rents';
    $tableRentedItems = $wpdb->prefix . 'rent_rented_items';
    $all_items = $wpdb->get_results(
      "
      SELECT 
        i.*, 
        EXISTS (
          SELECT 1 
          FROM $tableRentedItems ri
          INNER JOIN $tableRents r ON ri.rent_id = r.id
          WHERE ri.item_id = i.id 
            AND (r.ret_date IS NULL OR r.ret_date = '0000-00-00')
          LIMIT 1
        ) AS is_rented
      FROM $tableItems i
      ORDER BY i.name ASC
      ",
      ARRAY_A
    );

    return new WP_REST_Response($all_items, 200);
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * CREATE new item
 */

function create_item(WP_REST_Request $request)
{

  global $wpdb;

  try { // *** On success ***

    // Record sent
    $item = $request->get_json_params();

    // Table name
    $table = $wpdb->prefix . 'rent_items';

    // Τα fields του νέου record που στάλθηκαν
    $name = sanitize_textarea_field($item["name"]);
    $description = sanitize_textarea_field($item["description"]);

    // Validation των fields
    if (empty($name)) {
      return new WP_REST_Response(['error' => 'H ονομασία του είδους είναι υποχρεωτική'], 500);
    }

    // Προσπάθεια insert
    $inserted = $wpdb->insert(
      $table,
      [
        'name' => $name,
        'description' => $description,
      ]
    );

    // Inserted id
    $instered_id = $wpdb->insert_id;

    // Is inserteted failed?
    if ($inserted === false or $instered_id === 0):
      return new WP_REST_Response(['error' => 'Αποτυχία δημιουργίας νέου είδους.'], 500);
    endif;

    return get_all_items();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * UPDATE item
 */
function update_item(WP_REST_Request $request)
{

  global $wpdb;

  try { // *** On success ***

    // Item sent
    $item = $request->get_json_params();

    // Table name
    $tableItems = $wpdb->prefix . 'rent_items';

    // Τα fields που στάλθηκαν
    $id = (int) $item['id'];
    $name = sanitize_textarea_field($item["name"]);
    $description = sanitize_textarea_field($item["description"]);

    // Προσπάθεια update
    $affected_rows = $wpdb->update(
      $tableItems,
      [
        'name' => $name,
        'description' => $description,
      ],
      ['id' => $id], // where
    );

    if (empty($name)) {
      return new WP_REST_Response(['error' => 'Το όνομα είναι υποχρεωτικό'], 500);
    }

    // Έλεγχος αν πέτυχε το update
    if ($affected_rows === false) {
      // Σφάλμα
      return new WP_REST_Response(['error' => 'Αποτυχία ενημέρωσης του είδους.'], 500);
    } elseif ($affected_rows === 0) {
      return new WP_REST_Response(['error' => 'Δεν ενημερώθηκε το είδος.'], 400);
    } else {
      // Επιτυχία
    }

    return get_all_items();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * DELETE item
 */
function delete_item(WP_REST_Request $request)
{
  global $wpdb;

  try { // *** On success ***

    // Το item που στάλθηκε
    $item = $request->get_json_params();

    // Table names variable
    $tableItems = $wpdb->prefix . 'rent_items';
    $tableRentedItems = $wpdb->prefix . 'rent_rented_items';

    // Έλεγχος: Υπάρχει μόνο 1 item;
    $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $tableItems");

    if ($total_items <= 1) {
      return new WP_REST_Response(['error' => 'Δεν μπορείτε να διαγράψετε το τελευταίο είδος.'], 500);
    }

    // To id του record που στάλθηκε
    $id = intval($item['id']);

    // Έλεγχος αν το item έχει χρησιμοποιηθεί σε rented_items
    $usage_count = $wpdb->get_var($wpdb->prepare(
      "SELECT COUNT(*) FROM $tableRentedItems WHERE item_id = %d",
      $id
    ));

    if ($usage_count > 0):
      return new WP_REST_Response(['error' => 'Δεν μπορείτε να διαγράψετε αυτόν τον εξοπλισμό γιατί χρησιμοποιείται σε ενοικιάσεις.'], 500);
    endif;

    // Προσπάθεια delete
    $affected = $wpdb->delete($tableItems, ['id' => $id]);

    // Έλεγχος αν πέτυχε το delete
    if ($affected === false) {
      // Σφάλμα
      return new WP_REST_Response(['error' => 'Αποτυχία διαγραφής της είδους.'], 500);
    } elseif ($affected === 0) {
      return new WP_REST_Response(['error' => 'Δεν διαγράφηκε το είδος.'], 400);
    } else {
      // Επιτυχία
    }

    // Επιστροφή του πίνακα
    return get_all_items();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * -----------------------------
 * RENTS Call back functions
 * -----------------------------
 */

/**
 * Rent validation
 */

function rentValidRecord($rent)
{
  if (empty($rent['customer_id']) or (int)$rent['customer_id'] == 0):
    error_log("customer is empty ");
  endif;

  // Έλεγχος: empty start_date, end_date
  if (empty($rent['start_date']) or empty($rent['end_date']) or strtotime($rent['start_date']) == '0000-00-00' or strtotime($rent['end_date']) == '0000-00-00') :
    error_log("start_date is empty " . print_r($rent['start_date'], true));
    return new WP_REST_Response(['error' => 'Η ημερομηνίες έναρξης & λήξης είναι υποχρεωτικές.'], 500);
  endif;

  // Έλεγχος: start_date <= end_date
  if ($rent['start_date'] > $rent['end_date']):
    return new WP_REST_Response(['error' => 'Η ημερομηνία έναρξης δεν μπορεί να είναι μεταγενέστερη της λήξης.'], 500);
  endif;

  if (count($rent['rented_items']) < 1 or empty($rent['rented_items']) or !is_array($rent['rented_items'])):
    return new WP_REST_Response(['error' => 'Δεν επιλέξατε εξοπλισμό.'], 500);
  endif;

  if (!empty($rent['name'])):
    return new WP_REST_Response(['error' => 'Δεν επιλέξατε πελάτη.'], 500);
  endif;
}

/**
 * GET all rents
 */

function get_all_rents()
{
  global $wpdb;

  try { // *** On success ***

    // Κάνουμε JOIN με customers για να πάρουμε το όνομα του πελάτη
    $allRents = $wpdb->get_results(
      "
        SELECT r.*, c.name AS customer_name FROM {$wpdb->prefix}rent_rents r
        LEFT JOIN {$wpdb->prefix}rent_customers c ON r.customer_id = c.id
        ORDER BY r.start_date DESC
        ",
      ARRAY_A
    );

    // Για κάθε rent, παίρνουμε τα related items από τον πίνακα rented_items
    foreach ($allRents as &$rent) {
      $rent_id = $rent['id'];
      $items = $wpdb->get_col($wpdb->prepare(
        "SELECT item_id FROM {$wpdb->prefix}rent_rented_items WHERE rent_id = %d",
        $rent_id
      ));
      $rent['items'] = $items;
    }

    return new WP_REST_Response($allRents, 200);
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * Create rent
 */

function create_rent($request)
{
  global $wpdb;

  try { //***On success***

    // Το rent object που έστειλε το axios
    $rent = $request->get_json_params();

    // Προσπάθεια insert
    $inserted  = $wpdb->insert('mal_rent_rents', [
      'customer_id' => $rent['customer_id'],
      'start_date' => $rent['start_date'],
      'end_date' => $rent['end_date'],
      'ret_date' => $rent['ret_date'],
      'paid_date' => $rent['paid_date'],
      'notes' => $rent['notes'],
    ]);

    // Is inserteted failed?
    if ($inserted === false):
      return new WP_REST_Response(['error' => 'Αποτυχία εισαγωγής εγγραφής ενοικίασης.'], 500);
    endif;

    $rent_id = $wpdb->insert_id;

    // Εισαγωγή rented_items
    if (!empty($rent['rented_items']) && is_array($rent['rented_items'])):
      foreach ($rent['rented_items'] as $item_id) {
        $wpdb->insert('mal_rent_rented_items', [
          'rent_id' => $rent_id,
          'item_id' => $item_id
        ]);
      }
    endif;

    return get_all_rents();
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * Update rent
 */
function update_rent($request)
{
  global $wpdb;

  try { // *** On success ***

    // To rent object που στάλθηκε
    $rent = $request->get_json_params();

    $id = (int)$rent['id'];

    // Έλεγχος: start_date <= end_date
    if ($rent['start_date'] > $rent['end_date']):
      return new WP_REST_Response(['error' => 'Η ημερομηνία έναρξης δεν μπορεί να είναι μεταγενέστερη της λήξης.'], 500);
    endif;

    if (count($rent['rented_items']) < 1 or empty($rent['rented_items']) or !is_array($rent['rented_items'])):
      return new WP_REST_Response(['error' => 'Δεν επιλέξατε εξοπλισμό.'], 500);
    endif;

    if (!empty($rent['name'])):
      return new WP_REST_Response(['error' => 'Δεν επιλέξατε πελάτη.'], 500);
    endif;

    // Table names variables
    $tableRents = $wpdb->prefix . 'rent_rents';
    $tableRentedItems = $wpdb->prefix . 'rent_rented_items';

    // Edit record
    $editRecord = [
      'customer_id' => (int)$rent['customer_id'],
      'start_date' => $rent['start_date'],
      'end_date' => $rent['end_date'],
      'ret_date' => $rent['ret_date'],
      'paid_date' => $rent['paid_date'],
      'notes' => $rent['notes']
    ];

    error_log("editRecord: " . print_r($editRecord, true));
    error_log("id: " . print_r($id, true));

    // Προσπάθεια update
    $affected = $wpdb->update($tableRents, $editRecord, ['id' => $id]);

    // Έλεγχος αν πέτυχε το update
    if ($affected === false) {
      // Σφάλμα
      return new WP_REST_Response(['error' => 'Αποτυχία ενημέρωσης της ενοικίασης.'], 500);
      // } elseif ($affected === 0) {
      //   return new WP_REST_Response(['error' => 'Δεν χρειάστηκε ενημέρωση η ενοικίαση. :' . $id], 300);
    } else {
      // Επιτυχία
    }

    // Διαγραφή των rented_items του rent
    $wpdb->delete($tableRentedItems, ['rent_id' => $id]);

    // Προσθήκη των νέων rented_items
    if (!empty($rent['rented_items']) && is_array($rent['rented_items'])) {
      foreach ($rent['rented_items'] as $item_id) {
        $wpdb->insert($tableRentedItems, [
          'rent_id' => $id,
          'item_id' => $item_id
        ]);
      }
    }

    return get_all_rents();
    // return new WP_REST_Response(['updated' => true], 200);

  } catch (Exception $e) { // On error

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }
}

/**
 * Delete rent
 */

function delete_rent($request)
{
  global $wpdb;

  try { // *** On success ***

    // To rent object που στάλθηκε
    $rent = $request->get_json_params();

    // Table names variables
    $tableRents = $wpdb->prefix . 'rent_rents';
    $tableRentedItems = $wpdb->prefix . 'rent_rented_items';

    // Έλεγχος: Υπάρχει μόνο 1 rent;
    $total_rents = $wpdb->get_var("SELECT COUNT(*) FROM $tableRents");

    if ($total_rents <= 1) {
      return new WP_REST_Response(['error' => 'Δεν μπορείτε να διαγράψετε την τελευταία ενοικίαση.'], 500);
    }

    // Το rent.id
    $id = (int)$rent['id'];

    // Έλεγχος: Υπάρχουν rented items;
    $total_rented_items = $wpdb->get_var("SELECT COUNT(*) FROM $tableRentedItems  WHERE rent_id = $id");

    if ($total_rented_items > 0):
      // Προσπάθεια delete rented_items
      $affected1 = $wpdb->delete($tableRentedItems, ['rent_id' => $id]);

      // Έλεγχος αν πέτυχε το delete στον rented_items
      if ($affected1 === false) {
        // Σφάλμα
        return new WP_REST_Response(['error' => 'Αποτυχία διαγραφής μερών της ενοικίασης.'], 500);
      } elseif ($affected1 === 0) {
        return new WP_REST_Response(['error' => 'Δεν διαγράφηκαν μέρη της ενοικίασης.'], 400);
      } else {
        // Επιτυχία
      }
    endif;

    // Προσπάθεια delete rents
    $affected2 = $wpdb->delete($tableRents, ['id' => $id]);

    // Έλεγχος αν πέτυχε το delete στον rents
    if ($affected2 === false) {
      // Σφάλμα
      return new WP_REST_Response(['error' => 'Αποτυχία διαγραφής της ενοικίασης ή μέρους της.'], 500);
    } elseif ($affected1 === 0 || $affected2 === 0) {
      return new WP_REST_Response(['error' => 'Δεν διαγράφηκε η ενοικίαση ή μέρος της.'], 400);
    } else {
      // Επιτυχία
    }
  } catch (Exception $e) { // *** On error ***

    return new WP_REST_Response(['error' => $e->getMessage()], 500);
  }

  return get_all_rents();
}
