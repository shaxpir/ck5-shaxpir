import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import searchIcon from '../../theme/icons/search.svg';

export class ShaxpirSearchPlugin extends Plugin {

  static get pluginName() {
    return 'ShaxpirSearch';
  }

  init() {
    console.log('ShaxpirSearchPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('search', locale => {

      const view = new ButtonView(locale);
      view.set({
        label : 'Search',
        icon : searchIcon,
        tooltip : true
      });

      view.on('execute', () => {
        // TODO
      });

      return view;
    });
  }
}
