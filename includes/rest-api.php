<?php
if (!defined('ABSPATH')) {
  exit;
}

/**
 * Customers routes
 */

add_action('rest_api_init', function () {
  $namespace = 'rents/v1';

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
});

// GET ALL Customers
function get_customers()
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_customers';
  return $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
}

/**
 * CREATE new customer
 */
// 
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
  $phone = sanitize_text_field($customer["phone"]);

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
      'phone' => $phone
    ]
  );

  // Επιστροφή του id του νέου record
  return ['id' => $wpdb->insert_id];

  // Επιστροφή του πίνακα
  // return rest_ensure_response($wpdb->get_results("SELECT * FROM $table  ORDER BY name ASC"));
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
  $phone = sanitize_text_field($customer["phone"]);

  // UPDATE του record
  // Ο 1ος πίνακας είναι τα data assignments και
  // ο 2ος είναι το where.
  $wpdb->update(
    $table,
    [
      'name' => $name,
      'notes' => $notes,
      'phone' => $phone
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

// Items routes
// ------------
add_action('rest_api_init', function () {
  $namespace = 'rental-sql/v1';

  // Get all items
  register_rest_route($namespace, '/items', [
    'methods' => 'GET',
    'callback' => 'get_items',
    'permission_callback' => '__return_true',
  ]);

  // Create a new item
  register_rest_route($namespace, '/items', [
    'methods' => 'POST',
    'callback' => 'create_item',
    'permission_callback' => '__return_true',
  ]);

  // Update an item
  register_rest_route($namespace, '/items/(?P<id>\d+)', [
    'methods' => 'PUT',
    'callback' => 'update_item',
    'permission_callback' => '__return_true',
  ]);

  // Delete an item
  register_rest_route($namespace, '/items/(?P<id>\d+)', [
    'methods' => 'DELETE',
    'callback' => 'delete_item',
    'permission_callback' => '__return_true',
  ]);
});

function get_items()
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';
  return $wpdb->get_results("SELECT * FROM $table");
}

function create_item(WP_REST_Request $request)
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';
  $description = sanitize_text_field($request->get_param('item_description'));

  if (empty($description)) {
    return new WP_Error('missing_description', 'Η περιγραφή είναι υποχρεωτική', ['status' => 400]);
  }

  $wpdb->insert($table, ['item_description' => $description]);

  return ['id' => $wpdb->insert_id, 'item_description' => $description];
}

function update_item(WP_REST_Request $request)
{
  global $wpdb;
  $items_table = $wpdb->prefix . 'items';

  $item_ID = (int) $request['id'];
  $item_description = sanitize_text_field($request->get_param('item_description'));
  $stock = (int) $request->get_param('stock');

  if ($stock < 0) {
    return new WP_Error('invalid_stock', 'Το stock δεν μπορεί να είναι αρνητικό', ['status' => 400]);
  }

  $wpdb->update(
    $items_table,
    ['item_description' => $item_description, 'stock' => $stock],
    ['item_ID' => $item_ID]
  );

  return ['item_ID' => $item_ID, 'item_description' => $item_description, 'stock' => $stock];
}

function delete_item(WP_REST_Request $request)
{
  global $wpdb;
  $table = $wpdb->prefix . 'rent_items';
  $id = (int) $request['id'];

  $wpdb->delete($table, ['item_ID' => $id]);

  return ['message' => 'Item deleted'];
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
