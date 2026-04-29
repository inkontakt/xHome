<?php
/**
 * Plugin Name: inKontakt Estimate Details
 * Description: Displays inKontakt estimate details with PDF download/preview and an image gallery via shortcode.
 * Version: 0.5.0
 * Author: Sumaiya
 * Text Domain: inkontakt-estimate-details
 */

if (!defined('ABSPATH')) {
    exit;
}

final class Inkontakt_Estimate_Details_Plugin
{
    private const VERSION = '0.5.0';
    private const OPTION_NAME = 'inkontakt_estimate_details_colors';
    private const REST_NAMESPACE = 'inkontakt-estimate-details/v1';
    private const SHORTCODE = 'inkontakt_estimate_details';

    public static function init(): void
    {
        add_shortcode(self::SHORTCODE, [self::class, 'render_shortcode']);
        add_action('wp_enqueue_scripts', [self::class, 'register_assets']);
        add_action('rest_api_init', [self::class, 'register_rest_routes']);
        add_action('admin_menu', [self::class, 'register_admin_menu']);
        add_action('admin_init', [self::class, 'handle_admin_settings_save']);
    }

    public static function register_admin_menu(): void
    {
        add_menu_page(
            'inKontakt Estimate Details',
            'Estimate Details',
            'manage_options',
            'inkontakt-estimate-details',
            [self::class, 'render_admin_page'],
            'dashicons-media-document',
            58
        );
    }

    public static function render_admin_page(): void
    {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to access this page.', 'inkontakt-estimate-details'));
        }

        $color_settings = self::get_color_settings();
        $palette = $color_settings['palette'];
        $assignments = $color_settings['assignments'];
        $assignment_labels = self::assignment_labels();
        $supabase_url_configured = self::config_value([
            'INKONTAKT_ESTIMATE_SUPABASE_URL',
            'SUPABASE_URL',
            'PUBLIC_SUPABASE_URL',
        ]) !== '';
        $supabase_key_configured = self::config_value([
            'INKONTAKT_ESTIMATE_SUPABASE_SERVICE_KEY',
            'INKONTAKT_ESTIMATE_SUPABASE_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'SUPABASE_ANON_KEY',
        ]) !== '';
        $example_url = home_url('/estimate-details/?tenant=carfit&estimate_id=912e3950-9b05-42ca-8ad8-ea680c854e7b');
        $pdf_endpoint = rest_url(self::REST_NAMESPACE . '/pdf');
        ?>
        <div class="wrap">
            <h1><?php echo esc_html__('inKontakt Estimate Details', 'inkontakt-estimate-details'); ?></h1>
            <?php if (isset($_GET['ied_settings_saved']) && $_GET['ied_settings_saved'] === '1') : ?>
                <div class="notice notice-success is-dismissible">
                    <p><?php echo esc_html__('Estimate Details colors saved.', 'inkontakt-estimate-details'); ?></p>
                </div>
            <?php endif; ?>
            <p>
                <?php echo esc_html__('Use this shortcode on any WordPress page to display the estimate details interface.', 'inkontakt-estimate-details'); ?>
            </p>

            <div style="max-width: 920px; display: grid; gap: 16px;">
                <div style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <h2 style="margin-top: 0;"><?php echo esc_html__('Shortcode', 'inkontakt-estimate-details'); ?></h2>
                    <p><?php echo esc_html__('Add this shortcode to the page where you want the estimate details to appear:', 'inkontakt-estimate-details'); ?></p>
                    <input
                        type="text"
                        readonly
                        value="[<?php echo esc_attr(self::SHORTCODE); ?>]"
                        onclick="this.select();"
                        style="width: 100%; max-width: 360px; font-family: monospace;"
                    >
                </div>

                <div style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <h2 style="margin-top: 0;"><?php echo esc_html__('URL Parameters', 'inkontakt-estimate-details'); ?></h2>
                    <p><?php echo esc_html__('The shortcode works on any page slug. The URL must include tenant or tenant_id, plus estimate_id.', 'inkontakt-estimate-details'); ?></p>
                    <input
                        type="text"
                        readonly
                        value="<?php echo esc_attr($example_url); ?>"
                        onclick="this.select();"
                        style="width: 100%; font-family: monospace;"
                    >
                </div>

