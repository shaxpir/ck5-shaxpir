import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { ShaxpirLinguisticHighlightCommand } from './ShaxpirLinguisticHighlightCommand';
import { ShaxpirLinguisticHighlightPluginUI } from './ShaxpirLinguisticHighlightPluginUI';

export class ShaxpirLinguisticHighlightPlugin extends Plugin {

  static get requires() {
    return [ ShaxpirLinguisticHighlightPluginUI ];
  }

  constructor(editor) {
    super(editor);
  }

  static get pluginName() {
    return 'ShaxpirLinguisticHighlight';
  }

  init() {
    console.log('ShaxpirLinguisticHighlightPlugin was initialized');
    this.editor.commands.add( 'shaxpirLinguisticHighlight' , new ShaxpirLinguisticHighlightCommand( this.editor ));
  }

  destroy() {
    super.destroy();
  }
}
