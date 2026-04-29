=== inKontakt Estimate Details ===
Contributors: Sumaiya
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 0.5.0

Displays inKontakt estimate details with PDF preview/download and an image gallery.

== Installation ==

1. Upload and activate this plugin in WordPress.
2. Add the shortcode to any page:

   [inkontakt_estimate_details]

3. Open that page with tenant and estimate_id query parameters:

   /your-page/?tenant=carfit&estimate_id=912e3950-9b05-42ca-8ad8-ea680c854e7b

The page slug can be anything. The shortcode reads tenant, tenant_id, and estimate_id from the URL.

== Configuration ==

Add these constants to wp-config.php, above the "That's all, stop editing" line:

define('INKONTAKT_ESTIMATE_SUPABASE_URL', 'https://your-project.supabase.co');
define('INKONTAKT_ESTIMATE_SUPABASE_SERVICE_KEY', 'your-service-role-or-api-key');

The key is used only server-side by PHP. Do not expose it in frontend JavaScript.

== Shortcode ==

[inkontakt_estimate_details]

== REST Endpoint ==

The plugin registers a PDF proxy endpoint:

/wp-json/inkontakt-estimate-details/v1/pdf

It is used internally for inline preview and download links.
