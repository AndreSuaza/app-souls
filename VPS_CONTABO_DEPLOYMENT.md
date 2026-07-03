# Documentacion de despliegue en VPS Contabo

Ultima actualizacion: 2026-06-26

## Servidor

- Proveedor: Contabo
- IP publica: `209.145.63.84`
- Hostname: `vmi3400422`
- Sistema operativo: Ubuntu 24.04.4 LTS
- Ruta principal de la app: `/opt/apps/app-souls`
- Usuario de despliegue: `deploy`
- Llave SSH local: `C:\Users\sebsi\.ssh\codex_contabo`
- Dominio principal: `https://soulsinxtinction.com`
- Dominio con www: `https://www.soulsinxtinction.com`

## Acceso SSH

Entrar como `deploy`:

```powershell
ssh -i "$env:USERPROFILE\.ssh\codex_contabo" deploy@209.145.63.84
```

Entrar como `root` solo para administracion de emergencia:

```powershell
ssh -i "$env:USERPROFILE\.ssh\codex_contabo" root@209.145.63.84
```

El login SSH por contraseña quedo desactivado. `root` solo puede entrar por llave SSH.

## Configuracion realizada

- Se actualizaron paquetes del sistema.
- Se creo el usuario `deploy` con permisos `sudo`.
- Se instalo la llave SSH compartida para `root` y `deploy`.
- Se instalaron paquetes base: `git`, `curl`, `nginx`, `ufw`, `fail2ban`, `build-essential`, `unzip`, `htop`, `logrotate`.
- Se instalo Node.js `v22.23.1` desde NodeSource.
- Se instalo PM2 `7.0.1`.
- Se activo UFW con:
  - OpenSSH
  - Nginx Full (`80`, `443`)
- Se activaron servicios:
  - `nginx`
  - `fail2ban`
  - `pm2-deploy`
- Se agrego swap de 2 GB en `/swapfile`.
- Se agregaron reglas base anti-abuso de Nginx en `/etc/nginx/conf.d/souls-rate-limit.conf`.
- Se configuro el reverse proxy de la app en `/etc/nginx/sites-available/app-souls`.
- Se configuro Nginx para `soulsinxtinction.com` y `www.soulsinxtinction.com`.
- Se instalo Certbot y certificado Let's Encrypt para HTTPS.

## Estado actual de app-souls

La app fue desplegada desde:

```text
https://github.com/AndreSuaza/app-souls.git
```

Commit desplegado:

```text
cc31946 fix(boveda): restore product cards section
```

La app corre en:

```text
127.0.0.1:3000
```

Nginx la expone por HTTP en:

```text
https://soulsinxtinction.com/
```

PM2 usa este archivo:

```text
/opt/apps/app-souls/ecosystem.config.cjs
```

PM2 quedo bajo systemd, por lo que `pm2-deploy` debe levantar la app despues de reiniciar la VPS.

## Punto critico: base de datos de produccion

La base de datos correcta para produccion es `six2`.

El `.env` de la VPS fue actualizado y normalizado a UTF-8 sin BOM para que `DATABASE_URL` cargue correctamente apuntando a `six2`.

Tambien se actualizo:

```env
NEXTAUTH_URL=https://soulsinxtinction.com
AUTH_TRUST_HOST=true
```

`AUTH_TRUST_HOST=true` es necesario porque Auth.js corre detras de Cloudflare/Nginx. Sin esa variable, Auth.js rechaza `soulsinxtinction.com` con `UntrustedHost` y puede romper `/auth/login` o `/api/auth/session`.

Regla operativa:

- Con `DATABASE_URL` apuntando a `six2`, no se deben ejecutar migraciones, seeds, scripts de mantenimiento ni comandos que escriban en base de datos.
- Solo se permiten cambios de configuracion/despliegue y lecturas necesarias.
- Si se requiere modificar datos, primero hay que confirmar explicitamente el alcance.

## Comandos utiles

Ver estado de la app:

```bash
pm2 status
systemctl is-active pm2-deploy
```

Ver logs:

```bash
pm2 logs app-souls
```

Reiniciar la app:

```bash
cd /opt/apps/app-souls
pm2 restart app-souls
```

Redeploy desde `main` del remoto configurado:

```bash
cd /opt/apps/app-souls
git fetch origin main
git checkout main
git reset --hard origin/main
npm ci
NEXT_TELEMETRY_DISABLED=1 npm run build
pm2 restart app-souls
pm2 save
```

