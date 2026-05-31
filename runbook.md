# Runbook — GitOps Demo con ArgoCD + kind + React

Este runbook cubre cada paso manual necesario para reproducir el demo desde cero en una máquina local con macOS (incluyendo Apple Silicon). Sigue las secciones en orden.

---

## 1. Prerequisitos

Instala las siguientes herramientas antes de comenzar. Todas están disponibles vía `brew`.

```bash
# Docker Desktop — motor de contenedores
# Descarga desde: https://www.docker.com/products/docker-desktop/
# Asegúrate de que Docker Desktop esté corriendo antes de continuar.

# Herramientas de CLI
brew install kubectl          # Cliente de Kubernetes
brew install kind             # Kubernetes IN Docker — clusters locales
brew install argocd           # CLI de ArgoCD

# Cuenta de GitHub
# Necesitas un repositorio PÚBLICO donde subir este proyecto.
# Si no tienes una cuenta, créala en https://github.com
```

Verifica que todo esté disponible:

```bash
docker info          # debe mostrar info del daemon, no un error
kubectl version --client
kind version
argocd version --client
```

---

## 2. Crear el cluster kind

```bash
# Crear el cluster local
kind create cluster --name argocd-demo

# Verificar que el contexto de kubectl apunte al cluster
kubectl cluster-info --context kind-argocd-demo
```

El cluster usa Docker como backend. No necesita una VM separada.

---

## 3. Instalar ArgoCD en el cluster

```bash
# Crear el namespace
kubectl create namespace argocd

# Aplicar los manifests oficiales de ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Esperar a que todos los pods estén Running (puede tardar 2–3 minutos)
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

Verifica el estado:

```bash
kubectl get pods -n argocd
# Todos deben mostrar STATUS: Running
```

---

## 4. Acceder a la UI de ArgoCD y obtener la contraseña inicial

```bash
# Port-forward del servidor de ArgoCD al puerto local 8080
# Deja este comando corriendo en una terminal separada
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

En otra terminal, obtén la contraseña inicial del admin:

```bash
argocd admin initial-password -n argocd
# Copia el password que aparece en la primera línea
```

Abre en el navegador: `https://localhost:8080`
- Usuario: `admin`
- Contraseña: la que copiaste arriba

> IMPORTANTE: Cambia la contraseña tras el primer inicio de sesión:
> **User Info → Update Password** en la UI, o via CLI:
>
> ```bash
> argocd account update-password \
>   --account admin \
>   --current-password <contraseña_inicial> \
>   --new-password <nueva_contraseña>
> ```

También puedes hacer login desde la CLI para usarla más adelante:

```bash
argocd login localhost:8080 --username admin --password <contraseña_inicial> --insecure
```

---

## 5. Construir la imagen Docker y cargarla en kind

La imagen debe construirse localmente y cargarse en el cluster kind porque kind no puede hacer pull desde registros externos de imagenes no autenticadas por defecto. NUNCA uses `:latest`.

```bash
# Desde la raíz del proyecto
docker build -t react-demo:v1.0.0 .

# Cargar la imagen en el cluster kind
kind load docker-image react-demo:v1.0.0 --name argocd-demo

# Verificar que la imagen está disponible en el cluster
docker exec argocd-demo-control-plane crictl images | grep react-demo
```

---

## 6. Crear el repositorio en GitHub y hacer push

1. Crea un repositorio **público** en GitHub (por ejemplo `argocd-react-demo`).
2. En la raíz del proyecto, inicializa git y haz push:

```bash
git init
git add .
git commit -m "feat: initial scaffold — React demo app for ArgoCD GitOps demo"
git branch -M main
git remote add origin https://github.com/<TU_USUARIO>/<TU_REPO>.git
git push -u origin main
```

3. Abre `argocd/argocd-app.yaml` y reemplaza el placeholder con la URL de tu repositorio:

```yaml
# Antes:
repoURL: <PLACEHOLDER_REPLACE_WITH_PUBLIC_GITHUB_URL>

# Después (ejemplo):
repoURL: https://github.com/tu-usuario/argocd-react-demo
```

