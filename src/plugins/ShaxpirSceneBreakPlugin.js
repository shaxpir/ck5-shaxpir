import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import { ShaxpirSceneBreakCommand } from './ShaxpirSceneBreakCommand';
import { ShaxpirSceneBreakEditing } from './ShaxpirSceneBreakEditing';
import { ShaxpirSceneBreakPluginUI } from './ShaxpirSceneBreakPluginUI';
 
const COMMAND_NAME = 'shaxpirSceneBreak';
 
export class ShaxpirSceneBreakPlugin extends Plugin {

    static get requires() {
        return [ ShaxpirSceneBreakEditing, ShaxpirSceneBreakPluginUI, Widget ];
    }
 
    static get pluginName() {
        return 'ShaxpirSceneBreak';
    }

    constructor(editor) {
        super(editor);
    }
    
    init() {
        console.log('ShaxpirSceneBreakPlugin was initialized');
        this.editor.commands.add( COMMAND_NAME , new ShaxpirSceneBreakCommand( this.editor ));
    }
    
    destroy() {
        super.destroy();
    }
} 