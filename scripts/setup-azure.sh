#!/bin/bash
# Crea todos los recursos de Azure necesarios para el proyecto
# Requiere: az CLI instalado y autenticado (az login)

RESOURCE_GROUP="rg-blue-green-demo"
LOCATION="eastus"
APP_SERVICE_PLAN="plan-blue-green"
APP_NAME="miapp"              # ← cambia por un nombre único en Azure

echo "=== Setup Blue-Green Deployment en Azure ==="

# 1. Resource Group
echo "[1/5] Creando Resource Group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"

# 2. App Service Plan (mínimo Standard S1 para usar slots)
echo "[2/5] Creando App Service Plan (Standard S1)..."
az appservice plan create \
  --name "$APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --sku S1 \
  --is-linux

# 3. Web App (slot de producción = slot principal)
echo "[3/5] Creando Web App (slot producción)..."
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --runtime "NODE:18-lts"

# 4. Configurar variables de producción
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    DEPLOYMENT_COLOR=blue \
    NODE_ENV=production

# 5. Slot de staging (slot verde)
echo "[4/5] Creando slot staging..."
az webapp deployment slot create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --slot staging \
  --configuration-source "$APP_NAME"

# Configurar variables del slot staging
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --slot staging \
  --settings \
    DEPLOYMENT_COLOR=green \
    NODE_ENV=staging

echo "[5/5] Generando credenciales para GitHub Actions..."
az ad sp create-for-rbac \
  --name "sp-blue-green-deploy" \
  --role contributor \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/$RESOURCE_GROUP" \
  --sdk-auth

echo ""
echo "=== LISTO ==="
echo "Copia el JSON de arriba y guárdalo en GitHub Secrets como:"
echo "  AZURE_CREDENTIALS"
echo "  AZURE_RESOURCE_GROUP = $RESOURCE_GROUP"
echo ""
echo "URLs:"
echo "  Producción : https://$APP_NAME.azurewebsites.net"
echo "  Staging    : https://$APP_NAME-staging.azurewebsites.net"