Revisar Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/app-souls.access.log
sudo tail -f /var/log/nginx/app-souls.error.log
```

## Reglas anti-bot actuales

Nginx bloquea herramientas simples por User-Agent, por ejemplo:

```text
curl, wget, python-requests, scrapy, httpclient, masscan, nikto, sqlmap, zgrab
```

Por eso `curl http://209.145.63.84/` devuelve `403`. Con User-Agent tipo navegador devuelve `200`.

Rate limits actuales:

- Rutas publicas generales: `10r/s` por IP, burst `40`.
- `/boveda`: `2r/s` por IP, burst `8`.
- `/auth/login`: `5r/m` por IP, burst `5`.
- Limite de conexiones: `30` conexiones concurrentes por IP.

Estas reglas son una primera capa. No reemplazan Cloudflare WAF ni proteccion anti-bots avanzada.

## Verificacion realizada

El build de Next termino correctamente en la VPS.

Observaciones importantes del build:

- `/boveda`: dinamica, First Load JS `170 kB`.
- `/boveda/[id]`: dinamica, First Load JS `183 kB`.
- Middleware: `84.1 kB`.

Pruebas realizadas:

```bash
curl -I http://127.0.0.1:3000/
curl -I -A "Mozilla/5.0 CodexCheck" http://127.0.0.1/
curl -I -A "Mozilla/5.0 CodexCheck" http://209.145.63.84/
curl -I -A "Mozilla/5.0 CodexCheck" http://209.145.63.84/boveda
```

Resultado:

- `/` respondio `200 OK`.
- `/boveda` respondio `200 OK`.
- `curl` sin User-Agent de navegador fue bloqueado con `403 Forbidden`, como se esperaba.

## Pendientes antes de produccion final

1. Cambiar `DATABASE_URL` de la VPS para que apunte a `six2`.
2. Confirmar `NEXTAUTH_URL=https://soulsinxtinction.com`.
3. Confirmar callbacks OAuth de Google/Discord para el dominio final.
4. Apuntar `soulsinxtinction.com` y `www.soulsinxtinction.com` a `209.145.63.84`.
5. Poner Cloudflare delante del dominio.
6. Configurar SSL en la VPS o usar certificado de origen de Cloudflare.
7. Afinar reglas Cloudflare/Nginx para `/boveda` y `/boveda/*`.
8. Decidir si el despliegue final saldra desde `AndreSuaza/app-souls` o desde `Souls-TCG/app-souls`.
9. Agregar monitoreo basico de CPU, RAM, disco y logs.

## Vinculacion con soulsinxtinction.com

Estado actual:

- Cloudflare esta activo para el dominio.
- Nameservers activos:
  - `clayton.ns.cloudflare.com`
  - `emma.ns.cloudflare.com`
- El dominio ya resuelve a IPs de Cloudflare.
- HTTPS funciona con certificado Let's Encrypt en la VPS.
- HTTP redirige a HTTPS.

Registros DNS esperados en Cloudflare:

```text
Tipo: A
Nombre: @
Contenido: 209.145.63.84
Proxy: Activado
TTL: Auto
```

```text
Tipo: CNAME
Nombre: www
Contenido: soulsinxtinction.com
Proxy: Activado
TTL: Auto
```

```text
Tipo: CNAME
Nombre: www
Contenido: soulsinxtinction.com
Proxy: Activado
TTL: Auto
```

Configuracion recomendada en Cloudflare:

```text
SSL/TLS mode: Full (strict)
```

Como ya existe certificado valido en la VPS, `Full (strict)` es correcto. No usar `Flexible`.

Nginx usa:

```nginx
server_name soulsinxtinction.com www.soulsinxtinction.com;
```

Certificado instalado:

```text
/etc/letsencrypt/live/soulsinxtinction.com/fullchain.pem
/etc/letsencrypt/live/soulsinxtinction.com/privkey.pem
```

Vence el 2026-09-24 y Certbot dejo renovacion automatica programada.

Pruebas realizadas:

```text
https://soulsinxtinction.com/       -> 200 OK
https://www.soulsinxtinction.com/   -> 200 OK
https://soulsinxtinction.com/boveda -> 200 OK
http://soulsinxtinction.com/        -> 301 a HTTPS
```

## Pendiente de Cloudflare

- Revisar que SSL/TLS este en `Full (strict)`.
- No activar aun "Only allow Cloudflare IP addresses at your origin" hasta definir una lista de IPs de Cloudflare y reglas de emergencia para no perder acceso.
- Crear reglas anti-bot especificas para `/boveda` si se observa scraping.

## Nota sobre Prisma

No se ejecuto ninguna migracion, seed ni escritura de base de datos.

`npm ci` ejecuto `prisma generate`, que solo genero el Prisma Client.

Cuando la VPS apunte a `six2`, se debe evitar cualquier comando Prisma o script que pueda modificar datos de produccion.
