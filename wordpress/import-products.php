<?php
// Imports site/src/data/catalogue.json into WooCommerce. Run via ./import.sh. Safe to re-run:
// each family is matched on meta _empire_id and updated, not duplicated.
// Images come from the local files in site/public (stand-in; later import originals from the workbook links).
if (!defined('ABSPATH')) exit;
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
set_time_limit(0);
wp_defer_term_counting(true);

$cat   = json_decode(file_get_contents('/import/data/catalogue.json'), true);
$limit = (int) getenv('LIMIT');

// 1. Categories: department > category > sub. Term slugs are path-joined (plain slugs collide across
// departments); the site's own slug is kept in term meta empire_slug.
$terms = [];
$term = function ($path, $name, $parent) use (&$terms) {
    $key = implode('-', $path);
    if (isset($terms[$key])) return $terms[$key];
    $t = term_exists($key, 'product_cat') ?: wp_insert_term($name, 'product_cat', ['slug' => $key, 'parent' => $parent]);
    if (is_wp_error($t)) { fwrite(STDERR, "term $key: " . $t->get_error_message() . "\n"); return 0; }
    $id = (int) $t['term_id'];
    update_term_meta($id, 'empire_slug', end($path));
    return $terms[$key] = $id;
};
foreach ($cat['departments'] as $d) {
    $dId = $term([$d['slug']], $d['name'], 0);
    foreach ($d['categories'] as $c) {
        $cId = $term([$d['slug'], $c['slug']], $c['name'], $dId);
        foreach ($c['subs'] ?? [] as $s) $term([$d['slug'], $c['slug'], $s['slug']], $s['name'], $cId);
    }
}
$leaf = function ($dept, $cat, $sub) use (&$terms) {
    $key = implode('-', array_filter([$dept, $cat, $sub]));
    return $terms[$key] ?? null;
};

// 2. Brands (WooCommerce's product_brand taxonomy, WC 9.6+).
$brandOk = taxonomy_exists('product_brand');
$brandIds = [];

// 3. Images: one attachment per file, reused when a file is shared.
$attached = [];
$sideload = function ($web) use (&$attached) {
    if (isset($attached[$web])) return $attached[$web];
    $existing = get_posts(['post_type' => 'attachment', 'meta_key' => '_empire_src', 'meta_value' => $web, 'fields' => 'ids', 'numberposts' => 1]);
    if ($existing) return $attached[$web] = $existing[0];
    $src = '/import/public' . $web;
    if (!is_file($src)) return $attached[$web] = 0;
    $tmp = wp_tempnam($src);
    copy($src, $tmp);
    $id = media_handle_sideload(['name' => basename($src), 'tmp_name' => $tmp], 0);
    if (is_wp_error($id)) { @unlink($tmp); fwrite(STDERR, "image $web: " . $id->get_error_message() . "\n"); return $attached[$web] = 0; }
    update_post_meta($id, '_empire_src', $web);
    return $attached[$web] = $id;
};

// 4. Products: one variable product per family, one variation per size/code.
global $wpdb;
$known = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key='_empire_id'", OBJECT_K);
$byEmpire = [];
foreach ($known as $row) $byEmpire[$row->meta_value] = (int) $row->post_id;

$n = 0; $made = 0; $skus = 0; $noimg = 0;
foreach ($cat['families'] as $f) {
    if ($limit && $n >= $limit) break;
    $n++;
    $pid = $byEmpire[$f['id']] ?? 0;
    $p = new WC_Product_Variable($pid);
    $p->set_name($f['name']);
    $p->set_slug($f['slug']);
    $p->set_status('publish');
    $p->set_catalog_visibility('visible');

    $labels = []; $variants = [];
    foreach ($f['variants'] as $v) {
        $label = $v['label'] ?? ($v['size'] ?? ($v['code'] ?? ''));
        if ($label === '') $label = 'Standard';
        $base = $label; $i = 2;
        while (isset($labels[$label])) $label = $base . ' (' . $i++ . ')';
        $labels[$label] = 1;
        $variants[] = [$label, $v];
    }
    $attr = new WC_Product_Attribute();
    $attr->set_name('Option');
    $attr->set_options(array_keys($labels));
    $attr->set_visible(true);
    $attr->set_variation(true);
    $p->set_attributes([$attr]);

    $cats = array_filter([$leaf($f['dept'], $f['cat'], $f['sub'] ?? ''), $leaf($f['dept'], $f['cat'], '')]);
    foreach ($f['also'] ?? [] as $a) { if ($t = $leaf($a[0], $a[1], $a[2] ?? '')) $cats[] = $t; }
    $p->set_category_ids(array_values(array_unique($cats)));

    if (!empty($f['image'])) {
        $img = $sideload($f['image']);
        if ($img) $p->set_image_id($img); else $noimg++;
    }
    $pid = $p->save();
    $made++;

    update_post_meta($pid, '_empire_id', $f['id']);
    foreach (['tier', 'range', 'powerSource', 'supplier'] as $k) if (!empty($f[$k])) update_post_meta($pid, '_empire_' . $k, $f[$k]);
    if (!empty($f['aka'])) update_post_meta($pid, '_empire_aka', $f['aka']);
    update_post_meta($pid, '_empire_home', wp_json_encode([$f['dept'], $f['cat'], $f['sub'] ?? '']));
    update_post_meta($pid, '_empire_also', wp_json_encode($f['also'] ?? []));
    update_post_meta($pid, '_empire_brandSlug', $f['brandSlug']);
    update_post_meta($pid, '_empire_rows', wp_json_encode($f['rows']));
    if (!empty($f['imageUrl'])) update_post_meta($pid, '_empire_imageUrl', $f['imageUrl']);
    if ($brandOk) wp_set_object_terms($pid, [$f['brand']], 'product_brand');

    // variations: reuse existing ones by SKU or label, drop the rest
    $have = [];
    foreach ($p->get_children() as $cid) $have[$cid] = wc_get_product($cid);
    foreach ($variants as [$label, $v]) {
        $var = null;
        foreach ($have as $cid => $c) {
            if (($c->get_attributes()['option'] ?? null) === sanitize_title($label) || ($c->get_attributes()['option'] ?? null) === $label) { $var = $c; unset($have[$cid]); break; }
        }
        $var = $var ?: new WC_Product_Variation();
        $var->set_parent_id($pid);
        $var->set_attributes(['option' => $label]);
        $var->set_status('publish');
        $var->set_stock_status('instock');
        if (!empty($v['code'])) { try { $var->set_sku($v['code']); $skus++; } catch (Exception $e) { fwrite(STDERR, "sku {$v['code']}: " . $e->getMessage() . "\n"); } }
        $vid = $var->save();
        // the supplier's own label (the attribute value above must be unique, so it can differ)
        isset($v['label']) ? update_post_meta($vid, '_empire_label', $v['label']) : delete_post_meta($vid, '_empire_label');
        foreach (['size', 'packQty', 'details', 'prePacked', 'supplierCode', 'statedVariants'] as $k)
            if (isset($v[$k])) update_post_meta($vid, '_empire_' . $k, is_bool($v[$k]) ? (int) $v[$k] : $v[$k]);
    }
    foreach ($have as $cid => $c) $c->delete(true);
    WC_Product_Variable::sync($pid);

    if ($n % 100 === 0) { echo "$n families\n"; wp_cache_flush(); }
}
wp_defer_term_counting(false);
echo "done: $made families, $skus SKUs, $noimg images missing on disk\n";
