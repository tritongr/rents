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
    'callback' => 'get_customers',
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
    'callback' => 'get_items',
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

function get_customers()
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_customers';
  return $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
}

/**
 * CREATE new customer
 */

function create_customer(WP_REST_Request $request)
{
  // Record sent
  $customer = $request->get_json_params();

  // DB handle
  global $wpdb;
  $table = $wpdb->prefix . 'rent_customers';

  // Τα fields του νέου record που στάλθηκαν
  $name = sanitize_text_field($customer["name"]);
  $notes = sanitize_text_field($customer["notes"]);
  $is_active = sanitize_text_field($customer["is_active"]);

  // Validation των fields
  if (empty($name)) {
    return new WP_Error('missing_name', 'Το όνομα είναι υποχρεωτικό', ['status' => 400]);
  }

  // Insert του νέου record
  $wpdb->insert(
    $table,
    [
      'name' => $name,
      'notes' => $notes,
      'is_active' => $is_active
    ]
  );

  // Επιστροφή του id του νέου record
  // return ['id' => $wpdb->insert_id];

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
}

/**
 * UPDATE customer
 */
function update_customer(WP_REST_Request $request)
{

  // Record sent
  $customer = $request->get_json_params();

  // DB handle
  global $wpdb;
  $table = $wpdb->prefix . 'rent_customers';

  // Τα fields που στάλθηκαν
  $id = (int) $customer['id'];
  $name = sanitize_text_field($customer["name"]);
  $notes = sanitize_text_field($customer["notes"]);
  $is_active = sanitize_text_field($customer["is_active"]);

  // UPDATE του record
  // Το 1ο array parameter είναι τα data assignments και
  // το 2ο είναι το where.
  $wpdb->update(
    $table,
    [
      'name' => $name,
      'notes' => $notes,
      'is_active' => $is_active
    ],
    ['id' => $id], // where
  );

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
}

/**
 * DELETE customer
 */
function delete_customer(WP_REST_Request $request)
{
  // Το record που στάλθηκε
  $customer = $request->get_json_params();

  // Handle DB
  global $wpdb;
  $table = $wpdb->prefix . 'rent_customers';

  // To id του record που στάλθηκε
  $id = $customer['id'];

  // Διαγραφή του record
  $wpdb->delete($table, ['id' => $id]);

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
}

/**
 * -----------------------------
 * ITEMS Call back functions
 * -----------------------------
 */

/**
 * GET all items
 */

function get_items()
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';
  return $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
}

/**
 * CREATE new item
 */

function create_item(WP_REST_Request $request)
{
  // Record sent
  $item = $request->get_json_params();

  // DB handle
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';

  // Τα fields του νέου record που στάλθηκαν
  $name = sanitize_text_field($item["name"]);
  $description = sanitize_text_field($item["description"]);
  $is_available = sanitize_text_field($item["is_available"]);

  // Validation των fields
  if (empty($name)) {
    return new WP_Error('missing_name', 'H ονομασία είναι υποχρεωτική', ['status' => 400]);
  }

  // Insert του νέου record
  $wpdb->insert(
    $table,
    [
      'name' => $name,
      'description' => $description,
      'is_available' => $is_available
    ]
  );

  // Inserted id check
  $instered_id = $wpdb->insert_id;
  if ($instered_id === 0):
    return new WP_Error('db_insert_failed', 'Αποτυχία εισαγωγής νέας εγγραφής', ['status' => 600]);
  endif;

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));


  // Επιστροφή του id του νέου record
  // return ['id' => $wpdb->insert_id];
}

/**
 * UPDATE item
 */
function update_item(WP_REST_Request $request)
{

  // Record sent
  $item = $request->get_json_params();

  // DB handle
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';

  // Τα fields που στάλθηκαν
  $id = (int) $item['id'];
  $name = sanitize_text_field($item["name"]);
  $description = sanitize_text_field($item["description"]);
  $is_available = sanitize_text_field($item["is_available"]);

  // UPDATE του record
  // Το 1ο array parameter είναι τα data assignments και
  // το 2ο είναι το where.
  $wpdb->update(
    $table,
    [
      'name' => $name,
      'description' => $description,
      'is_available' => $is_available
    ],
    ['id' => $id], // where
  );

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
}

