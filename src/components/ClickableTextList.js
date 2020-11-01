import View from '@ckeditor/ckeditor5-ui/src/view';

import ClickableText from './ClickableText';
import UnclickableText from './UnclickableText';

import '../../theme/css/clickable-text-list.css';

export default class ClickableTextList extends View {
  constructor(locale, choices, callback) {
    super(locale);
    const children = this.createCollection();
    for (let i = 0; i < choices.length; i++) {
      if (i > 0) {
        children.add(new UnclickableText(locale, ", "));
      }
      children.add(new ClickableText(locale, choices[i], callback));
    }
    this.children = children;
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-clickable-text-list' ],
      },
      children: this.children
    });
  }
}