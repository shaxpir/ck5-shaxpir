import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/css/clickable-text.css';

export default class ClickableText extends View {
  constructor(locale, text, callback) {
    super(locale);
    this.set('text', text);
    const bind = this.bindTemplate;
    this.setTemplate({
      tag: 'span',
      attributes: {
        class: [ 'ck', 'ck-clickable-text' ]
      },
      children: [{ text: text }],
      on: {
        mousedown: bind.to(evt => {
          evt.preventDefault();
        }),
        click: bind.to(evt => {
          callback(text);
        })
      }
    });
  }
}