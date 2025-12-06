import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

export async function installWordPress(config) {
    const { projectPath, dbName, dbUser, dbPass, dbHost } = config;

    if (!fs.existsSync(projectPath)) {
        await fs.mkdir(projectPath);
    }

    const options = { 
        cwd: projectPath, 
        shell: true 
    };
    
    // CAMBIO AQUÍ: 'wp.bat' en lugar de 'wp'
    await execa('wp.bat', ['core', 'download', '--locale=es_ES', '--skip-content'], options);

    await execa('wp.bat', [
        'config', 'create',
        `--dbname=${dbName}`,
        `--dbuser=${dbUser}`,
        `--dbpass=${dbPass}`,
        `--dbhost=${dbHost}`,
        '--force'
    ], options);

    await execa('wp.bat', ['db', 'create'], options);

    const url = `http://localhost/${path.basename(projectPath)}`; 
    
    await execa('wp.bat', [
        'core', 'install',
        `--url=${url}`,
        `--title=${config.projectName}`,
        `--admin_user=${config.adminUser}`,
        `--admin_email=${config.adminEmail}`,
        `--admin_password=${config.adminPass}`,
        '--skip-email'
    ], options);
}