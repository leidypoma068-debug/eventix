# EVENTIX - Entrega integrada

Proyecto Laravel + React + Inertia con diseño blanco/violeta EVENTIX.

## Funcionalidades incluidas
- Catálogo paginado con búsqueda y filtros por fecha, categoría y ubicación.
- Registro, inicio/cierre de sesión y roles cliente/administrador.
- Detalle del evento y tipos de entrada con disponibilidad.
- Compra con cálculo de stock y cargo de servicio.
- Método tarjeta (simulado para entorno académico) y QR de pago demostrativo.
- Generación de una entrada y QR único por boleto comprado.
- PDF de entrada, Mis entradas y transferencia a otro usuario; al transferir se renueva el QR.
- Validación de QR de un solo uso.
- Dashboard de administración, CRUD de eventos, tipos de entrada y reportes PDF.
- Datos demo para presentar.

## Instalación rápida en XAMPP
1. Conserva la carpeta `.git`, tu `.env`, `vendor` y `node_modules` si ya existen. Copia el contenido de esta entrega sobre `C:\xampp\htdocs\eventix`.
2. Inicia Apache y MySQL en XAMPP.
3. En phpMyAdmin crea una base vacía llamada `eventix`.
4. Abre Git Bash:

```bash
cd /c/xampp/htdocs/eventix
```

Si NO tienes `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

En `.env` verifica:
```env
APP_URL=http://localhost/eventix/public
DB_DATABASE=eventix
DB_USERNAME=root
DB_PASSWORD=
```

Instala/actualiza dependencias y BD:
```bash
composer install
php artisan optimize:clear
php artisan migrate:fresh --seed
npm install
npm run build
```

Abre: `http://localhost/eventix/public`

## Usuarios demo
- Administrador: `admin@eventix.test` / `Eventix2026!`
- Cliente: `cliente@eventix.test` / `Eventix2026!`

## Crear los commits por módulo
Antes revisa:
```bash
git status
```

Luego puedes ejecutar el script preparado:
```bash
bash scripts/commits_eventix.sh
```

Verifica:
```bash
git log --oneline -10
```

Configura el remoto y sube:
```bash
git remote -v
git remote set-url origin https://github.com/leidypoma068-debug/eventix.git
git branch -M main
git push -u origin main
```

## Nota de presentación
Los pagos externos reales requieren credenciales del proveedor. En esta entrega la tarjeta se confirma en modo académico y el pago QR es demostrativo. El QR de **entrada sí es único, se guarda en BD, se renueva al transferir y queda inutilizable después de validarse**. El correo usa `MAIL_MAILER=log` por defecto; puede cambiarse por SMTP en `.env`.