                <div style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <h2 style="margin-top: 0;"><?php echo esc_html__('Configuration Status', 'inkontakt-estimate-details'); ?></h2>
                    <table class="widefat striped" style="max-width: 680px;">
                        <tbody>
                            <tr>
                                <td><code>INKONTAKT_ESTIMATE_SUPABASE_URL</code></td>
                                <td>
                                    <?php echo $supabase_url_configured ? esc_html__('Configured', 'inkontakt-estimate-details') : esc_html__('Missing', 'inkontakt-estimate-details'); ?>
                                </td>
                            </tr>
                            <tr>
                                <td><code>INKONTAKT_ESTIMATE_SUPABASE_SERVICE_KEY</code></td>
                                <td>
                                    <?php echo $supabase_key_configured ? esc_html__('Configured', 'inkontakt-estimate-details') : esc_html__('Missing', 'inkontakt-estimate-details'); ?>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p><?php echo esc_html__('Recommended wp-config.php setup:', 'inkontakt-estimate-details'); ?></p>
                    <textarea readonly rows="4" onclick="this.select();" style="width: 100%; max-width: 760px; font-family: monospace;">define('INKONTAKT_ESTIMATE_SUPABASE_URL', 'https://your-project.supabase.co');
define('INKONTAKT_ESTIMATE_SUPABASE_SERVICE_KEY', 'your-service-role-or-api-key');</textarea>
                </div>

                <div style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <h2 style="margin-top: 0;"><?php echo esc_html__('What This Plugin Displays', 'inkontakt-estimate-details'); ?></h2>
                    <ul style="list-style: disc; padding-left: 22px;">
                        <li><?php echo esc_html__('PDF preview and download button.', 'inkontakt-estimate-details'); ?></li>
                        <li><?php echo esc_html__('Estimate image gallery.', 'inkontakt-estimate-details'); ?></li>
                        <li><?php echo esc_html__('Full-screen image lightbox with previous, next, close, and keyboard navigation.', 'inkontakt-estimate-details'); ?></li>
                    </ul>
                </div>

                <div style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <h2 style="margin-top: 0;"><?php echo esc_html__('PDF Proxy Endpoint', 'inkontakt-estimate-details'); ?></h2>
                    <p><?php echo esc_html__('This endpoint is used internally for PDF preview and download so the browser does not depend on the original file host.', 'inkontakt-estimate-details'); ?></p>
                    <input
                        type="text"
                        readonly
                        value="<?php echo esc_attr($pdf_endpoint); ?>"
                        onclick="this.select();"
                        style="width: 100%; font-family: monospace;"
                    >
                </div>

                <form method="post" action="<?php echo esc_url(admin_url('admin.php?page=inkontakt-estimate-details')); ?>" style="background: #fff; border: 1px solid #dcdcde; border-radius: 4px; padding: 18px;">
                    <?php wp_nonce_field('ied_save_color_settings', 'ied_color_nonce'); ?>
                    <input type="hidden" name="ied_settings_action" value="save_colors">

                    <h2 style="margin-top: 0;"><?php echo esc_html__('Colors', 'inkontakt-estimate-details'); ?></h2>
                    <p><?php echo esc_html__('Create reusable colors here first. Then assign those colors to the frontend parts below.', 'inkontakt-estimate-details'); ?></p>

                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th><?php echo esc_html__('Color Key', 'inkontakt-estimate-details'); ?></th>
                                <th><?php echo esc_html__('Label', 'inkontakt-estimate-details'); ?></th>
                                <th><?php echo esc_html__('Color', 'inkontakt-estimate-details'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($palette as $key => $color) : ?>
                                <tr>
                                    <td>
                                        <input type="text" name="ied_color_key[]" value="<?php echo esc_attr($key); ?>" style="width: 100%; font-family: monospace;">
                                    </td>
                                    <td>
                                        <input type="text" name="ied_color_label[]" value="<?php echo esc_attr($color['label']); ?>" style="width: 100%;">
                                    </td>
                                    <td>
                                        <input type="color" name="ied_color_value[]" value="<?php echo esc_attr($color['value']); ?>">
                                        <code><?php echo esc_html($color['value']); ?></code>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            <?php for ($i = 0; $i < 3; $i++) : ?>
                                <tr>
                                    <td><input type="text" name="ied_color_key[]" value="" placeholder="custom_<?php echo esc_attr((string) ($i + 1)); ?>" style="width: 100%; font-family: monospace;"></td>
                                    <td><input type="text" name="ied_color_label[]" value="" placeholder="Custom color" style="width: 100%;"></td>
                                    <td><input type="color" name="ied_color_value[]" value="#0f172a"></td>
                                </tr>
                            <?php endfor; ?>
                        </tbody>
                    </table>

                    <h2><?php echo esc_html__('Style Assignments', 'inkontakt-estimate-details'); ?></h2>
                    <p><?php echo esc_html__('Choose which saved color should be used for each frontend element.', 'inkontakt-estimate-details'); ?></p>

                    <table class="widefat striped">
                        <tbody>
                            <?php foreach ($assignment_labels as $assignment_key => $label) : ?>
                                <tr>
                                    <td style="width: 280px;"><strong><?php echo esc_html($label); ?></strong></td>
                                    <td>
                                        <select name="ied_assignment[<?php echo esc_attr($assignment_key); ?>]">
                                            <?php foreach ($palette as $color_key => $color) : ?>
                                                <option value="<?php echo esc_attr($color_key); ?>" <?php selected($assignments[$assignment_key] ?? '', $color_key); ?>>
                                                    <?php echo esc_html($color['label'] . ' (' . $color['value'] . ')'); ?>
                                                </option>
                                            <?php endforeach; ?>
                                        </select>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>

                    <p>
                        <button type="submit" class="button button-primary">
                            <?php echo esc_html__('Save Colors', 'inkontakt-estimate-details'); ?>
                        </button>
                    </p>
                </form>
            </div>
        </div>
        <?php
    }

