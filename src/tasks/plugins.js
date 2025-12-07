import { execa } from 'execa';
import chalk from 'chalk';

// 1. EL MENÚ DEL CHEF
const PLUGIN_PACKS = {
    base: [
        'classic-editor',
        'query-monitor'
    ],
    ecommerce: [
        'woocommerce',
        'woocommerce-gateway-stripe'
    ],
    corporate: [
        'advanced-custom-fields',
        'custom-post-type-ui',
        'wordpress-seo',
        'contact-form-7'
    ],
    headless: [
        'wp-graphql'
    ],
    performance: [
        'w3-total-cache',
        'autoptimize',
        'wp-smushit'
    ]
};

export async function installPlugins(config) {
    const cwd = config.projectPath;
    const options = { cwd, shell: true };

    // 2. CONSTRUIR LA LISTA FINAL
    let finalPlugins = [...PLUGIN_PACKS.base];

    if (config.selectedPacks && config.selectedPacks.length > 0) {
        config.selectedPacks.forEach(packKey => {
            if (PLUGIN_PACKS[packKey]) {
                finalPlugins = finalPlugins.concat(PLUGIN_PACKS[packKey]);
            }
        });
    }

    finalPlugins = [...new Set(finalPlugins)];

    if (finalPlugins.length === 0) return;

    // --- ELIMINADO EL CONSOLE.LOG AQUÍ PARA NO ROMPER EL SPINNER ---

    // 3. INSTALAR
    try {
        await execa('wp.bat', ['plugin', 'install', ...finalPlugins, '--activate'], options);
    } catch (error) {
        console.log(chalk.yellow('\n⚠️  Hubo una advertencia durante la instalación de plugins.'));
        if (error.stdout) {
            console.log(chalk.gray('--- Log de WP-CLI ---'));
            const lines = error.stdout.split('\n').filter(line => line.includes('Warning') || line.includes('Error') || line.includes('Failed'));
            console.log(lines.join('\n') || error.message);
            console.log(chalk.gray('---------------------'));
        }
    }

    // 4. LIMPIEZA DE BASURA
    try {
        await execa('wp.bat', ['plugin', 'delete', 'hello', 'akismet'], options);
        await execa('wp.bat', ['theme', 'delete', 'twentytwentytwo', 'twentytwentythree', 'twentytwentyfour', 'twentytwentyfive'], options);
        await execa('wp.bat', ['post', 'delete', '1', '--force'], options);
    } catch (error) {
        // Ignorar errores de limpieza
    }
}