/**
 * DELETE item
 */
function delete_item(WP_REST_Request $request)
{
  // Το record που στάλθηκε
  $item = $request->get_json_params();

  // Handle DB
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';

  // To id του record που στάλθηκε
  $id = $item['id'];

  // Διαγραφή του record
  $wpdb->delete($table, ['id' => $id]);

  // Επιστροφή του πίνακα
  return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
}

// Rents
// -----
add_action('rest_api_init', function () {
  $namespace = 'rental-sql/v1';

  // Get all rents
  register_rest_route($namespace, '/rents', [
    'methods' => 'GET',
    'callback' => 'get_rents',
    'permission_callback' => '__return_true',
  ]);

  // Create a new rent
  register_rest_route($namespace, '/rents', [
    'methods' => 'POST',
    'callback' => 'create_rent',
    'permission_callback' => '__return_true',
  ]);

  // Update a rent (e.g., mark as returned)
  register_rest_route($namespace, '/rents/(?P<id>\d+)', [
    'methods' => 'PUT',
    'callback' => 'update_rent',
    'permission_callback' => '__return_true',
  ]);

  // Delete a rent
  register_rest_route($namespace, '/rents/(?P<id>\d+)', [
    'methods' => 'DELETE',
    'callback' => 'delete_rent',
    'permission_callback' => '__return_true',
  ]);
});

function get_rents()
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_rents';
  return $wpdb->get_results("SELECT * FROM $table");
}

function create_rent(WP_REST_Request $request)
{
  global $wpdb;
  $rents_table = $wpdb->prefix . 'rent_rents';
  $items_table = $wpdb->prefix . 'rent_items';

  $customer_ID = (int) $request->get_param('customer_ID');
  $item_ID = (int) $request->get_param('item_ID');
  $start_date = sanitize_text_field($request->get_param('start_date'));

  if (!$customer_ID || !$item_ID || empty($start_date)) {
    return new WP_Error('missing_data', 'Όλα τα πεδία είναι υποχρεωτικά', ['status' => 400]);
  }

  // Ελέγχουμε αν υπάρχει διαθέσιμο stock
  $stock = $wpdb->get_var($wpdb->prepare("SELECT stock FROM $items_table WHERE item_ID = %d", $item_ID));
  if ($stock <= 0) {
    return new WP_Error('no_stock', 'Το αντικείμενο δεν είναι διαθέσιμο', ['status' => 400]);
  }

  // Δημιουργία ενοικίασης
  $wpdb->insert($rents_table, [
    'customer_ID' => $customer_ID,
    'item_ID' => $item_ID,
    'start_date' => $start_date,
    'returned_date' => null,
  ]);

  // Μείωση του stock
  $wpdb->query($wpdb->prepare("UPDATE $items_table SET stock = stock - 1 WHERE item_ID = %d", $item_ID));

  return ['id' => $wpdb->insert_id];
}

function update_rent(WP_REST_Request $request)
{
  global $wpdb;
  $rents_table = $wpdb->prefix . 'rent_rents';
  $items_table = $wpdb->prefix . 'rent_items';

  $id = (int) $request['id'];
  $returned_date = sanitize_text_field($request->get_param('returned_date'));

  // Παίρνουμε το item_ID της ενοικίασης
  $item_ID = $wpdb->get_var($wpdb->prepare("SELECT item_ID FROM $rents_table WHERE rent_ID = %d", $id));

  // Ενημέρωση της ενοικίασης
  $wpdb->update($rents_table, ['returned_date' => $returned_date], ['rent_ID' => $id]);

  // Αύξηση του stock
  $wpdb->query($wpdb->prepare("UPDATE $items_table SET stock = stock + 1 WHERE item_ID = %d", $item_ID));

  return ['id' => $id, 'returned_date' => $returned_date];
}

function delete_rent(WP_REST_Request $request)
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_rents';
  $id = (int) $request['id'];

  $wpdb->delete($table, ['rent_ID' => $id]);

  return ['message' => 'Rent deleted'];
}
