import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import figlet from 'figlet';
import path from 'path';
import open from 'open';
import crypto from 'crypto';
import { execa } from 'execa';  // <--- Necesario para git init
import { setupGutenberg } from './tasks/blocks.js';

// Tareas
import { installWordPress } from './tasks/wp-core.js';
import { setupTheme } from './tasks/themes.js';
import { setupBuildTools, injectViteLoader } from './tasks/build.js';
import { installPlugins } from './tasks/plugins.js';

export async function run() {
    console.clear();
    console.log(chalk.cyan(figlet.textSync('WP Scaffolder', { horizontalLayout: 'full' })));

    // 1. Preguntas (Simplificadas, ya no pedimos user/pass de WP)
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: '¿Nombre del proyecto (carpeta)?',
            default: 'mi-nuevo-wp',
            validate: (input) => input ? true : 'Debes escribir un nombre.'
        },
        {
            type: 'input',
            name: 'dbUser',
            message: 'Usuario de MySQL Local:',
            default: 'root'
        },
        {
            type: 'password',
            name: 'dbPass',
            message: 'Contraseña de MySQL Local:',
            mask: '*'
        },
        {
            type: 'list',
            name: 'themeBase',
            message: '¿Qué tema base deseas usar?',
            choices: [
                { name: '_s (Underscores)', value: '_s' },
                { name: '_tw (Tailwind)', value: '_tw' }
            ]
        },
        {
            type: 'confirm',
            name: 'supportBlocks',
            message: '¿Deseas soporte para Bloques de Gutenberg personalizados?',
            default: true
        }

    ]);

    // --- GENERADOR DE CREDENCIALES CREATIVAS ---
    const coolUsers = ['DevMaster', 'CodeNinja', 'WPRockstar', 'PixelHero', 'CyberDev', 'AdminPrime', 'NeonBoss'];
    const randomUser = coolUsers[Math.floor(Math.random() * coolUsers.length)];

    // Genera una contraseña segura de 12 caracteres (Hexadecimal)
    const securePass = crypto.randomBytes(6).toString('hex');
    // -------------------------------------------

    // Configuración Global
    const projectUrl = `http://localhost/${answers.projectName}`;
    const config = {
        ...answers,
        projectPath: path.join(process.cwd(), answers.projectName),
        dbName: answers.projectName.replace(/-/g, '_'),
        dbHost: 'localhost',
        // Credenciales dinámicas
        adminUser: randomUser,
        adminEmail: 'admin@local.test',
        adminPass: securePass
    };

    console.log('\n🚀 Iniciando construcción...\n');

    // PASO 1: WP Core
    const spinner = ora('Instalando WordPress y Base de Datos...').start();
    try {
        await installWordPress(config);
        spinner.succeed('Core instalado.');
    } catch (error) {
        spinner.fail('Error en Core.');
        console.error(error);
        process.exit(1);
    }

    // PASO 2: Tema + Welcome Screen
    let themePath = '';
    spinner.start('Configurando tema y pantalla de bienvenida...');
    try {
        themePath = await setupTheme(config.themeBase, config.projectName);
        spinner.succeed('Tema configurado.');
    } catch (error) {
        spinner.fail('Error en Tema.');
        console.error(error);
    }

    // PASO 3: Vite
    spinner.start('Inyectando entorno Vite...');
    try {
        await setupBuildTools(themePath);
        await injectViteLoader(themePath);
        spinner.succeed('Vite listo.');
    } catch (error) {
        spinner.fail('Error en Vite.');
    }

    // PASO 3.5: GUTENBERG BLOCKS
    if (config.supportBlocks && themePath) {
        spinner.start('Configurando entorno de Bloques (React)...');
        try {
            await setupGutenberg(themePath);
            spinner.succeed('Soporte de Bloques listo.');
        } catch (error) {
            spinner.fail('Error configurando Bloques.');
            console.error(error); // Para depurar
        }
    }

    // PASO 4: Plugins
    spinner.start('Instalando plugins...');
    await installPlugins(config);

    // PASO 5: GIT INIT (En la carpeta del tema)
    if (themePath) { // Solo si se creó un tema
        spinner.start('Inicializando repositorio Git en el tema...');
        try {
            // CAMBIO CLAVE: Usamos 'themePath' en lugar de 'config.projectPath'
            // Así el repo se crea dentro de wp-content/themes/tu-tema/
            const gitOptions = { cwd: themePath, shell: true };

            // 1. Git init
            await execa('git', ['init'], gitOptions);

            // 2. Configurar usuario local para evitar errores si no tienes git global
            await execa('git', ['config', 'user.email', 'scaffolder@local.test'], gitOptions);
            await execa('git', ['config', 'user.name', 'WP-Scaffolder'], gitOptions);

            // 3. Agregar archivos (.gitignore ya debería estar ahí si lo copiamos, si no, se agrega todo)
            await execa('git', ['add', '.'], gitOptions);

            // 4. Commit SIN ESPACIOS (Para que Windows no rompa la cadena)
            await execa('git', ['commit', '-m', 'Initial-Setup'], gitOptions);

            spinner.succeed('Git inicializado dentro del tema.');
        } catch (error) {
            // Si falla, mostramos la ruta donde intentó hacerlo
            spinner.warn(`No se pudo iniciar Git en: ${themePath}`);
            // console.log(error.stderr); // Descomenta si quieres ver el error técnico
        }
    }

    // FINAL: Resumen y Apertura
    console.log('\n' + chalk.green.bold('🎉 ¡INSTALACIÓN COMPLETADA! 🎉'));

    // Tabla de Credenciales Estilizada
    console.log(chalk.gray('┌──────────────────────────────────────────────────┐'));
    console.log(chalk.gray('│') + chalk.yellow.bold('  Acceso Administrativo                           ') + chalk.gray('│'));
    console.log(chalk.gray('├──────────────────────────────────────────────────┤'));
    // Usamos padEnd para alinear el texto en la tabla
    console.log(chalk.gray('│') + `  URL:   ${chalk.cyan((projectUrl + '/wp-admin').padEnd(33))} ` + chalk.gray('│'));
    console.log(chalk.gray('│') + `  User:  ${chalk.green(config.adminUser.padEnd(33))} ` + chalk.gray('│'));
    console.log(chalk.gray('│') + `  Pass:  ${chalk.green(config.adminPass.padEnd(33))} ` + chalk.gray('│'));
    console.log(chalk.gray('└──────────────────────────────────────────────────┘'));

    console.log('\nAbriendo el sitio en tu navegador...');

    // Abrir navegador automáticamente
    await open(projectUrl);

    // Instrucciones finales
    console.log(chalk.magenta('\nPasos para desarrollar:'));
    console.log(`1. cd ${answers.projectName}`);
    const relTheme = path.relative(config.projectPath, themePath);
    console.log(`2. cd ${relTheme}`);
    console.log('3. npm run dev');
    console.log('\n');
}