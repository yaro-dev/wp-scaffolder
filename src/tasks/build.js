import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupBuildTools(themePath) {
    // 1. Copiar plantillas (vite.config.js, postcss.config.js)
    const templatesDir = path.join(__dirname, '../../templates');

    if (fs.existsSync(path.join(templatesDir, 'vite.config.js'))) {
        await fs.copy(path.join(templatesDir, 'vite.config.js'), path.join(themePath, 'vite.config.js'));
        await fs.copy(path.join(templatesDir, 'postcss.config.js'), path.join(themePath, 'postcss.config.js'));
    }

    // 2. Crear package.json moderno
    const pkgJson = {
        "name": path.basename(themePath),
        "private": true,
        "type": "module",
        "scripts": {
            "dev": "vite",
            "build": "vite build"
        },
        "devDependencies": {
            "vite": "^5.0.0",
            "vite-plugin-live-reload": "^3.0.0",
            "postcss": "^8.4.0",
            "postcss-nested": "^6.0.0",
            "autoprefixer": "^10.0.0",
            "sass": "^1.70.0"
        }
    };

    await fs.writeJson(path.join(themePath, 'package.json'), pkgJson, { spaces: 2 });

    // 3. Crear estructura src
    await fs.ensureDir(path.join(themePath, 'src/css'));
    await fs.ensureDir(path.join(themePath, 'src/js'));
    await fs.writeFile(path.join(themePath, 'src/css/app.css'), '/* PostCSS Entry */\nbody { background-color: #f0f0f0; }');
    await fs.writeFile(path.join(themePath, 'src/js/app.js'), 'console.log("Vite is running ⚡️");');

    // 4. Instalar dependencias
    await execa('npm', ['install'], { cwd: themePath, shell: true });
}

export async function injectViteLoader(themePath) {
    // 1. Crear carpeta inc/ en la RAÍZ del tema (Esto es igual para _s y _tw)
    const incPath = path.join(themePath, 'inc');
    await fs.ensureDir(incPath);

    // 2. Crear vite-setup.php
    const templatePath = path.join(__dirname, '../../templates/vite-setup.php');
    if (fs.existsSync(templatePath)) {
        await fs.copy(templatePath, path.join(incPath, 'vite-setup.php'));
    } else {
        const phpCode = `<?php define('VITE_SERVER', 'http://localhost:3000'); define('VITE_ENTRY_POINT_SCRIPT', 'src/js/app.js'); function is_vite_dev() { return defined('WP_DEBUG') && WP_DEBUG && !file_exists(get_theme_file_path('/dist/manifest.json')); } add_action('wp_enqueue_scripts', function() { if (is_vite_dev()) { wp_enqueue_script('vite-client', VITE_SERVER . '/@vite/client', [], null, true); wp_enqueue_script('vite-app', VITE_SERVER . '/' . VITE_ENTRY_POINT_SCRIPT, [], null, true); } }); add_filter('script_loader_tag', function($tag, $handle, $src) { if (in_array($handle, ['vite-client', 'vite-app'])) { return '<script type="module" src="' . esc_url($src) . '"></script>'; } return $tag; }, 10, 3);`;
        await fs.writeFile(path.join(incPath, 'vite-setup.php'), phpCode);
    }

    // -----------------------------------------------------------
    // 3. DETECTAR UBICACIÓN DE functions.php (Lógica Segura)
    // -----------------------------------------------------------
    
    let functionsPath = '';

    // Opción A: Estructura Nested (_tw) -> theme/functions.php
    const nestedFunctions = path.join(themePath, 'theme', 'functions.php');
    
    // Opción B: Estructura Standard (_s) -> functions.php
    const standardFunctions = path.join(themePath, 'functions.php');

    if (fs.existsSync(nestedFunctions)) {
        functionsPath = nestedFunctions; // Detectado _tw
    } else if (fs.existsSync(standardFunctions)) {
        functionsPath = standardFunctions; // Detectado _s
    } else {
        console.warn('⚠️ No se encontró functions.php. No se pudo inyectar Vite.');
        return;
    }

    // 4. Inyectar el require en el archivo detectado
    let content = await fs.readFile(functionsPath, 'utf8');
    
    if (!content.includes('vite-setup.php')) {
        // Usamos get_theme_file_path() porque funciona bien sin importar si el functions.php 
        // está en la raíz o en una subcarpeta. Siempre busca desde la raíz del tema.
        const requireLine = "\n\n/** Vite Integration */\nrequire get_theme_file_path('/inc/vite-setup.php');\n";
        await fs.appendFile(functionsPath, requireLine);
    }
}