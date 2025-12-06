import { execa } from 'execa';

const PLUGINS = [
    'query-monitor',
    'classic-editor',
    'wordpress-seo'
];

export async function installPlugins(config) {
    const cwd = config.projectPath;
    const options = { cwd, shell: true };

    // CAMBIO AQUÍ: 'wp.bat'
    await execa('wp.bat', ['plugin', 'install', ...PLUGINS, '--activate'], options);

    try {
        await execa('wp.bat', ['plugin', 'delete', 'hello', 'akismet'], options);
        await execa('wp.bat', ['theme', 'delete', 'twentytwentytwo', 'twentytwentythree', 'twentytwentyfour'], options);
        await execa('wp.bat', ['post', 'delete', '1', '--force'], options);
    } catch (error) {
        // Ignorar errores de limpieza
    }
}