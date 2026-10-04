<?php
/**
 * Plugin Name: Empire Core
 * Description: Read-only catalogue endpoint for the Next.js front end: GET /wp-json/empire/v1/catalogue.
 * Returns every published product as a family (variations, categories, brand, image) in one response.
 * Later: enquiry endpoint and revalidate-on-publish hook live here too.
 */
add_action('rest_api_init', function () {
    register_rest_route('empire/v1', '/catalogue', [
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            global $wpdb;
            $ids = get_posts(['post_type' => 'product', 'post_status' => 'publish', 'numberposts' => -1,
                'fields' => 'ids', 'orderby' => 'ID', 'order' => 'ASC', 'no_found_rows' => true]);
            update_meta_cache('post', $ids);
            update_object_term_cache($ids, 'product');

            // variations in one query, in creation order
            $vars = get_posts(['post_type' => 'product_variation', 'post_status' => 'publish', 'numberposts' => -1,
                'post_parent__in' => $ids, 'orderby' => 'ID', 'order' => 'ASC', 'no_found_rows' => true]);
            update_meta_cache('post', wp_list_pluck($vars, 'ID'));
            $byParent = [];
            foreach ($vars as $v) $byParent[$v->post_parent][] = $v->ID;

            $meta = fn($id, $k) => get_post_meta($id, $k, true);
            $json = fn($id, $k) => json_decode($meta($id, $k) ?: '[]', true);
            $families = [];
            foreach ($ids as $id) {
                $post = get_post($id);
                $home = $json($id, '_empire_home');
                $brandTerms = get_the_terms($id, 'product_brand');
                $brand = $brandTerms && !is_wp_error($brandTerms) ? $brandTerms[0] : null;
                $f = [
                    'id' => $meta($id, '_empire_id'),
                    'slug' => $post->post_name,
                    'name' => $post->post_title,
                    'brand' => $brand ? $brand->name : '',
                    'brandSlug' => $meta($id, '_empire_brandSlug'),
                    'supplier' => $meta($id, '_empire_supplier'),
                    'dept' => $home[0] ?? '', 'cat' => $home[1] ?? '',
                ];
                if (!empty($home[2])) $f['sub'] = $home[2];
                if ($also = $json($id, '_empire_also')) $f['also'] = $also;
                if ($aka = $meta($id, '_empire_aka')) $f['aka'] = $aka;
                $f['tier'] = $meta($id, '_empire_tier') ?: 'B';
                if ($thumb = get_post_thumbnail_id($id)) {
                    $m = wp_get_attachment_metadata($thumb);
                    $f['image'] = wp_get_attachment_url($thumb);
                    if (!empty($m['width'])) $f['imageSize'] = [(int) $m['width'], (int) $m['height']];
                }
                if ($u = $meta($id, '_empire_imageUrl')) $f['imageUrl'] = $u;
                if ($r = $meta($id, '_empire_range')) $f['range'] = $r;
                if ($p = $meta($id, '_empire_powerSource')) $f['powerSource'] = $p;
                $f['variants'] = [];
                foreach ($byParent[$id] ?? [] as $vid) {
                    $v = [];
                    if ($sku = get_post_meta($vid, '_sku', true)) $v['code'] = $sku;
                    $size = $meta($vid, '_empire_size');
                    if (($label = $meta($vid, '_empire_label')) !== '') $v['label'] = $label;
                    if ($size !== '') $v['size'] = $size;
                    foreach (['packQty', 'statedVariants'] as $k) if (($x = $meta($vid, '_empire_' . $k)) !== '') $v[$k] = (int) $x;
                    if ($meta($vid, '_empire_prePacked') !== '') $v['prePacked'] = (bool) $meta($vid, '_empire_prePacked');
                    foreach (['details', 'supplierCode'] as $k) if (($x = $meta($vid, '_empire_' . $k)) !== '') $v[$k] = $x;
                    $f['variants'][] = $v;
                }
                $f['rows'] = $json($id, '_empire_rows');
                $families[] = $f;
            }

            $cats = [];
            foreach (get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false, 'orderby' => 'term_id']) as $t) {
                if ($t->slug === 'uncategorized') continue;
                $cats[] = ['id' => $t->term_id, 'parent' => $t->parent, 'name' => html_entity_decode($t->name, ENT_QUOTES),
                    'slug' => get_term_meta($t->term_id, 'empire_slug', true) ?: $t->slug];
            }
            return ['categories' => $cats, 'families' => $families];
        },
    ]);
});

// Tell the front end to refresh when a product is added, changed or removed. Needs EMPIRE_REVALIDATE_URL and
// EMPIRE_REVALIDATE_SECRET in wp-config.php; does nothing without them. At most one call every 10 seconds,
// so a bulk import does not flood the site. The call waits at most 1 second (a non-blocking call is dropped when WP-CLI exits) and a failure never breaks the save.
foreach (['woocommerce_new_product', 'woocommerce_update_product', 'woocommerce_delete_product', 'woocommerce_trash_product'] as $hook) {
    add_action($hook, function () {
        if (!defined('EMPIRE_REVALIDATE_URL') || !defined('EMPIRE_REVALIDATE_SECRET') || get_transient('empire_revalidate_sent')) return;
        set_transient('empire_revalidate_sent', 1, 10);
        add_action('shutdown', function () {
            wp_remote_post(EMPIRE_REVALIDATE_URL, ['blocking' => true, 'timeout' => 1, 'headers' => ['x-revalidate-secret' => EMPIRE_REVALIDATE_SECRET]]);
        });
    });
}
