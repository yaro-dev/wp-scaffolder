<?php
/**
 * Vite Development Setup
 * Injected automatically by WP Scaffolder
 */

// Ajusta esto si tu servidor de desarrollo corre en otro puerto
define('VITE_SERVER', 'http://localhost:3000');
define('VITE_ENTRY_POINT_SCRIPT', 'src/js/app.js');
define('VITE_ENTRY_POINT_STYLE', 'src/css/app.css');


function is_vite_dev() {
    return defined('WP_DEBUG') && WP_DEBUG && !file_exists(get_theme_file_path('/dist/manifest.json'));
}

add_action('wp_enqueue_scripts', function() {
    if (is_vite_dev()) {
        // Entorno de Desarrollo (HMR)
        wp_enqueue_script('vite-client', VITE_SERVER . '/@vite/client', [], null, true);
        wp_enqueue_script('vite-app', VITE_SERVER . '/' . VITE_ENTRY_POINT_SCRIPT, [], null, true);
        // En desarrollo, Vite inyecta el CSS vía JS
    } else {
        // Producción (Archivos compilados)
        $manifest_path = get_theme_file_path('/dist/.vite/manifest.json');
        if (!file_exists($manifest_path)) {
            // Soporte para versiones anteriores de Vite
            $manifest_path = get_theme_file_path('/dist/manifest.json');
        }

        if (file_exists($manifest_path)) {
            $manifest = json_decode(file_get_contents($manifest_path), true);

            // Cargar JS
            if (isset($manifest[VITE_ENTRY_POINT_SCRIPT])) {
                $file = $manifest[VITE_ENTRY_POINT_SCRIPT]['file'];
                wp_enqueue_script('vite-app', get_theme_file_uri('/dist/' . $file), [], null, true);
            }

            // Cargar CSS
            if (isset($manifest[VITE_ENTRY_POINT_STYLE]['css'])) {
                foreach ($manifest[VITE_ENTRY_POINT_STYLE]['css'] as $css_file) {
                    wp_enqueue_style('vite-css', get_theme_file_uri('/dist/' . $css_file));
                }
            } else if (isset($manifest[VITE_ENTRY_POINT_SCRIPT]['css'])) {
                // A veces Vite agrupa el CSS bajo el entry point de JS
                foreach ($manifest[VITE_ENTRY_POINT_SCRIPT]['css'] as $css_file) {
                    wp_enqueue_style('vite-css', get_theme_file_uri('/dist/' . $css_file));
                }
            }
        }
    }
});

// Añadir type="module" para Vite
add_filter('script_loader_tag', function($tag, $handle, $src) {
    if (in_array($handle, ['vite-client', 'vite-app'])) {
        return '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
}, 10, 3);