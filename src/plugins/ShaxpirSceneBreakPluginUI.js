import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

import sceneBreakIcon from '../../theme/icons/scene-break.svg';

export class ShaxpirSceneBreakPluginUI extends Plugin {

    static get pluginName() {
        return 'ShaxpirSceneBreakPluginUI';
    }

    init() {
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add( 'shaxpirSceneBreak', locale => {
            const command = editor.commands.get( 'shaxpirSceneBreak' );
            const view = new ButtonView( locale );

            view.set( {
                label: t( 'Scene Break' ),
                icon: sceneBreakIcon,
                tooltip: true
            } );

            view.bind( 'isEnabled' ).to( command, 'isEnabled' );

            this.listenTo( view, 'execute', () => {
                editor.execute( 'shaxpirSceneBreak' );
                editor.editing.view.focus();
            } );

            return view;
        } );
    }
}