    public static function handle_admin_settings_save(): void
    {
        if (!isset($_POST['ied_settings_action']) || $_POST['ied_settings_action'] !== 'save_colors') {
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have permission to save these settings.', 'inkontakt-estimate-details'));
        }

        check_admin_referer('ied_save_color_settings', 'ied_color_nonce');

        $settings = self::sanitize_color_settings($_POST);
        update_option(self::OPTION_NAME, $settings, false);

        wp_safe_redirect(add_query_arg([
            'page' => 'inkontakt-estimate-details',
            'ied_settings_saved' => '1',
        ], admin_url('admin.php')));
        exit;
    }

    private static function default_color_settings(): array
    {
        return [
            'palette' => [
                'text' => ['label' => 'Text', 'value' => '#020617'],
                'heading' => ['label' => 'Heading', 'value' => '#0f172a'],
                'muted' => ['label' => 'Muted text', 'value' => '#64748b'],
                'panel_bg' => ['label' => 'Panel background', 'value' => '#ffffff'],
                'border' => ['label' => 'Border', 'value' => '#e2e8f0'],
                'dashed_border' => ['label' => 'Dashed border', 'value' => '#cbd5e1'],
                'primary' => ['label' => 'Primary button', 'value' => '#0f172a'],
                'primary_hover' => ['label' => 'Primary button hover', 'value' => '#1e293b'],
                'button_text' => ['label' => 'Button text', 'value' => '#ffffff'],
                'danger' => ['label' => 'Close button', 'value' => '#dc2626'],
                'danger_hover' => ['label' => 'Close button hover', 'value' => '#b91c1c'],
                'soft_bg' => ['label' => 'Soft background', 'value' => '#f8fafc'],
                'thumb_bg' => ['label' => 'Thumbnail background', 'value' => '#f1f5f9'],
                'nav_hover' => ['label' => 'Navigation hover', 'value' => '#eef2ff'],
                'nav_hover_border' => ['label' => 'Navigation hover border', 'value' => '#94a3b8'],
                'error' => ['label' => 'Error', 'value' => '#b91c1c'],
            ],
            'assignments' => [
                'page_text' => 'text',
                'heading_text' => 'heading',
                'muted_text' => 'muted',
                'panel_background' => 'panel_bg',
                'panel_border' => 'border',
                'dash_border' => 'dashed_border',
                'download_background' => 'primary',
                'download_background_hover' => 'primary_hover',
                'download_text' => 'button_text',
                'pdf_background' => 'soft_bg',
                'pdf_page_background' => 'panel_bg',
                'image_tile_background' => 'thumb_bg',
                'image_label_background' => 'panel_bg',
                'image_label_text' => 'heading',
                'focus_outline' => 'heading',
                'lightbox_background' => 'panel_bg',
                'close_background' => 'danger',
                'close_background_hover' => 'danger_hover',
                'close_text' => 'button_text',
                'nav_background' => 'panel_bg',
                'nav_border' => 'dashed_border',
                'nav_text' => 'heading',
                'nav_hover_background' => 'nav_hover',
                'nav_hover_border' => 'nav_hover_border',
                'active_border' => 'heading',
                'error_text' => 'error',
            ],
        ];
    }

    private static function assignment_labels(): array
    {
        return [
            'page_text' => 'Main page text',
            'heading_text' => 'Headings',
            'muted_text' => 'Muted/helper text',
            'panel_background' => 'Panel background',
            'panel_border' => 'Panel border',
            'dash_border' => 'Dashed PDF/empty border',
            'download_background' => 'Download button background',
            'download_background_hover' => 'Download button hover',
            'download_text' => 'Download button text',
            'pdf_background' => 'PDF viewer background',
            'pdf_page_background' => 'PDF page background',
            'image_tile_background' => 'Image tile background',
            'image_label_background' => 'Image label background',
            'image_label_text' => 'Image label text',
            'focus_outline' => 'Focus outline',
            'lightbox_background' => 'Lightbox background',
            'close_background' => 'Close button background',
            'close_background_hover' => 'Close button hover',
            'close_text' => 'Close button text',
            'nav_background' => 'Previous/next background',
            'nav_border' => 'Previous/next border',
            'nav_text' => 'Previous/next text',
            'nav_hover_background' => 'Previous/next hover background',
            'nav_hover_border' => 'Previous/next hover border',
            'active_border' => 'Active thumbnail border',
            'error_text' => 'Error text',
        ];
    }