4. Haz commit y push de ese cambio:

```bash
git add argocd/argocd-app.yaml
git commit -m "chore: set repoURL in ArgoCD Application manifest"
git push
```

---

## 7. Bootstrap — aplicar el CRD de ArgoCD y primer sync manual

Este paso es un **one-shot manual**. No forma parte del ciclo GitOps — es el bootstrapping inicial.

```bash
# Aplicar el Application CRD de ArgoCD
kubectl apply -f argocd/argocd-app.yaml
```

ArgoCD detectará el repositorio y calculará el estado deseado vs actual.
En la UI verás la aplicación `react-demo` en estado `OutOfSync`.

Para sincronizar manualmente:

```bash
# Via CLI
argocd app sync react-demo

# O via UI: Applications → react-demo → SYNC → SYNCHRONIZE
```

Verifica el resultado:

```bash
argocd app get react-demo
# Sync Status: Synced
# Health Status: Healthy

kubectl get pods -l app=react-demo
# NAME                          READY   STATUS    RESTARTS   AGE
# react-demo-XXXX-XXXXX         1/1     Running   0          Xm
```

---

## 8. Verificar la app en el navegador

El Service es de tipo `NodePort`. Hay dos formas de acceder:

**Opción A — kubectl port-forward (recomendado para demos):**

```bash
kubectl port-forward svc/react-demo 8081:80
# Abre: http://localhost:8081
```

**Opción B — NodePort directo:**

```bash
# Obtener el puerto asignado
kubectl get svc react-demo -o jsonpath='{.spec.ports[0].nodePort}'

# Obtener la IP del nodo kind
kubectl get nodes -o wide

# En Apple Silicon, kind corre dentro de Docker — puedes necesitar port-forward en lugar de IP directa
```

Deberías ver la tarjeta de la app con:
- Título: **React Demo**
- Versión: **v1.0.0**
- Badge: **Running on Kubernetes**

---

## 9. Demo 1 — Drift de réplicas (1 → 3)

Este demo ilustra la detección de drift por ArgoCD.

1. Edita `k8s/deployment.yaml` — cambia `replicas: 1` a `replicas: 3`.

2. Commit y push:

```bash
git add k8s/deployment.yaml
git commit -m "feat: scale react-demo to 3 replicas"
git push
```

3. En la UI de ArgoCD, espera hasta que el estado cambie a `OutOfSync` (puede tardar hasta 3 minutos por el polling por defecto, o haz click en **Refresh**).

4. Sincroniza manualmente:

```bash
argocd app sync react-demo
```

5. Verifica:

```bash
kubectl get pods -l app=react-demo
# Deben aparecer 3 pods en Running
```

---

## 10. Demo 2 — Version bump (v1.0.0 → v1.1.0)

Este demo ilustra el ciclo completo de GitOps con cambio de artefacto.

1. Edita `package.json` — cambia `"version": "1.0.0"` a `"version": "1.1.0"`.

2. Reconstruye la imagen con la nueva versión:

```bash
docker build -t react-demo:v1.1.0 .
```

3. Carga la imagen en kind:

```bash
kind load docker-image react-demo:v1.1.0 --name argocd-demo
```

4. Edita `k8s/deployment.yaml` — cambia el tag de la imagen:

```yaml
# Antes:
image: react-demo:v1.0.0

# Después:
image: react-demo:v1.1.0
```

5. Commit y push:

```bash
git add package.json k8s/deployment.yaml
git commit -m "feat: bump version to 1.1.0"
git push
```

6. En ArgoCD, espera el `OutOfSync` y sincroniza:

```bash
argocd app sync react-demo
```

7. Recarga el navegador — la tarjeta debe mostrar **v1.1.0**.

---

## 11. (Opcional) Habilitar auto-sync

> ADVERTENCIA: Habilita auto-sync SOLO después de que la imagen esté cargada en kind con `kind load`. Si auto-sync está activo pero la imagen no existe en el nodo, el pod entrará en `ErrImagePull` y el loop de auto-sync empeorará la situación.

