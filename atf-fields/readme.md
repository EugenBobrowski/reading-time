# ATF fields helper

### Text field

### Number

### Textarea

```php
<?php AtfHtmlHelper::textarea(array(
        'type' => 'textarea',
        'title' => __('Head section'),
        'class' => 'large-text code',
        'default' => '',
        'desc' => 'Head section script',
        'rows' => 10,
        'cols' => 50,
                                               )); ?>
```

### Radio

```php
<?php AtfHtmlHelper::radio(array(
        'id' => 'receivers',
        'name' => 'receivers',
        'value' => '',
        'vertical' => false,
        'options' => array(
            'val1' => 'Label1',
            'val2' => 'Label2',
            'val3' => 'Label3',
            'val4' => 'Label4',
        )
)); ?>
```

`vertical` _(Default: **true**)_ - show in vertical style.
Just add `<br />` after label

`class` _(Default: **empty string**)_ - use to apply your custom styles
or add show as a buttons (styles included). To show in a button style just add class `.check-buttons`

### Checkbox

```php
<?php AtfHtmlHelper::checkbox(array(
                        'id' => 'receivers',
                        'name' => 'receivers',
                        'value' => '',
                        'vertical' => false,
                        'options' => array(
                            'val1' => 'Label1',
                            'val2' => 'Label2',
                            'val3' => 'Label3',
                            'val4' => 'Label4',
                        )
                    )); ?>
```

`vertical` _(Default: **true**)_ - show in vertical style.
Just add `<br />` after label

`class` _(Default: **empty string**)_ - use to apply your custom styles
or add show as a buttons (styles included). To show in a button style just add class `.check-buttons`

### Search field

```php
AtfHtmlHelper::search(array(
    'id'                => 'product_id',
    'title'             => __('Product'),
    'type'              => 'search',
    'ajax_action'       => 'search_product_ajax',
    'placeholder'       => __( 'Search' ),
    'selected_callback' => array( $this, 'selected_product_title' )
));
```

This field require two callbacks: ajax and callback for selected field.


```php 
add_action( 'wp_ajax_search_product_for_bundle', 'ajax_search_product' );

function ajax_search_product () {
    $s = sanitize_text_field( $_POST['s'] );

    $q = array( 'post_type' => 'product' );

    if ( ! empty( $s ) ) {
        $q['s'] = $s;
    }

    $posts = get_posts( $q );
    $res   = array();
    foreach ( $posts as $post ) {
        $html = '';
        $html .= get_the_post_thumbnail($post->ID) . ' ';
        $html .= $post->post_title;
        $res[] = array( 'value' => $post->ID, 'html' => $html );

    }

    wp_send_json( $res );
}

function selected_product_title( $value ) {

    if ( empty( $value ) ) {
        return 'No selected product';
    }

    $post = get_post( $value );

    if (empty( $post )) {
        return 'Select';
    }

    $html = '';
    $html .= get_the_post_thumbnail($post->ID) . ' ';
    $html .= $post->post_title;

    return $html;
}

```



### Group
 
```php
 <?php AtfHtmlHelper::group(array(
		 'name' => 'robots_options[allows]',
		 'items' => array(
			 'path' => array(
				 'title' => __('Path', 'robotstxt-rewrite'),
				 'type' => 'text',
				 'desc' => __('Relative path of WordPress installation directory', 'robotstxt-rewrite'),
			 ),
			 'bots' => array(
				 'title' => __('Robots names', 'robotstxt-rewrite'),
				 'type' => 'checkbox',
				 'options' => array(
					 'googlebot' => 'Google',
					 'googlebot-mobile' => 'Google Mobile',
					 'googlebot-image'=> 'Google Images',
					 'Yandex' => 'Yandex',
				 ),
			 ),
			 'allowed' => array(
				 'title' => __('Allow', 'robotstxt-rewrite'),
				 'type' => 'tumbler',
				 'options' => array('plain' => 'Text', 'html' => 'HTML'),
				 'desc' => __('Allow / Disallow', 'robotstxt-rewrite'),
				 'cell_style' => 'text-align: center;',
			 ),
		 ),
		 //use default key for ATF Options 
		 'value' => array(
		 	array(
		 		'path' => '/',
		 		'bots' => 'all',
		 		'allowed' => 1
		 	),
		 	array(
		 		'path' => '/wp-admin/',
		 		'bots' => 'all',
		 		'allowed' => 0
		 	),
		 ),
	 )
 );
 ?>
```
 
 sdf
