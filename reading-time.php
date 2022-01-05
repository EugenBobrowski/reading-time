<?php
/*
Plugin Name: Reading Time
Plugin URI: https://unilime.com/
Description: The plugin should allow user to add a “Reading Time” feature to his blog posts.
Version: 3.3.4
Author: Eugen Bobrowski
Author URI: https://unilime.com/
License: GPLv2 or later
Text Domain: reading_time
*/


namespace Reading_Time;

class Main {
	protected static $instance;

	private $calculating_now;

	private function __construct() {
		add_action( 'save_post', array( $this, 'update_reading_time' ) );
		add_shortcode( 'reading_time', array( $this, 'shortcode' ) );
		add_action( 'reading_time_clear_cached_calculations', array( $this, 'reset_all_cached_data' ) );
	}

	/**
	 * @param $post_id int
	 * @param $post \WP_Post
	 */
	public function update_reading_time( $post_id ) {

		$settings = Admin::get_instance()->get_settings();

		$post = get_post( $post_id );

		if ( ! in_array( $post->post_type, $settings['post_types'] ) ) {
			return;
		}

		$this->calculating_now = true;

		$content = $post->post_content;

		foreach ($settings['meta_fields'] as $meta_key) {
			$meta = get_post_meta($post_id, $meta_key, false);
			$content .= $this->maybe_stringify_meta($meta);
		}

		$content = apply_filters( 'the_content', $content, $post->ID );

		$content = strip_tags( $content );
		$content = str_replace( PHP_EOL, ' ', $content );

		$this->calculating_now = false;

		$words_number = str_word_count( $content );

		$reading_time = $words_number / $settings['words_per_minute'];

		switch ( $settings['rounding'] ) {
			case 'up':
				$reading_time = ceil( $reading_time );
				break;
			case 'up_half':
				$reading_time = $reading_time * 2;
				$reading_time = ceil( $reading_time );
				$reading_time = $reading_time / 2;
				break;
			case 'down':
				$reading_time = floor( $reading_time );
				break;
			case 'down_half':
				$reading_time = $reading_time * 2;
				$reading_time = floor( $reading_time );
				$reading_time = $reading_time / 2;

				break;
		}

		if (!$reading_time) {
			$reading_time = 1;
		}

		update_post_meta( $post_id, '_reading_time', $reading_time );

	}

	public function shortcode () {
		return sprintf(apply_filters('reading_time_shortcode', '<span class="reading-time">%s</span>'), $this->get_reading_time(get_the_ID()));
	}

	public function get_reading_time($post_id) {

		if ( ! empty( $this->calculating_now ) ) {
			return '';
		}

		$settings = Admin::get_instance()->get_settings();
		$post = get_post($post_id);

		if ( ! in_array( $post->post_type, $settings['post_types'] ) ) {
			return '';
		}

		$reading_time = get_post_meta( $post_id, '_reading_time', true );

		if ( empty( $reading_time )) {
			$this->update_reading_time( $post_id );
			$reading_time = get_post_meta( $post_id, '_reading_time', true );
			if ( empty( $reading_time ) ) {
				return '';
			}
		}

		$need_decimals = ! in_array( $settings['rounding'], array(
			'up',
			'down'
		) );

		return sprintf(
			ceil( $reading_time ) == 1 ? '%s minute' : '%s minutes',
			number_format( $reading_time, intval( $need_decimals ) ) );

	}

	public function reset_all_cached_data() {
		global $wpdb;

		$wpdb->query( "DELETE FROM `wp_postmeta` WHERE `meta_key` = '_reading_time';" );
	}

	public function maybe_stringify_meta ($meta) {
		if (is_array($meta)) {
			$string = ' ';
			foreach ($meta as $item) {
				$string .= $this->maybe_stringify_meta($item);
			}
			return $string;
		} else {
			return ' ' . $meta;
		}
	}

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}

Main::get_instance();

require_once plugin_dir_path( __FILE__ ) . '/functions.php';
require_once plugin_dir_path( __FILE__ ) . '/settings.php';
