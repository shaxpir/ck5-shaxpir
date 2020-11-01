import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import highlightIcon from '../../theme/icons/highlight.svg';
import vividnessIcon from '../../theme/icons/vividness.svg';
import spellcheckIcon from '../../theme/icons/spellcheck.svg';

export class ShaxpirLinguisticHighlightPlugin extends Plugin {

  static get pluginName() {
    return 'ShaxpirLinguisticHighlight';
  }

  init() {
    console.log('ShaxpirLinguisticHighlightPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('highlight', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Highlight',
        icon : highlightIcon,
        tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });

    editor.ui.componentFactory.add('vividness', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Vividness',
        icon : vividnessIcon,
        tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });

    editor.ui.componentFactory.add('spellcheck', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Spellcheck',
        icon : spellcheckIcon,
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
