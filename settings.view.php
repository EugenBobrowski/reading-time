<?php
/**
 * @var $settings
 * @var $data
 */


?>
<div class="wrap">

	<h2><?php echo esc_html( get_admin_page_title() ); ?></h2>

    <form action="<?php echo $_SERVER['REQUEST_URI']?>" method="post">

        <?php wp_nonce_field('save_reading_time_settings'); ?>

        <?php \AtfHtmlHelper::table($settings, $data, array('name_prefix' => $this->id)); ?>

        <p class="submit">
            <input type="submit" name="reading_time_settings_save" id="submit" class="button button-primary"
                   value="Clear Previous Calculations">
            <input type="submit" name="reading_time_settings_save" id="submit" class="button button-primary"
                   value="Save Changes">
        </p>
    </form>
</div>