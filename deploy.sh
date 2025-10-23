#!/bin/bash

# Script de build e deploy do ms-xml-importer para Azure Kubernetes Service (AKS)

set -e

# Variáveis
ACR_NAME="lazarusacr"
IMAGE_NAME="ms-xml-importer"
TAG="latest"
FULL_IMAGE_NAME="${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${TAG}"

echo "🚀 Iniciando deploy do ms-xml-importer..."

# 1. Build da imagem Docker
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

# 2. Tag da imagem para o ACR
echo "🏷️  Tagging image for ACR..."
docker tag ${IMAGE_NAME}:${TAG} ${FULL_IMAGE_NAME}

# 3. Login no Azure Container Registry
echo "🔐 Logging in to Azure Container Registry..."
az acr login --name ${ACR_NAME}

# 4. Push da imagem para o ACR
echo "⬆️  Pushing image to ACR..."
docker push ${FULL_IMAGE_NAME}

# 5. Aplicar deployment no Kubernetes
echo "☸️  Deploying to Kubernetes..."
kubectl apply -f xml-importer-deployment.yaml

# 6. Verificar status do deployment
echo "✅ Checking deployment status..."
kubectl rollout status deployment/ms-xml-importer

# 7. Listar pods
echo "📋 Listing pods..."
kubectl get pods -l app=ms-xml-importer

# 8. Listar services
echo "🌐 Listing services..."
kubectl get services -l app=ms-xml-importer

echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "Para verificar os logs:"
echo "  kubectl logs -f deployment/ms-xml-importer"
echo ""
echo "Para verificar o status:"
echo "  kubectl get pods -l app=ms-xml-importer"