    private static function get_color_settings(): array
    {
        $defaults = self::default_color_settings();
        $saved = get_option(self::OPTION_NAME, []);

        if (!is_array($saved)) {
            return $defaults;
        }

        $palette = isset($saved['palette']) && is_array($saved['palette']) ? $saved['palette'] : [];
        $assignments = isset($saved['assignments']) && is_array($saved['assignments']) ? $saved['assignments'] : [];

        return [
            'palette' => array_merge($defaults['palette'], $palette),
            'assignments' => array_merge($defaults['assignments'], $assignments),
        ];
    }

    private static function sanitize_color_settings(array $source): array
    {
        $defaults = self::default_color_settings();
        $keys = isset($source['ied_color_key']) && is_array($source['ied_color_key']) ? wp_unslash($source['ied_color_key']) : [];
        $labels = isset($source['ied_color_label']) && is_array($source['ied_color_label']) ? wp_unslash($source['ied_color_label']) : [];
        $values = isset($source['ied_color_value']) && is_array($source['ied_color_value']) ? wp_unslash($source['ied_color_value']) : [];
        $palette = [];

        foreach ($keys as $index => $raw_key) {
            $key = sanitize_key((string) $raw_key);
            $label = sanitize_text_field((string) ($labels[$index] ?? ''));
            $value = sanitize_hex_color((string) ($values[$index] ?? ''));

            if ($key === '' && $label !== '') {
                $key = sanitize_key($label);
            }

            if ($key === '' || $value === '') {
                continue;
            }

            $palette[$key] = [
                'label' => $label !== '' ? $label : $key,
                'value' => $value,
            ];
        }

        if (empty($palette)) {
            $palette = $defaults['palette'];
        }

        $posted_assignments = isset($source['ied_assignment']) && is_array($source['ied_assignment'])
            ? wp_unslash($source['ied_assignment'])
            : [];
        $assignments = [];

        foreach (self::assignment_labels() as $assignment_key => $label) {
            $selected = sanitize_key((string) ($posted_assignments[$assignment_key] ?? ''));
            $assignments[$assignment_key] = isset($palette[$selected])
                ? $selected
                : ($defaults['assignments'][$assignment_key] ?? array_key_first($palette));
        }

        return [
            'palette' => $palette,
            'assignments' => $assignments,
        ];
    }

    private static function frontend_style_attribute(): string
    {
        $settings = self::get_color_settings();
        $palette = $settings['palette'];
        $assignments = $settings['assignments'];
        $map = [
            'page_text' => '--ied-page-text',
            'heading_text' => '--ied-heading-text',
            'muted_text' => '--ied-muted-text',
            'panel_background' => '--ied-panel-bg',
            'panel_border' => '--ied-panel-border',
            'dash_border' => '--ied-dash-border',
            'download_background' => '--ied-download-bg',
            'download_background_hover' => '--ied-download-hover-bg',
            'download_text' => '--ied-download-text',
            'pdf_background' => '--ied-pdf-bg',
            'pdf_page_background' => '--ied-pdf-page-bg',
            'image_tile_background' => '--ied-thumb-bg',
            'image_label_background' => '--ied-image-label-bg',
            'image_label_text' => '--ied-image-label-text',
            'focus_outline' => '--ied-focus-outline',
            'lightbox_background' => '--ied-lightbox-bg',
            'close_background' => '--ied-close-bg',
            'close_background_hover' => '--ied-close-hover-bg',
            'close_text' => '--ied-close-text',
            'nav_background' => '--ied-nav-bg',
            'nav_border' => '--ied-nav-border',
            'nav_text' => '--ied-nav-text',
            'nav_hover_background' => '--ied-nav-hover-bg',
            'nav_hover_border' => '--ied-nav-hover-border',
            'active_border' => '--ied-active-border',
            'error_text' => '--ied-error-text',
        ];
        $declarations = [];

        foreach ($map as $assignment_key => $css_var) {
            $color_key = $assignments[$assignment_key] ?? '';
            $value = isset($palette[$color_key]['value']) ? sanitize_hex_color($palette[$color_key]['value']) : '';

            if ($value !== '') {
                $declarations[] = $css_var . ':' . $value;
            }
        }

        return implode(';', $declarations);
    }

    public static function register_assets(): void
    {
        $base_url = plugin_dir_url(__FILE__);

        wp_register_style(
            'inkontakt-estimate-details',
            $base_url . 'assets/estimate-details.css',
            [],
            self::VERSION
        );

        wp_register_script(
            'inkontakt-estimate-details',
            $base_url . 'assets/estimate-details.js',
            [],
            self::VERSION,
            true
        );
    }

    public static function register_rest_routes(): void
    {
        register_rest_route(
            self::REST_NAMESPACE,
            '/pdf',
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [self::class, 'handle_pdf_proxy'],
                'permission_callback' => '__return_true',
                'args' => [
                    'url' => [
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'esc_url_raw',
                    ],
                    'download' => [
                        'type' => 'string',
                        'required' => false,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'filename' => [
                        'type' => 'string',
                        'required' => false,
                        'sanitize_callback' => 'sanitize_file_name',
                    ],
                ],
            ]
        );
    }