Para habilitarlo, edita `argocd/argocd-app.yaml`:

```yaml
syncPolicy:
  automated:
    prune: true
    selfHeal: true
```

Haz commit, push, y aplica manualmente el CRD actualizado:

```bash
git add argocd/argocd-app.yaml
git commit -m "chore: enable auto-sync in ArgoCD Application"
git push
kubectl apply -f argocd/argocd-app.yaml
```

Desde este punto, ArgoCD sincronizará automáticamente cada vez que detecte drift.

---

## 12. Troubleshooting

### ErrImagePull / ImagePullBackOff

**Causa**: La imagen no está disponible en el nodo del cluster kind, o el tag en el manifest no coincide con la imagen cargada.

**Diagnóstico**:

```bash
kubectl describe pod <nombre-del-pod> -n default
# Busca el mensaje de error en la sección "Events"
```

**Solución**:

```bash
# 1. Verifica el tag exacto en k8s/deployment.yaml
grep image: k8s/deployment.yaml

# 2. Asegúrate de que la imagen existe localmente con ese tag exacto
docker images | grep react-demo

# 3. Recarga la imagen en kind (el comando exacto)
kind load docker-image react-demo:v1.0.0 --name argocd-demo

# 4. Fuerza un nuevo rollout del deployment
kubectl rollout restart deployment/react-demo
```

### Perpetual OutOfSync (ArgoCD no sincroniza bien)

**Causa A**: El `repoURL` en `argocd/argocd-app.yaml` es incorrecto o el repositorio es privado.

```bash
# Verifica la URL configurada
argocd app get react-demo | grep "Repo:"
# Debe coincidir exactamente con tu repo en GitHub (URL pública, sin .git al final es OK)
```

**Causa B**: El directorio `path: k8s` no existe o está vacío en el repositorio.

```bash
# Verifica que el push llegó a GitHub
git log --oneline origin/main
# Verifica que k8s/ existe en el repo remoto en GitHub
```

**Causa C**: ArgoCD no puede acceder al repositorio (timeout de red).

```bash
argocd repo list
# Si el status no es "Successful", borra y vuelve a agregar el repo
argocd repo rm https://github.com/<tu-repo>
argocd repo add https://github.com/<tu-repo>
```

### UI de ArgoCD no accesible (localhost:8080 no responde)

**Causa**: El port-forward expiró (se cierra automáticamente tras inactividad o si el pod se reinicia).

**Solución**: Vuelve a ejecutar:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Si el pod de argocd-server no está Running:

```bash
kubectl get pods -n argocd
kubectl describe pod <argocd-server-pod> -n argocd
```

### Conflicto de puertos (port-forward falla con "address already in use")

```bash
# Encuentra el proceso que ocupa el puerto
lsof -i :8080
# O para el puerto de la app
lsof -i :8081

# Mata el proceso (sustituye PID por el número que aparece)
kill -9 <PID>
```

### Apple Silicon — problemas de plataforma (linux/amd64 vs linux/arm64)

El `Dockerfile` usa `--platform=$BUILDPLATFORM` en la etapa de build para respetar la arquitectura del host. La imagen nginx:alpine es multi-arch y funciona en arm64 sin emulación.

Si ves advertencias de emulación o errores de QEMU:

```bash
# Fuerza la construcción para la plataforma nativa
docker build --platform linux/arm64 -t react-demo:v1.0.0 .

# Carga la imagen resultante
kind load docker-image react-demo:v1.0.0 --name argocd-demo
```

### El NodePort no es accesible directamente en Apple Silicon

En macOS con Apple Silicon, kind corre dentro del network stack de Docker y la IP del nodo kind puede no ser directamente accesible desde el host. Usa `kubectl port-forward` como método principal:

```bash
kubectl port-forward svc/react-demo 8081:80
# Abre http://localhost:8081
```

### Limpiar el entorno

```bash
# Eliminar el cluster kind y todos sus recursos
kind delete cluster --name argocd-demo

# Eliminar las imágenes locales (opcional)
docker rmi react-demo:v1.0.0 react-demo:v1.1.0
```
