import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps } from '@wordpress/block-editor';
import './index.css';
import './style.scss';

import metadata from './block.json';

registerBlockType( metadata.name, {
    edit: () => {
        const blockProps = useBlockProps();
        return (
            <div { ...blockProps }>
                <p>Hola! Soy un bloque editable (Backend). ✏️</p>
            </div>
        );
    },
    save: () => {
        const blockProps = useBlockProps.save();
        return (
            <div { ...blockProps }>
                <p>Hola! Soy el contenido guardado (Frontend). 🚀</p>
            </div>
        );
    },
} );