<?php
// One-off for the first import (made before _empire_label existed): recompute each variation's
// unique attribute value the way import-products.php does and store the supplier's label on it.
$cat = json_decode(file_get_contents('/import/data/catalogue.json'), true);
global $wpdb;
$map = $wpdb->get_results("SELECT meta_value k, post_id FROM {$wpdb->postmeta} WHERE meta_key='_empire_id'", OBJECT_K);
$n = 0; $miss = 0;
foreach ($cat['families'] as $f) {
    $byOpt = [];
    foreach (get_posts(['post_type' => 'product_variation', 'post_parent' => (int) $map[$f['id']]->post_id, 'numberposts' => -1, 'fields' => 'ids', 'post_status' => 'any']) as $vid)
        $byOpt[get_post_meta($vid, 'attribute_option', true)] = $vid;
    $seen = [];
    foreach ($f['variants'] as $v) {
        $label = $v['label'] ?? ($v['size'] ?? ($v['code'] ?? ''));
        if ($label === '') $label = 'Standard';
        $base = $label; $i = 2;
        while (isset($seen[$label])) $label = $base . ' (' . $i++ . ')';
        $seen[$label] = 1;
        $vid = $byOpt[$label] ?? $byOpt[sanitize_title($label)] ?? null;
        if (!$vid) { $miss++; continue; }
        isset($v['label']) ? update_post_meta($vid, '_empire_label', $v['label']) : delete_post_meta($vid, '_empire_label');
        $n++;
    }
}
echo "$n variations, $miss unmatched\n";