    public static function render_shortcode(): string
    {
        wp_enqueue_style('inkontakt-estimate-details');
        wp_enqueue_script('inkontakt-estimate-details');

        $tenant = self::get_query_value('tenant');
        if ($tenant === '') {
            $tenant = self::get_query_value('tenant_id');
        }

        $estimate_id = self::get_query_value('estimate_id');
        $data = self::load_estimate_data($tenant, $estimate_id);
        $person = is_array($data['person']) ? $data['person'] : null;
        $pdf_file = is_array($data['pdfFile']) ? $data['pdfFile'] : null;
        $image_files = is_array($data['imageFiles']) ? $data['imageFiles'] : [];
        $tenant_label = $tenant !== '' && $data['status'] !== 'missing-config' && is_array($data['tenant'])
            ? ($data['tenant']['name'] ?? '')
            : '';

        $last_name = $person['last_name'] ?? '';
        $greeting = $last_name !== '' ? sprintf('Hallo Herr %s,', $last_name) : 'Hallo there';
        $pdf_download_url = '';
        $pdf_preview_url = '';

        if ($pdf_file && !empty($pdf_file['file_url'])) {
            $filename = self::safe_download_file_name($pdf_file['file_name'] ?? '', 'PDF Preview.pdf');
            $pdf_preview_url = self::pdf_proxy_url($pdf_file['file_url']);
            $pdf_download_url = self::pdf_proxy_url($pdf_file['file_url'], true, $filename);
        }

        $image_empty_message = self::image_empty_message($data);
        $style_attribute = self::frontend_style_attribute();

        ob_start();
        ?>
        <section class="ied-page" data-ied-root style="<?php echo esc_attr($style_attribute); ?>">
            <div class="ied-wrap">
                <header class="ied-header">
                    <p class="ied-kicker">Angebot und Schadensbilder zum Download</p>
                    <h1><?php echo esc_html($greeting); ?></h1>
                    <p>Hier finden Sie Ihr Angebot zum Download inklusive der Schadensbilder.</p>
                </header>

                <div class="ied-grid">
                    <section class="ied-panel">
                        <?php if ($pdf_file && !empty($pdf_file['file_url'])) : ?>
                            <div class="ied-panel-head">
                                <div class="ied-title-row">
                                    <h2>PDF Preview</h2>
                                    <?php if ($tenant_label !== '') : ?>
                                        <span><?php echo esc_html($tenant_label); ?></span>
                                    <?php endif; ?>
                                </div>
                                <a class="ied-button ied-button-primary" href="<?php echo esc_url($pdf_download_url); ?>" target="_blank" rel="noreferrer">Download</a>
                            </div>
                        <?php endif; ?>

                        <div class="ied-pdf-frame">
                            <?php if ($pdf_preview_url !== '') : ?>
                                <div
                                    class="ied-pdf-viewer"
                                    data-ied-pdf-url="<?php echo esc_url($pdf_preview_url); ?>"
                                    role="region"
                                    aria-label="PDF Preview"
                                >
                                    <div class="ied-pdf-loader">Loading PDF...</div>
                                </div>
                            <?php else : ?>
                                <div class="ied-empty ied-empty-tall">
                                    <?php echo esc_html(self::pdf_empty_message($data)); ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <p class="ied-note">This area embeds the PDF file linked to the submission.</p>

                        <?php if ($pdf_download_url !== '') : ?>
                            <div class="ied-download-row">
                                <a class="ied-button ied-button-primary ied-button-large" href="<?php echo esc_url($pdf_download_url); ?>" target="_blank" rel="noreferrer">Download</a>
                            </div>
                        <?php endif; ?>
                    </section>

                    <section class="ied-panel">
                        <div class="ied-panel-head">
                            <div class="ied-title-row">
                                <h2>Image Gallery</h2>
                                <?php if ($tenant_label !== '') : ?>
                                    <span><?php echo esc_html($tenant_label); ?></span>
                                <?php endif; ?>
                            </div>
                        </div>

                        <div class="ied-gallery" data-ied-gallery>
                            <?php if (!empty($image_files)) : ?>
                                <?php foreach ($image_files as $index => $image) : ?>
                                    <?php $image_url = $image['file_url'] ?? ''; ?>
                                    <button
                                        class="ied-thumb"
                                        type="button"
                                        data-ied-index="<?php echo esc_attr((string) $index); ?>"
                                        aria-label="<?php echo esc_attr(sprintf('View photo %d in detail', $index + 1)); ?>"
                                    >
                                        <?php if ($image_url !== '') : ?>
                                            <img src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($image['file_name'] ?? 'Estimate image'); ?>" loading="lazy">
                                        <?php else : ?>
                                            <span>Image URL missing</span>
                                        <?php endif; ?>
                                        <strong>Photo #<?php echo esc_html((string) ($index + 1)); ?></strong>
                                    </button>
                                <?php endforeach; ?>
                            <?php else : ?>
                                <div class="ied-empty ied-gallery-empty"><?php echo esc_html($image_empty_message); ?></div>
                            <?php endif; ?>
                        </div>

                        <p class="ied-note">
                            <?php echo esc_html(!empty($image_files) ? 'Click on any image to view it in full screen with navigation controls.' : $image_empty_message); ?>
                        </p>

                        <?php if (!empty($image_files)) : ?>
                            <script type="application/json" data-ied-images><?php echo wp_json_encode(array_values($image_files), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON is hex-escaped for script context. ?></script>
                        <?php endif; ?>
                    </section>
                </div>
            </div>
        </section>
        <?php

        return (string) ob_get_clean();
    }

    public static function handle_pdf_proxy(WP_REST_Request $request)
    {
        $file_url = (string) $request->get_param('url');
        $is_download = (string) $request->get_param('download') === '1';
        $requested_filename = (string) $request->get_param('filename');

        if (!self::is_allowed_remote_file_url($file_url)) {
            return new WP_Error('ied_invalid_url', 'Invalid url parameter.', ['status' => 400]);
        }

        $response = wp_remote_get($file_url, [
            'timeout' => 20,
            'redirection' => 3,
            'stream' => false,
        ]);

        if (is_wp_error($response)) {
            return new WP_Error('ied_pdf_fetch_failed', 'Unable to fetch PDF.', ['status' => 502]);
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($status < 200 || $status >= 300 || $body === '') {
            return new WP_Error('ied_pdf_fetch_failed', 'Unable to fetch PDF.', ['status' => $status ?: 502]);
        }

        $content_type = wp_remote_retrieve_header($response, 'content-type');
        if (!$content_type) {
            $content_type = 'application/pdf';
        }

        status_header($status);
        header('Content-Type: ' . $content_type);
        header('Cache-Control: public, max-age=600, stale-while-revalidate=86400');

        if ($is_download) {
            $filename = self::safe_download_file_name($requested_filename, 'document.pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
        } else {
            header('Content-Disposition: inline');
        }

        echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Raw proxied PDF bytes.
        exit;
    }

    private static function load_estimate_data(string $tenant_identifier, string $estimate_id): array
    {
        if ($tenant_identifier === '' || $estimate_id === '') {
            return self::empty_result('missing-query', 'Missing tenant or estimate_id query parameters.');
        }

        $config = self::get_supabase_config();
        if (!$config) {
            return self::empty_result('missing-config', 'Supabase URL or service role key is not configured for this WordPress site.');
        }

        try {
            $estimate_lookup_filter = self::get_estimate_lookup_filter($estimate_id);
            if (!$estimate_lookup_filter) {
                return self::empty_result('not-found', 'The supplied estimate ID format is not supported.');
            }

            $tenants = self::supabase_fetch(
                $config,
                'tenants?select=id,name,slug&' . self::get_tenant_lookup_filter($tenant_identifier) . '&limit=1'
            );
            $tenant = $tenants[0] ?? null;

            if (!$tenant) {
                return self::empty_result('not-found', 'No tenant was found for the supplied tenant value.');
            }

            $estimates = self::supabase_fetch(
                $config,
                'process_estimate?select=id,process_estimate_uuid,person_id,tenant_id,form_submission_id&tenant_id=' . self::eq($tenant['id']) . '&' . $estimate_lookup_filter . '&limit=1'
            );
            $estimate = $estimates[0] ?? null;

            if (!$estimate) {
                return self::empty_result('not-found', 'No estimate was found for the supplied tenant and estimate IDs.');
            }

            if (empty($estimate['form_submission_id'])) {
                return self::empty_result('error', 'The estimate is missing its linked form submission ID.');
            }

            if (empty($estimate['process_estimate_uuid'])) {
                return self::empty_result('error', 'The estimate is missing its public estimate UUID.');
            }

            $submissions = self::supabase_fetch(
                $config,
                'form_submissions?select=submission_id,tenant_id,title,summary,connected_person_id&tenant_id=' . self::eq($tenant['id']) . '&submission_id=' . self::eq($estimate['form_submission_id']) . '&limit=1'
            );

            $people = !empty($estimate['person_id'])
                ? self::supabase_fetch($config, 'sa_persons?select=first_name,last_name,email_primary&person_id=' . self::eq($estimate['person_id']) . '&limit=1')
                : [];

            $child_estimate_links = self::supabase_fetch(
                $config,
                'estimate_submission_fields?select=submission_id,field_value&field_key=' . self::eq('parent_estimate_id') . '&field_value=' . self::eq($estimate['process_estimate_uuid'])
            );

            $form_image_files = self::supabase_fetch(
                $config,
                'form_submission_files?select=id:file_id,file_name,file_url,file_mime_type,file_position,created_at&submission_id=' . self::eq($estimate['form_submission_id']) . '&order=file_position.asc'
            );

            $submission = $submissions[0] ?? null;
            if (!$submission) {
                $result = self::empty_result('error', 'The estimate could not be matched to a form submission.');
                $result['estimate'] = $estimate;
                $result['tenant'] = $tenant;
                return $result;
            }

            $child_ids = [];
            foreach ($child_estimate_links as $link) {
                if (!empty($link['submission_id'])) {
                    $child_ids[$link['submission_id']] = $link['submission_id'];
                }
            }

            $pdf_source_files = [];
            if (!empty($child_ids)) {
                $pdf_source_files = self::supabase_fetch(
                    $config,
                    'estimate_submission_files?select=id,file_name,file_url,file_mime_type,file_position,created_at,estimate_sequence&submission_id=' . self::in_filter(array_values($child_ids)) . '&order=file_position.asc'
                );
            }

            return [
                'status' => 'ready',
                'estimate' => $estimate,
                'submission' => $submission,
                'tenant' => $tenant,
                'person' => $people[0] ?? null,
                'pdfFile' => self::select_pdf_file($pdf_source_files),
                'imageFiles' => self::select_image_files($form_image_files),
                'message' => 'Estimate data loaded.',
            ];
        } catch (Throwable $error) {
            return self::empty_result('error', $error->getMessage() ?: 'Unable to load estimate data.');
        }
    }

    private static function get_supabase_config(): ?array
    {
        $url = self::config_value([
            'INKONTAKT_ESTIMATE_SUPABASE_URL',
            'SUPABASE_URL',
            'PUBLIC_SUPABASE_URL',
        ]);
        $service_key = self::config_value([
            'INKONTAKT_ESTIMATE_SUPABASE_SERVICE_KEY',
            'INKONTAKT_ESTIMATE_SUPABASE_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'SUPABASE_ANON_KEY',
        ]);

        if ($url === '' || $service_key === '') {
            return null;
        }

        return [
            'url' => untrailingslashit($url),
            'service_key' => $service_key,
        ];
    }

    private static function config_value(array $names): string
    {
        foreach ($names as $name) {
            if (defined($name) && is_string(constant($name)) && constant($name) !== '') {
                return (string) constant($name);
            }

            $env_value = getenv($name);
            if (is_string($env_value) && $env_value !== '') {
                return $env_value;
            }
        }

        return '';
    }

    private static function supabase_fetch(array $config, string $path): array
    {
        $response = wp_remote_get($config['url'] . '/rest/v1/' . $path, [
            'timeout' => 20,
            'headers' => [
                'apikey' => $config['service_key'],
                'Authorization' => 'Bearer ' . $config['service_key'],
                'Accept' => 'application/json',
            ],
        ]);

        if (is_wp_error($response)) {
            throw new RuntimeException($response->get_error_message());
        }

        $status = (int) wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($status < 200 || $status >= 300) {
            throw new RuntimeException('Supabase ' . $status . ': ' . ($body ?: wp_remote_retrieve_response_message($response)));
        }

        $decoded = json_decode($body, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Supabase returned an invalid JSON response.');
        }

        return $decoded;
    }

    private static function empty_result(string $status, string $message): array
    {
        return [
            'status' => $status,
            'estimate' => null,
            'submission' => null,
            'tenant' => null,
            'person' => null,
            'pdfFile' => null,
            'imageFiles' => [],
            'message' => $message,
        ];
    }

    private static function get_query_value(string $key): string
    {
        if (!isset($_GET[$key])) {
            return '';
        }

        return sanitize_text_field(wp_unslash((string) $_GET[$key]));
    }

    private static function eq(string $value): string
    {
        return 'eq.' . rawurlencode($value);
    }

    private static function in_filter(array $values): string
    {
        $quoted = array_map(
            static function ($value): string {
                return '"' . str_replace('"', '\"', (string) $value) . '"';
            },
            $values
        );

        return 'in.(' . implode(',', $quoted) . ')';
    }

    private static function get_estimate_lookup_filter(string $estimate_id): ?string
    {
        if (preg_match('/^\d+$/', $estimate_id)) {
            return 'id=' . self::eq($estimate_id);
        }

        if (self::is_uuid($estimate_id)) {
            return 'process_estimate_uuid=' . self::eq($estimate_id);
        }

        return null;
    }

    private static function get_tenant_lookup_filter(string $tenant_identifier): string
    {
        return self::is_uuid($tenant_identifier)
            ? 'id=' . self::eq($tenant_identifier)
            : 'slug=' . self::eq($tenant_identifier);
    }

    private static function is_uuid(string $value): bool
    {
        return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $value);
    }

    private static function select_pdf_file(array $files): ?array
    {
        $files = self::dedupe_assets($files);
        $files = array_filter($files, static function ($file): bool {
            return !empty($file['file_url']) && self::is_pdf_file($file);
        });
        usort($files, [self::class, 'sort_assets']);

        return $files[0] ?? null;
    }

    private static function select_image_files(array $files): array
    {
        $files = self::dedupe_assets($files);
        $files = array_filter($files, static function ($file): bool {
            return !empty($file['file_url']) && self::is_image_file($file);
        });
        usort($files, [self::class, 'sort_assets']);

        return array_values(array_map(static function ($file): array {
            return [
                'file_name' => $file['file_name'] ?? null,
                'file_url' => $file['file_url'] ?? null,
                'file_mime_type' => $file['file_mime_type'] ?? null,
                'file_position' => $file['file_position'] ?? null,
            ];
        }, $files));
    }

    private static function dedupe_assets(array $files): array
    {
        $seen = [];
        $deduped = [];

        foreach ($files as $file) {
            $key = $file['id'] ?? $file['file_url'] ?? (($file['file_name'] ?? '') . '-' . ($file['file_position'] ?? ''));

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $deduped[] = $file;
        }

        return $deduped;
    }

    private static function sort_assets(array $left, array $right): int
    {
        $left_position = $left['file_position'] ?? PHP_INT_MAX;
        $right_position = $right['file_position'] ?? PHP_INT_MAX;

        if ($left_position !== $right_position) {
            return $left_position <=> $right_position;
        }

        $left_time = !empty($left['created_at']) ? strtotime($left['created_at']) : PHP_INT_MAX;
        $right_time = !empty($right['created_at']) ? strtotime($right['created_at']) : PHP_INT_MAX;

        if ($left_time !== $right_time) {
            return $left_time <=> $right_time;
        }

        return strcmp((string) ($left['id'] ?? $left['file_name'] ?? ''), (string) ($right['id'] ?? $right['file_name'] ?? ''));
    }

    private static function is_pdf_file(array $file): bool
    {
        $mime = strtolower((string) ($file['file_mime_type'] ?? ''));
        $name = strtolower((string) ($file['file_name'] ?? ''));
        $url = strtolower((string) ($file['file_url'] ?? ''));

        return self::string_contains($mime, 'pdf') || self::string_ends_with($name, '.pdf') || self::string_contains($url, '.pdf');
    }

    private static function is_image_file(array $file): bool
    {
        $mime = strtolower((string) ($file['file_mime_type'] ?? ''));
        $name = strtolower((string) ($file['file_name'] ?? ''));
        $url = strtolower((string) ($file['file_url'] ?? ''));

        return self::string_starts_with($mime, 'image/')
            || (bool) preg_match('/\.(?:avif|gif|jpe?g|png|webp)$/i', $name)
            || (bool) preg_match('/\.(?:avif|gif|jpe?g|png|webp)(?:$|[?#])/i', $url);
    }

    private static function pdf_proxy_url(string $file_url, bool $download = false, string $filename = ''): string
    {
        $params = ['url' => $file_url];

        if ($download) {
            $params['download'] = '1';
            $params['filename'] = $filename;
        }

        return add_query_arg($params, rest_url(self::REST_NAMESPACE . '/pdf'));
    }

    private static function safe_download_file_name(string $name, string $fallback = 'estimate-document.pdf'): string
    {
        $value = sanitize_file_name(trim($name));
        if ($value === '') {
            $value = $fallback;
        }

        return self::string_ends_with(strtolower($value), '.pdf') ? $value : $value . '.pdf';
    }

    private static function image_empty_message(array $data): string
    {
        if ($data['status'] === 'missing-config') {
            return 'Supabase is not configured for this WordPress site yet.';
        }

        if ($data['status'] === 'not-found') {
            return 'No estimate images were found for these IDs.';
        }

        if ($data['status'] === 'error') {
            return $data['message'];
        }

        return 'Image thumbnails will appear here once linked to this estimate.';
    }

    private static function pdf_empty_message(array $data): string
    {
        if ($data['status'] === 'missing-query') {
            return 'PDF content will render here once connected.';
        }

        if ($data['status'] === 'missing-config') {
            return 'Supabase is not configured for this WordPress site yet.';
        }

        if ($data['status'] === 'not-found') {
            return 'No estimate was found for these tenant and estimate values.';
        }

        if ($data['status'] === 'error') {
            return $data['message'];
        }

        return 'No PDF uploaded for this estimate yet.';
    }

    private static function is_allowed_remote_file_url(string $url): bool
    {
        if (!wp_http_validate_url($url)) {
            return false;
        }

        $parts = wp_parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        $host = strtolower((string) ($parts['host'] ?? ''));

        if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
            return false;
        }

        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
        }

        return true;
    }

    private static function string_contains(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) !== false;
    }

    private static function string_starts_with(string $haystack, string $needle): bool
    {
        return $needle === '' || strpos($haystack, $needle) === 0;
    }

    private static function string_ends_with(string $haystack, string $needle): bool
    {
        if ($needle === '') {
            return true;
        }

        return substr($haystack, -strlen($needle)) === $needle;
    }
}

Inkontakt_Estimate_Details_Plugin::init();
