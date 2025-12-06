import degit from 'degit';
import replace from 'replace-in-file';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupTheme(themeBase, projectName) {
    // 1. DEFINICIÓN DE REPOSITORIOS
    const repos = {
        '_s': 'automattic/_s',
        '_tw': 'gregsullivan/_tw' 
    };

    const themeSlug = projectName.toLowerCase().replace(/[\s-]+/g, '_');
    const projectRoot = path.join(process.cwd(), projectName);
    const themeDir = path.join(projectRoot, 'wp-content', 'themes', themeSlug);

    // 2. Descargar tema
    const repo = repos[themeBase] || repos['_s'];
    const emitter = degit(repo, { cache: false, force: true });
    
    try {
        await emitter.clone(themeDir);
    } catch (error) {
        throw new Error(`Error descargando ${repo}. Verifica tu internet.`);
    }

    // -----------------------------------------------------------------------
    // NUEVO: APLANAR ESTRUCTURA PARA _tw
    // Si los archivos están en una subcarpeta 'theme', los subimos a la raíz
    // -----------------------------------------------------------------------
    const nestedThemeFolder = path.join(themeDir, 'theme');
    if (fs.existsSync(nestedThemeFolder)) {
        // Copiamos todo lo que está en /theme/ a la raíz del tema
        fs.copySync(nestedThemeFolder, themeDir, { overwrite: true });
        // Borramos la carpeta /theme/ que ahora está vacía o duplicada
        fs.removeSync(nestedThemeFolder);
    }
    // -----------------------------------------------------------------------

    // 3. Validación de seguridad
    if (!fs.existsSync(path.join(themeDir, 'style.css'))) {
        throw new Error(`El repositorio se descargó pero falta style.css en la raíz.`);
    }

    // 4. Renombrado y Limpieza
    const themeDirSanitized = themeDir.replace(/\\/g, '/');
    const ignoreFiles = [`${themeDirSanitized}/node_modules/**`, `${themeDirSanitized}/.git/**`, `${themeDirSanitized}/vendor/**`];

    // Glob pattern para buscar en todo el tema
    const filesToScan = [
        `${themeDirSanitized}/**/*.php`, 
        `${themeDirSanitized}/**/*.css`, 
        `${themeDirSanitized}/*.json`
    ];

    // Lógica para _s
    if (themeBase === '_s') {
        try {
            await replace({
                files: filesToScan,
                from: [ /_s_/g, /'_s'/g, / _s /g, /_s- /g ],
                to: [ `${themeSlug}_`, `'${themeSlug}'`, ` ${themeSlug} `, `${themeSlug}- ` ],
                ignore: ignoreFiles
            });

            await replace({
                files: `${themeDirSanitized}/style.css`,
                from: /Underscores/g,
                to: projectName
            });
        } catch (error) {
            console.error('Error no crítico renombrando _s:', error.message);
        }
    }
    
    // Lógica para _tw
    if (themeBase === '_tw') {
        try {
            await replace({
                files: filesToScan,
                from: [ 
                    /_tw_/g,      
                    /'_tw'/g,     
                    / _tw /g,     
                    /Text Domain: _tw/g 
                ], 
                to: [ 
                    `${themeSlug}_`, 
                    `'${themeSlug}'`, 
                    ` ${projectName} `, 
                    `Text Domain: ${themeSlug}`
                ],
                ignore: ignoreFiles
            });
        } catch (error) {
            console.warn('Advertencia: Error renombrando cadenas de _tw.');
        }
    }

    // 5. Inyectar Pantalla de Bienvenida
    const welcomeTemplate = path.join(__dirname, '../../templates/welcome.php');
    if (fs.existsSync(welcomeTemplate)) {
        await fs.copy(welcomeTemplate, path.join(themeDir, 'index.php'));
    }

    // 6. Activar el tema
    try {
        // Ahora que aplanamos la carpeta, el slug SIEMPRE coincide
        await execa('wp.bat', ['theme', 'activate', themeSlug], { 
            cwd: projectRoot, 
            shell: true 
        });
    } catch (error) {
        console.error(`Aviso: Activa el tema manualmente en wp-admin si no se activó. Error: ${error.message}`);
    }

    return themeDir; 
}