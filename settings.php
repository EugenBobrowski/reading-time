<?php

namespace Reading_Time;

class Admin {
	protected static $instance;
	private $settings_fields;
	private $defaults;

	private function __construct() {

		add_action( 'admin_menu', array( $this, 'admin_menu' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'assets' ) );

		add_action( 'admin_init', array( $this, 'save_settings' ) );
	}

	public function admin_menu() {
		add_options_page( __( 'Reading Time Settings', 'reading_time' ), __( 'Reading Time', 'reading_time' ), 'manage_options', 'reading_time_settings', array(
			$this,
			'settings_page'
		) );
	}

	public function assets() {
		if ( empty( $_GET['page'] ) || $_GET['page'] !== 'reading_time_settings' ) {
			return;
		}

		include_once plugin_dir_path( __FILE__ ) . '/atf-fields/htmlhelper.php';
		\AtfHtmlHelper::assets();
	}

	public function settings_page() {

		$data = $this->get_settings();

		$settings = $this->settings_fields;

		include plugin_dir_path( __FILE__ ) . '/settings.view.php';
	}

	public function save_settings() {
		if ( empty( $_POST['reading_time_settings_save'] ) || !wp_verify_nonce($_POST['_wpnonce'], 'save_reading_time_settings') ) {
			return;
		}

		$data = array();

		$this->set_settings_fields();

		foreach ($this->settings_fields as $option_key=>$option) {
			if (isset($_POST[$option_key])) {
				$data[$option_key] = call_user_func($option['sanitize'], $_POST[$option_key]);
			}

			if (empty($data[$option_key])) {
				$data[$option_key] = $option['default'];
			}
		}

		update_option('reading_time_settings', $data);

		if ($_POST['reading_time_settings_save'] == 'Clear Previous Calculations') {
			do_action('reading_time_clear_cached_calculations');
		}

		do_action('reading_time_save_settings');

	}

	public function get_settings () {

		$this->set_settings_fields();

		$data = get_option( 'reading_time_settings', array() );

		$data = wp_parse_args( $data, $this->get_defaults());

		return $data;
	}

	private function set_settings_fields() {
		if ( $this->settings_fields !== null) {
			return;
		}

		$this->settings_fields = array(
			'words_per_minute' => array(
				'type'    => 'text',
				'title'   => __( 'No. of Words Per Minute', 'reading_time' ),
				'class'   => 'large-text code',
				'default' => 200,
				'sanitize' => 'absint'
			),
			'post_types'       => array(
				'type'     => 'checkbox',
				'title'    => __( 'Supported Post Types', 'reading_time' ),
				'vertical' => false,
				'class'    => 'check-buttons',
				'options'  => get_post_types( array( 'public' => 1 ) ),
				'default' => array('post'),
				'sanitize' => array($this, 'sanitize_post_types')
			),
			'rounding'         => array(
				'type'     => 'radio',
				'title'    => __( 'Rounding behavior', 'reading_time' ),
				'vertical' => false,
				'class'    => 'check-buttons',
				'options'  => array(
					'up'        => __( 'Round up', 'reading_time' ),
					'up_half'   => __( 'Round up in ½ minute steps', 'reading_time' ),
					'down'      => __( 'Round down', 'reading_time' ),
					'down_half' => __( 'Round down in ½ minute steps', 'reading_time' ),
				),
				'default' => 'up',
				'sanitize' => 'sanitize_key'
			),
			'meta_fields' => array(
				'type'    => 'chosen',
				'title'   => __( 'Meta fields', 'reading_time' ),
				'default' => array(),
				'values'  => $this->get_meta_keys(),
				'sanitize' => array($this, 'sanitize_meta_keys')
			),

		);
	}

	private function get_defaults() {
		$this->defaults = array();
		foreach ( $this->settings_fields as $option_key => $option ) {
			$this->defaults[ $option_key ] = $option['default'];
		}

		return $this->defaults;
	}

	private function sanitize_post_types ($post_types) {
		foreach ($post_types as $key=>$post_type) {
			$post_type = sanitize_key($post_type);
			if (!in_array($post_type, get_post_types( array( 'public' => 1 ) ))) {
				unset($post_types[$key]);
			}
		}

		return $post_types;
	}

	private function sanitize_meta_keys ($meta_keys) {

		$allowed_meta_keys = $this->get_meta_keys();

		foreach ($meta_keys as $key=>$meta_key) {
			$meta_key = sanitize_key($meta_key);
			if (!in_array($meta_key, $allowed_meta_keys)) {
				unset($meta_keys[$key]);
			}
		}

		return $meta_keys;
	}

	private function get_meta_keys () {
		global $wpdb;

		$allowed_meta_keys = $wpdb->get_col("SELECT `meta_key` FROM `wp_postmeta` GROUP BY `meta_key`;");

		$allowed_meta_keys = array_combine($allowed_meta_keys, $allowed_meta_keys);

		return $allowed_meta_keys;

	}

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}

Admin::get_instance();