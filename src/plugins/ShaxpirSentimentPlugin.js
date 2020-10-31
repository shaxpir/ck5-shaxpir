import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import sentimentIcon from '../../theme/icons/sentiment.svg';

export class ShaxpirSentimentPlugin extends Plugin {

  static get pluginName() {
    return 'ShaxpirSentiment';
  }

  init() {
    console.log('ShaxpirSentimentPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('sentiment', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Sentiment Analysis',
        icon : sentimentIcon,
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
