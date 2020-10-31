import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import imageIcon from '../../theme/icons/sync-status.svg';

export class ShaxpirSyncStatusPlugin extends Plugin {
  init() {
    console.log('ShaxpirSyncStatusPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('syncStatus', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Sync Status',
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
