#!/bin/bash
# Script para crear logos placeholder SVG para ALTORRA CARS
# Colores: --primary-gold: #b89658, --primary-brown: #916652

BRANDS=("chevrolet" "nissan" "renault" "kia" "mazda" "toyota" "hyundai" "ford" "honda" "mitsubishi" "volkswagen" "suzuki" "fiat" "jeep" "peugeot" "subaru" "volvo" "byd" "mercedes-benz" "bmw" "audi")

# Colores ALTORRA
GOLD="#b89658"
BROWN="#916652"
DARK="#1d1b19"

for brand in "${BRANDS[@]}"; do
  # Convertir a mayúsculas para display
  display_name=$(echo "$brand" | tr '[:lower:]' '[:upper:]' | sed 's/-/ /g')

  cat > "/home/user/altorracars.github.io/multimedia/brands/${brand}.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <defs>
    <linearGradient id="grad-${brand}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${GOLD};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${BROWN};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="40" cy="40" r="28" fill="url(#grad-${brand})" opacity="0.1"/>

  <!-- Car icon simple -->
  <path d="M 25 35 L 30 30 L 50 30 L 55 35 L 55 45 L 25 45 Z" fill="url(#grad-${brand})"/>
  <circle cx="32" cy="46" r="4" fill="${DARK}"/>
  <circle cx="48" cy="46" r="4" fill="${DARK}"/>

  <!-- Brand name -->
  <text x="70" y="45" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${DARK}">${display_name}</text>
</svg>
EOF

  echo "Created ${brand}.svg"
done

echo "All 21 brand logos created successfully!"
