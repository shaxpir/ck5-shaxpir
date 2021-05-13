import { Plugin } from 'ckeditor5/src/core';
import { toWidget } from 'ckeditor5/src/widget';

import { ShaxpirSceneBreakCommand } from './ShaxpirSceneBreakCommand';

import '../../theme/css/scene-break.css';

export class ShaxpirSceneBreakEditing extends Plugin {

    static get pluginName() {
        return 'ShaxpirSceneBreakEditing';
    }

    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const t = editor.t;
        const conversion = editor.conversion;

        schema.register( 'shaxpirSceneBreak', {
            isObject: true,
            allowWhere: '$block'
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'shaxpirSceneBreak',
            view: ( modelElement, { writer } ) => {
                return writer.createEmptyElement( 'hr', { 'class' : 'ck-scene-break' } );
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'shaxpirSceneBreak',
            view: ( modelElement, { writer } ) => {
                const label = t( 'Scene Break' );
                const viewWrapper = writer.createContainerElement( 'div' );
                const viewHrElement = writer.createEmptyElement( 'hr', { 'class' : 'ck-scene-break' } );

                writer.addClass( 'ck-scene-break', viewWrapper );
                writer.setCustomProperty( 'hr', true, viewWrapper );

                writer.insert( writer.createPositionAt( viewWrapper, 0 ), viewHrElement );

                return toSceneBreakWidget( viewWrapper, writer, label );
            }
        } );

        conversion.for( 'upcast' ).elementToElement( {
            view: 'hr',
            class: 'ck-scene-break',
            model: 'shaxpirSceneBreak',
            converterPriority: 'high'
        } );

        editor.commands.add( 'shaxpirSceneBreak', new ShaxpirSceneBreakCommand( editor ) );
    }
}

function toSceneBreakWidget( viewElement, writer, label ) {
    writer.setCustomProperty( 'shaxpirSceneBreak', true, viewElement );
    return toWidget( viewElement, writer, { label } );
}
