# 🚀 Deploy do ms-xml-importer no Azure Kubernetes Service (AKS)

## 📋 Pré-requisitos

- Docker instalado
- Azure CLI instalado e autenticado
- kubectl configurado para o cluster AKS
- Acesso ao Azure Container Registry (lazarusacr)

---

## 📦 Arquivos Criados

### 1. **Dockerfile**
- Baseado no Node.js 18 Alpine
- Instala dependências do Prisma
- Gera Prisma Client
- Expõe porta 3010
- Health check configurado

### 2. **xml-importer-deployment.yaml**
- Deployment com 2 réplicas
- Service ClusterIP na porta 80
- Variáveis de ambiente configuradas
- Probes de liveness e readiness
- Volume para uploads

### 3. **deploy.sh**
- Script automatizado de build e deploy
- Faz build da imagem
- Push para o ACR
- Aplica deployment no Kubernetes

### 4. **.dockerignore**
- Ignora node_modules e arquivos desnecessários

---

## 🔧 Configuração

### Variáveis de Ambiente

As seguintes variáveis estão configuradas no deployment:

```yaml
PORT: "3010"
NODE_ENV: "production"
DATABASE_URL: "postgresql://lazarus:Yr6fhese@lazarus-dbsql.postgres.database.azure.com:5432/postgres?sslmode=require"
MS_PATIENTS_URL: "http://patients-service/api/v1"
MS_PROCEDURES_URL: "http://procedures-service/api/v1"
```

⚠️ **Importante:** Verifique se os nomes dos serviços (`patients-service` e `procedures-service`) estão corretos no seu cluster.

---

## 🚀 Deploy Automático

Execute o script de deploy:

```bash
./deploy.sh
```

O script irá:
1. ✅ Build da imagem Docker
2. ✅ Tag para o ACR
3. ✅ Login no ACR
4. ✅ Push da imagem
5. ✅ Deploy no Kubernetes
6. ✅ Verificar status

---

## 🔨 Deploy Manual

### 1. Build da imagem

```bash
docker build -t ms-xml-importer:latest .
```

### 2. Tag para o ACR

```bash
docker tag ms-xml-importer:latest lazarusacr.azurecr.io/ms-xml-importer:latest
```

### 3. Login no ACR

```bash
az acr login --name lazarusacr
```

### 4. Push da imagem

```bash
docker push lazarusacr.azurecr.io/ms-xml-importer:latest
```

### 5. Deploy no Kubernetes

```bash
kubectl apply -f xml-importer-deployment.yaml
```

---

## ✅ Verificação

### Verificar pods

```bash
kubectl get pods -l app=ms-xml-importer
```

**Resultado esperado:**
```
NAME                                READY   STATUS    RESTARTS   AGE
ms-xml-importer-xxxxxxxxxx-xxxxx    1/1     Running   0          30s
ms-xml-importer-xxxxxxxxxx-xxxxx    1/1     Running   0          30s
```

### Verificar service

```bash
kubectl get services -l app=ms-xml-importer
```

**Resultado esperado:**
```
NAME                  TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
xml-importer-service  ClusterIP   10.0.xxx.xxx   <none>        80/TCP    30s
```

### Verificar logs

```bash
kubectl logs -f deployment/ms-xml-importer
```

### Testar health check

```bash
kubectl port-forward service/xml-importer-service 3010:80
curl http://localhost:3010/health
```

---

## 🌐 Expor o Serviço

### Opção 1: Ingress (Recomendado)

Adicione uma regra no Ingress NGINX:

```yaml
- path: /xml-importer
  pathType: Prefix
  backend:
    service:
      name: xml-importer-service
      port:
        number: 80
```

### Opção 2: LoadBalancer (Desenvolvimento)

Altere o tipo do service para LoadBalancer:

```yaml
spec:
  type: LoadBalancer
```

---

## 🔄 Atualizar Deployment

### Rebuild e redeploy

```bash
./deploy.sh
```

### Forçar restart dos pods

```bash
kubectl rollout restart deployment/ms-xml-importer
```

### Rollback para versão anterior

```bash
kubectl rollout undo deployment/ms-xml-importer
```

---

## 📊 Monitoramento

### Ver status do deployment

```bash
kubectl rollout status deployment/ms-xml-importer
```

### Ver eventos

```bash
kubectl get events --sort-by='.lastTimestamp' | grep ms-xml-importer
```

### Descrever pod

```bash
kubectl describe pod -l app=ms-xml-importer
```

---

## 🐛 Troubleshooting

### Pods não iniciam

```bash
kubectl describe pod -l app=ms-xml-importer
kubectl logs -l app=ms-xml-importer
```

### Erro de conexão com banco de dados

Verifique se a `DATABASE_URL` está correta no deployment.

### Erro ao conectar com outros microsserviços

Verifique se os nomes dos serviços estão corretos:
- `patients-service`
- `procedures-service`

Liste os serviços:

```bash
kubectl get services
```

---

## 📝 Notas

- **Porta:** 3010 (interna no container)
- **Service:** Expõe na porta 80
- **Réplicas:** 2 (alta disponibilidade)
- **Resources:** 256Mi-512Mi RAM, 250m-500m CPU
- **Health Check:** `/health` endpoint

---

## 🎯 Próximos Passos

1. ✅ Configurar Ingress para expor o serviço
2. ✅ Configurar autoscaling (HPA)
3. ✅ Configurar persistent volume para uploads (se necessário)
4. ✅ Configurar monitoring (Prometheus/Grafana)
5. ✅ Configurar alertas

---

## 📞 Suporte

Para problemas ou dúvidas:
- Verificar logs: `kubectl logs -f deployment/ms-xml-importer`
- Verificar eventos: `kubectl get events`
- Verificar status: `kubectl get pods -l app=ms-xml-importer`

