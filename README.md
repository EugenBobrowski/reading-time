# Reading time plugin features

## Settings page

This page is placed below “Settings” in the
admin menu.

- No. of Words Per Minute (default 200) – will be used for calculations
- Supported Post Types (default – only “post”) 
- Rounding behavior – (default “round up”)
- Content meta fields (default – only “post_content”) (Bonus)
- Clear Previous calculations Button (Bonus)

## The ”reading time” calculation process

The ”Reading Time” value is calculating and caching (stored for future use) on the following events:

- Once the post is created.
- When a post is updated (by using either the Admin, or the official WordPress php functions - such as wp_update_post)
- When the reading time is requested (e.g. for showing in theme), and no previous value exists (To support reading time
  for posts that are already in the system once the plugin is activated, or after settings change).
- In any other case when there is a chance that the value is no longer correct (e.g. when the admin changed the No. of
  Words Per Minute setting)
- The plugin do nothing if the post it is presented in is not in the
  supported post types configured in the admin settings page.



## Presentation of the calculated value in the frontend theme.

The plugin allow multiple ways for embedding the “Reading Time”
value in a theme:
1. Using the shortcode `[reading_time]` in post content.
2. By calling a php function named `the_reading_time()`.
3. By echoing the return value of a php function named `get_reading_time()`

When embedded with shortcode – the value is rendering wrapped in
HTML, including a label. 

The classes and labels HTML are filterable using hook `reading_time_shortcode`. 
Default is `<span class="reading-time">%s</span>`

## Unrealized features

* Make the label managed in the admin settings page
* Change reading time labels HTML classes instead full labels HTML
* Make the plugin’s admin fully translated using WordPress’ localization
  guidelines
* Create the following custom commands for managing the plugin using WP CLI:
  * wp reading-time config get – Show the values of the settings
  * wp reading-time config set CONFIG VALUE – Update the value of a setting
  * wp reading-time clear-cache – Clear previous calculation and force recalculation for all posts
  * wp reading-time get PID – Show the calculated reading time value for a specific post

