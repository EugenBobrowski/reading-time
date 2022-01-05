<?php

/**
 * @param int|WP_Post|null $post   Optional. Post ID or post object. Defaults to global $post.
 */
function get_reading_time($post = null) {

	$post = get_post($post);

	if (empty($post)) {
		return '';
	}

	return Reading_Time\Main::get_instance()->get_reading_time($post->ID);

}

function the_reading_time($post = null) {
	echo get_reading_time($post);
}