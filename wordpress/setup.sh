#!/bin/sh
# One-time: install WordPress and WooCommerce in the local container. Safe to re-run.
cd "$(dirname "$0")"
wp() { docker compose run --rm -T wpcli wp "$@"; }
docker compose up -d --wait db wordpress
until wp core version >/dev/null 2>&1; do sleep 2; done
wp core is-installed 2>/dev/null || wp core install --url=http://localhost:8088 \
  --title="Empire Solar & Hardware (local)" --admin_user=admin --admin_password=admin \
  --admin_email=dev@example.test --skip-email
wp plugin install woocommerce --activate
wp config set EMPIRE_REVALIDATE_URL http://host.docker.internal:3100/api/revalidate --type=constant
wp config set EMPIRE_REVALIDATE_SECRET local-dev-secret --type=constant
wp rewrite structure '/%postname%/' --hard
wp option update woocommerce_manage_stock no
wp option update woocommerce_enable_reviews no
wp option update woocommerce_calc_taxes no
echo "WordPress ready: http://localhost:8088/wp-admin (admin / admin, local only)"
