<?php
/**
 * Welcome Screen - Injected by WP-Scaffolder
 * Feel free to delete this file and start coding!
 */
//get_header();
?>

<style>
    :root { --bg: #0f172a; --text: #f8fafc; --accent: #38bdf8; --card: #1e293b; }
    body { background-color: var(--bg); color: var(--text); font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
    .scaffolder-wrap { max-width: 800px; margin: 0 auto; padding: 4rem 1rem; text-align: center; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; background: linear-gradient(to right, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .status-badge { display: inline-block; padding: 0.5rem 1rem; background: rgba(56, 189, 248, 0.1); color: var(--accent); border-radius: 99px; font-weight: bold; margin-bottom: 2rem; border: 1px solid rgba(56, 189, 248, 0.2); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 3rem; text-align: left; }
    .card { background: var(--card); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.2s; }
    .card:hover { transform: translateY(-5px); border-color: var(--accent); }
    .card h3 { margin-top: 0; color: var(--accent); }
    .card code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; color: #e2e8f0; }
    .btn { display: inline-block; margin-top: 3rem; padding: 1rem 2rem; background: var(--accent); color: #0f172a; text-decoration: none; font-weight: bold; border-radius: 8px; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
</style>

<div class="scaffolder-wrap">
    <div class="status-badge">⚡ Environment Ready</div>
    <h1><?php bloginfo('name'); ?></h1>
    <p>Proyecto generado exitosamente con WP-Scaffolder.</p>

    <div class="grid">
        <div class="card">
            <h3>🎨 Estilos</h3>
            <p>Edita tus estilos globales en:<br><code>src/css/app.css</code></p>
        </div>
        <div class="card">
            <h3>🧠 Lógica JS</h3>
            <p>Tu punto de entrada JavaScript es:<br><code>src/js/app.js</code></p>
        </div>
        <div class="card">
            <h3>📐 Plantillas</h3>
            <p>Tus archivos PHP están en:<br><code>/wp-content/themes/<?php echo basename(get_template_directory()); ?>/</code></p>
        </div>
        <div class="card">
            <h3>🚀 Vite HMR</h3>
            <p>Hot Module Replacement está:<br>
            <?php if (defined('VITE_SERVER') && is_vite_dev()): ?>
                <strong style="color: #4ade80">ACTIVO</strong>
            <?php else: ?>
                <span style="opacity: 0.7">Inactivo (Modo Prod)</span>
            <?php endif; ?>
            </p>
        </div>
    </div>

    <a href="<?php echo admin_url(); ?>" class="btn">Ir al Dashboard (wp-admin) &rarr;</a>

    <p style="margin-top: 2rem; opacity: 0.5; font-size: 0.9rem;">
        Para eliminar esta pantalla, edita el archivo <code>index.php</code> de tu tema.
    </p>
</div>

<?php //get_footer(); ?>