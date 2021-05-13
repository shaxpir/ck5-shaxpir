import { Command } from 'ckeditor5/src/core';
import { findOptimalInsertionPosition, checkSelectionOnObject } from 'ckeditor5/src/widget';

export class ShaxpirSceneBreakCommand extends Command {

    refresh() {
        this.isEnabled = isSceneBreakAllowed( this.editor.model );
    }

    execute() {
        const model = this.editor.model;
        model.change( writer => {
            const sceneBreakElement = writer.createElement( 'shaxpirSceneBreak' );

            model.insertContent( sceneBreakElement );

            let nextElement = sceneBreakElement.nextSibling;

            // Check whether an element next to the inserted scene-break is defined and can contain a text.
            const canSetSelection = nextElement && model.schema.checkChild( nextElement, '$text' );

            // If the element is missing, but a paragraph could be inserted next to the scene-break, let's add it.
            if ( !canSetSelection && model.schema.checkChild( sceneBreakElement.parent, 'paragraph' ) ) {
                nextElement = writer.createElement( 'paragraph' );
                model.insertContent( nextElement, writer.createPositionAfter( sceneBreakElement ) );
            }

            // Put the selection inside the element, at the beginning.
            if ( nextElement ) {
                writer.setSelection( nextElement, 0 );
            }
        } );
    }
}

function isSceneBreakAllowed( model ) {
    const schema = model.schema;
    const selection = model.document.selection;

    return isSceneBreakAllowedInParent( selection, schema, model ) &&
        !checkSelectionOnObject( selection, schema );
}

function isSceneBreakAllowedInParent( selection, schema, model ) {
    const parent = getInsertSceneBreakParent( selection, model );
    return schema.checkChild( parent, 'shaxpirSceneBreak' );
}

function getInsertSceneBreakParent( selection, model ) {
    const insertAt = findOptimalInsertionPosition( selection, model );
    const parent = insertAt.parent;
    if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
        return parent.parent;
    }
    return parent;
}
