import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/css/unclickable-text.css';

export default class UnclickableText extends View {
  constructor(locale, text) {
    super(locale);
    this.setTemplate({
      tag: 'span',
      attributes: {
        class: [ 'ck', 'ck-unclickable-text' ]
      },
      children: [
        { text: text }
      ]
    });
  }
}
