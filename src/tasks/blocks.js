import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupGutenberg(themePath) {
    // 1. Crear estructura de carpetas src/blocks/my-first-block
    const blocksSrcPath = path.join(themePath, 'src', 'blocks');
    const firstBlockPath = path.join(blocksSrcPath, 'my-first-block');
    
    await fs.ensureDir(firstBlockPath);

    // 2. Copiar el bloque boilerplate desde templates
    const templateBlockDir = path.join(__dirname, '../../templates/block');
    
    if (fs.existsSync(templateBlockDir)) {
        await fs.copy(path.join(templateBlockDir, 'block.json'), path.join(firstBlockPath, 'block.json'));
        await fs.copy(path.join(templateBlockDir, 'index.js'), path.join(firstBlockPath, 'index.js'));
        
        // Archivos CSS dummy
        await fs.writeFile(path.join(firstBlockPath, 'index.css'), '.wp-block-create-block-my-first-block { background: #f0f0f0; padding: 20px; border: 1px dashed #ccc; }');
        await fs.writeFile(path.join(firstBlockPath, 'style.scss'), '.wp-block-create-block-my-first-block { color: #333; font-weight: bold; }');
    }

    // 3. Inyectar el Loader de PHP en inc/
    const incPath = path.join(themePath, 'inc');
    await fs.ensureDir(incPath);
    
    const loaderTemplate = path.join(templateBlockDir, 'blocks-loader.php');
    if (fs.existsSync(loaderTemplate)) {
        await fs.copy(loaderTemplate, path.join(incPath, 'blocks-loader.php'));
    }

    // 4. Conectar el Loader en functions.php
    // GRACIAS A LA NORMALIZACIÓN, SIEMPRE ESTÁ EN LA RAÍZ:
    const functionsPath = path.join(themePath, 'functions.php');

    if (fs.existsSync(functionsPath)) {
        let content = await fs.readFile(functionsPath, 'utf8');
        if (!content.includes('blocks-loader.php')) {
            // Usamos get_theme_file_path por seguridad
            const requireLine = "\n/** Gutenberg Blocks Loader */\nrequire get_theme_file_path('/inc/blocks-loader.php');\n";
            await fs.appendFile(functionsPath, requireLine);
        }
    }
}