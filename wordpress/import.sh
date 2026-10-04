#!/bin/sh
# Import site/src/data/catalogue.json into WooCommerce. Trial run: LIMIT=50 ./import.sh
cd "$(dirname "$0")"
docker compose run --rm -T -e LIMIT="${LIMIT:-0}" wpcli wp eval-file /import/import-products.php
