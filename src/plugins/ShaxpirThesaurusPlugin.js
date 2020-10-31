import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import imageIcon from '../../theme/icons/thesaurus.svg';

export class ShaxpirThesaurusPlugin extends Plugin {
  init() {
    console.log('ShaxpirThesaurusPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('thesaurus', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Thesaurus',
          icon : imageIcon,
          tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });
  }
}
