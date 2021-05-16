import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/css/linguistic-tooltip.css';

export default class LinguisticTooltipView extends View {

  constructor(locale) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    const bind = this.bindTemplate;
    this.set('heading', 'Heading');
    this.set('score', '5.5');
    this.set('label', 'Neutral');
    this.set('color', '#000000');
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-linguistic-tooltip' ]
      },
      children: [

        // NOTE: the first child in this view is based off the built-in `FormHeaderView`,
        // but with the label-text being bindable.
        {
          tag: 'div',
          attributes: {
            class: [ 'ck', 'ck-form__header' ]
          },
          children: [
            {
              tag: 'span',
              attributes: {
                class: [ 'ck', 'ck-form__header__label' ]
              },
              children: [
                { text: bind.to('heading') }
              ]
            }
          ]
        },

        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('color', c => 'color:' + c )
            ],
            class: [ 'ck', 'ck-linguistic-tooltip-details' ],
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

  setHeading(heading) {
    this.set('heading', heading);
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
