<?php

/**
 * Plugin Name: Rents Management
 * Description: Διαχείριση ενοικιάσεων εξοπλισμού
 * Author:      mm
 * Version: 1.0.0
 * Author URI:  https://malatantis.com
 * License URI: https://malatantis.com
 */


/**
 * If this file is called directly, abort
 */
if (!defined("WPINC")) {
  die();
}

/**
 * Initialize plugin with enqeues
 */
function rents_enqueue_assets()
{
  if (!is_page('rents')) return; // ⬅ Μόνο στη σελίδα που έχει το shortcode

  $plugin_url  = plugin_dir_url(__FILE__);
  $plugin_path = plugin_dir_path(__FILE__);

  // Σωστό enqueue με δυναμικά dependencies
  $asset_file = include($plugin_path . 'build/index.asset.php');

  wp_enqueue_script(
    "rents-main-js",
    $plugin_url . "build/index.js",
    $asset_file['dependencies'], // Εξαρτήσεις
    $asset_file['version'], // Cache busting
    true
  );

  wp_enqueue_style(
    "rents-main-styles",
    $plugin_url . "build/index.css",
    array(),
    filemtime($plugin_path . "build/index.css")
  );

  wp_enqueue_style('dashicons');

  wp_add_inline_script(
    'rents-main-js',
    'const rentsGlobal = ' . json_encode([
      'root_url' => get_site_url(),
      'nonce' => wp_create_nonce('wp_rest'),
    ]),
    'before'
  );
}
add_action("wp_enqueue_scripts", "rents_enqueue_assets");

/**
 * Custom REST API and routes end points
 */
require_once plugin_dir_path(__FILE__) . "includes/rest-api.php";


/**
 * Δημιουργία shortcode για inject to <div> στην σελίδα όπου θαγίνει render η εφαρμογή
 */
function mm_rents_app($atts = [], $content = null)
{
  return '<div id="rents-app"></div>';
}
add_shortcode("rents-app", "mm_rents_app");
