#!/usr/bin/env node

/**
 * Este archivo es el punto de entrada ejecutable.
 * Se encarga de capturar errores globales e iniciar el programa.
 */

import { run } from '../src/main.js';
import chalk from 'chalk';

// Ejecutar la función principal importada de main.js
run().catch(err => {
    console.error(chalk.red('\n❌ Error fatal no controlado:'));
    console.error(err);
    process.exit(1);
});