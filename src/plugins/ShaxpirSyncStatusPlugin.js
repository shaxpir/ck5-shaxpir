import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import SyncStatusView from '../forms/SyncStatusView';

import imageIcon from '../../theme/icons/sync-status.svg';

const SYNC_STATUS_KEYSTROKE = 'Ctrl+S';

export class ShaxpirSyncStatusPlugin extends Plugin {

  constructor(editor) {
    super(editor);
  }

  static get pluginName() {
    return 'ShaxpirSyncStatus';
  }

  init() {
    console.log('ShaxpirSyncStatusPlugin was initialized');

    const editor = this.editor;
    const locale = editor.locale;
    const t = editor.t;

    let pluginConfig = editor.config.get('syncStatus') || {};
    let callback = pluginConfig.withSyncStatus || function(status) { };

    editor.editing.view.addObserver(ClickObserver);

    this.syncStatusView = new SyncStatusView(locale, callback);

    // Handle the `Ctrl+S` keystroke and show the panel.
    editor.keystrokes.set(SYNC_STATUS_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();
      this._showUI();
    });

    editor.ui.componentFactory.add('syncStatus', locale => {

      const dropdownView = createDropdown( locale );
      dropdownView.buttonView.set({
        label : 'Sync Status',
        icon : imageIcon,
        keystroke : SYNC_STATUS_KEYSTROKE,
        tooltip : true
      });
      
      dropdownView.panelView.children.add( this.syncStatusView );

      dropdownView.on('change:isOpen', () => {
        console.log("change:isOpen");
        if ( dropdownView.isOpen ) {
          this.syncStatusView.startUpdating();
        } else {
          this.syncStatusView.stopUpdating();
        }
      });
      
      return dropdownView;
    });
  }

  destroy() {
    super.destroy();
    this.syncStatusView.destroy();
  }
}
