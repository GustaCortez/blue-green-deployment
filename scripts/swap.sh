#!/bin/bash
# Swap manual: staging → producción (o rollback)
# Uso: ./scripts/swap.sh [rollback]

RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-mi-resource-group}"
APP_NAME="${AZURE_WEBAPP_NAME:-miapp}"

if [ "$1" = "rollback" ]; then
  echo "Ejecutando ROLLBACK (re-swap)..."
else
  echo "Ejecutando SWAP: staging → producción..."
fi

az webapp deployment slot swap \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APP_NAME" \
  --slot staging \
  --target-slot production

if [ $? -eq 0 ]; then
  echo "Swap completado exitosamente"
  echo "URL producción: https://$APP_NAME.azurewebsites.net"
else
  echo "ERROR: el swap falló"
  exit 1
fi
