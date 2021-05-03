import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { ShaxpirSentimentCommand } from './ShaxpirSentimentCommand';
import { ShaxpirSentimentPluginUI } from './ShaxpirSentimentPluginUI';

const COMMAND_NAME = 'shaxpirSentiment';

export class ShaxpirSentimentPlugin extends Plugin {

  static get requires() {
    return [ ShaxpirSentimentPluginUI ];
  }

  constructor(editor) {
    super(editor);
  }

  static get pluginName() {
    return 'ShaxpirSentiment';
  }

  init() {
    console.log('ShaxpirSentimentPlugin was initialized');
    this.editor.commands.add( COMMAND_NAME , new ShaxpirSentimentCommand( this.editor ));
  }

  destroy() {
    super.destroy();
  }
}
