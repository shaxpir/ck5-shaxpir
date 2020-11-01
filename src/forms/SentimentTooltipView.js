import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/css/sentiment-tooltip.css';

export default class SentimentTooltipView extends View {

  constructor(locale) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    const bind = this.bindTemplate;
    this.set('score', '5.5');
    this.set('label', 'Neutral');
    this.set('color', '#000000');
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-sentiment-tooltip' ],
      },
      children: [
        new FormHeaderView(locale, { label: t("SENTIMENT") }),
        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('color', c => 'color:' + c )
            ],
            class: [ 'ck', 'ck-sentiment-tooltip-details' ],
          },
          children: [
            { text : bind.to('label') },
            { text : ": " },
            { text: bind.to('score') }
          ]
        }
      ]
    });
  }

  setScore(score) {
    this.set('score', score);
  }

  setLabel(label) {
    this.set('label', label);
  }

  setColor(color) {
    this.set('color', color);
  }

}
