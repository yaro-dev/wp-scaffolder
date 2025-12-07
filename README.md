# WP Scaffolder CLI

Herramienta de línea de comandos diseñada para automatizar la creación de entornos de desarrollo locales para WordPress.

Esta herramienta genera una instalación limpia de WordPress, configura la base de datos, instala un tema base (_s o _tw), configura un entorno de desarrollo moderno con Vite + PostCSS y, opcionalmente, prepara un entorno de React para el desarrollo de Bloques de Gutenberg personalizados.

## Requisitos del Sistema

Para asegurar el funcionamiento correcto, el sistema debe cumplir con los siguientes requisitos previos.

### 1. Entorno de Servidor Local
Se recomienda el uso de Laragon (en Windows) o un stack equivalente (XAMPP/MAMP) que provea:
* PHP 8.0 o superior.
* MySQL o MariaDB (El servicio debe estar activo al ejecutar la herramienta).

Configuraciones críticas de PHP (php.ini):
* La extensión zip debe estar habilitada (extension=zip).
* La configuración de cURL y OpenSSL debe apuntar a un certificado cacert.pem válido para evitar errores de conexión SSL al descargar WordPress.

### 2. Node.js
* Versión 16.0 o superior.

### 3. Git
* Debe estar instalado y accesible desde la terminal.

### 4. WP-CLI (WordPress Command Line Interface)
Es el motor principal de la herramienta. Debe estar instalado y agregado a las Variables de Entorno (PATH) del sistema.

* Verificación: Ejecutar "wp --info" en la terminal.
* Nota para Windows: Se recomienda usar un archivo wp.bat en la ruta de instalación para asegurar la compatibilidad con Node.js.

## Instalación

Sigue estos pasos para instalar la herramienta en tu sistema.

1. Clona o descarga este repositorio en tu equipo.
2. Abre una terminal en la carpeta raíz del proyecto wp-scaffolder.
3. Instala las dependencias necesarias:
   npm install

4. Enlaza el comando globalmente para poder usarlo desde cualquier ubicación:
   npm link

   (En sistemas basados en Unix puede requerir "sudo npm link").

## Guía de Uso

1. Inicia los servicios de tu servidor local (MySQL y Nginx/Apache).
2. Abre tu terminal y navega al directorio público de tu servidor (ejemplo: C:\laragon\www).
3. Ejecuta el comando:
   wp-dev

4. Sigue las instrucciones del asistente interactivo:
   * Nombre del proyecto: Será el nombre de la carpeta y la URL local.
   * Credenciales de BD: Usuario y contraseña de tu conexión local MySQL.
   * Tema Base: Selecciona entre _s (Underscores) o _tw (Tailwind Starter).
   * Soporte de Bloques: Decide si deseas incluir la configuración de React para crear bloques nativos de Gutenberg.

### Resultado

Al finalizar el proceso, obtendrás:
* Una instalación fresca de WordPress en http://localhost/nombre-proyecto.
* Credenciales de Administrador generadas aleatoriamente (se mostrarán en la consola al finalizar).
* Base de datos creada y conectada automáticamente.
* Tema seleccionado instalado, activo y renombrado (Namespacing de PHP corregido automáticamente).
* Entorno Vite configurado dentro del tema para estilos y JS globales.
* (Opcional) Entorno @wordpress/scripts configurado para compilar bloques de React.
* Repositorio Git inicializado dentro de la carpeta del tema.

## Estructura del Proyecto Generado

La herramienta organiza el tema de la siguiente manera:

wp-content/themes/mi-tema/
├── src/
│   ├── blocks/         # (Opcional) Código fuente de bloques React
│   ├── css/            # Estilos globales (PostCSS/SASS)
│   └── js/             # Scripts globales (ES Modules)
├── inc/
│   ├── vite-setup.php  # Puente de conexión entre WP y Vite
│   └── blocks-loader.php # (Opcional) Auto-cargador de bloques compilados
├── build/              # (Opcional) Salida compilada de los bloques
├── dist/               # Salida compilada de Vite (Assets generales)
├── package.json        # Scripts de desarrollo unificados
├── vite.config.js      # Configuración de Vite
├── functions.php       # Incluye automáticamente los loaders necesarios
└── style.css

## Comandos de Desarrollo

Una vez creado el proyecto, entra a la carpeta del tema y utiliza:

* npm run dev: Ejecuta en paralelo Vite (para estilos/JS globales) y el compilador de Bloques (modo observación).
* npm run build: Genera los archivos finales optimizados para producción tanto de Vite como de los Bloques.

## Solución de Problemas Comunes

### Error: "wp" no se reconoce como un comando interno
Asegúrate de que la carpeta donde reside wp-cli.phar esté agregada correctamente al PATH de las variables de entorno de Windows. Reinicia la terminal después de cualquier cambio en el PATH.

### Error: cURL error 77
Indica que PHP no encuentra el certificado SSL. Descarga el archivo cacert.pem de curl.se, guárdalo en una ruta segura (ej. C:\laragon\etc\ssl\cacert.pem) y actualiza las líneas curl.cainfo y openssl.cafile en tu php.ini.

### Error: Extracting a zip file requires ZipArchive
Edita tu archivo php.ini y asegúrate de que la línea extension=zip no tenga un punto y coma (;) al inicio.

### Error con Git en Windows
Si la inicialización de Git falla, la herramienta continuará sin interrumpir la instalación. Esto suele deberse a configuraciones estrictas de la terminal. Puedes inicializar Git manualmente entrando a la carpeta del tema y ejecutando "git init".

---

WP Scaffolder CLI