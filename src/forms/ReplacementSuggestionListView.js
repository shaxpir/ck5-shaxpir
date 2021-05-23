import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ClickableTextList from '../components/ClickableTextList';

import '../../theme/css/replacement-suggestions.css';

export default class ReplacementSuggestionListView extends View {
  constructor(locale, label, color, suggestions, callback) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    const bind = this.bindTemplate;

    this.set('label', label);
    this.set('color', color);
    
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-linguistic-tooltip' ],
      },
      children: [

        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('color', c => 'color:' + c )
            ],
            class: [ 'ck', 'ck-linguistic-tooltip-details' ],
          },
          children: [
            { text : bind.to( 'label' ) }
          ]
        },

        new ClickableTextList(locale, suggestions, callback)
      ]
    });
  }

  render() {
    super.render();
    submitHandler({ view: this });
    this.keystrokes.listenTo(this.element);
  }
}