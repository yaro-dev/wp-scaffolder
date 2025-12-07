<?php
/**
 * Auto-loader para Bloques de Gutenberg
 */

function scaffolding_load_blocks() {
	// Buscamos en la carpeta compilada 'build/blocks'
	$build_dir = get_theme_file_path( '/build/blocks' );

	if ( file_exists( $build_dir ) ) {
		$block_dirs = array_filter( glob( $build_dir . '/*' ), 'is_dir' );

		foreach ( $block_dirs as $block_dir ) {
			register_block_type( $block_dir );
		}
	}
}
add_action( 'init', 'scaffolding_load_blocks' );