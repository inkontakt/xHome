<?php
/**
 * Fluent Forms embed endpoint for Astro
 *
 * Test URLs:
 * https://connect.carfit-hamburg.de/ff-embed/?form_id=11
 * https://connect.carfit-hamburg.de/?ff_embed=1&form_id=11
 */

add_action('init', function () {
    add_rewrite_tag('%ff_embed%', '1');
    add_rewrite_rule('^ff-embed/?$', 'index.php?ff_embed=1', 'top');
});

add_filter('query_vars', function ($vars) {
    $vars[] = 'ff_embed';
    return $vars;
});

add_action('send_headers', function () {
    if (get_query_var('ff_embed') !== '1') {
        return;
    }

    header_remove('X-Frame-Options');
    header_remove('Content-Security-Policy');
    header("Content-Security-Policy: frame-ancestors 'self' http://localhost:4321;");
}, 9999);

add_action('template_redirect', function () {
    if (get_query_var('ff_embed') !== '1') {
        return;
    }

    $form_id = isset($_GET['form_id']) ? absint($_GET['form_id']) : 0;

    if (!$form_id) {
        status_header(400);
        wp_die('Missing form_id');
    }

    header_remove('X-Frame-Options');
    header_remove('Content-Security-Policy');
    header("Content-Security-Policy: frame-ancestors 'self' http://localhost:4321;");

    nocache_headers();
    status_header(200);
    ?>
    <!doctype html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta charset="<?php bloginfo('charset'); ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex,nofollow">
        <?php wp_head(); ?>
        <style>
            html,
            body {
                margin: 0;
                padding: 0;
                background: #ffffff !important;
            }

            .ff-embed-wrap {
                max-width: 1000px;
                margin: 0 auto;
                padding: 0;
                background: #ffffff !important;
            }
        </style>
    </head>
    <body <?php body_class('ff-embed-page'); ?>>
        <div class="ff-embed-wrap">
            <?php echo do_shortcode(sprintf('[fluentform id="%d"]', $form_id)); ?>
        </div>
        <?php wp_footer(); ?>
    </body>
    </html>
    <?php
    exit;
});
