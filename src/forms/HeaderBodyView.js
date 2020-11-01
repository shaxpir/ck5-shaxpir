import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import UnclickableText from '../components/UnclickableText';

import '../../theme/css/header-body-view.css';

export default class HeaderBodyView extends View {
  constructor(locale, header, body) {
    super( locale );
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-header-body-view' ],
      },
      children: [
        new FormHeaderView(locale, { label: t(header) }),
        {
            tag: 'div',
            attributes: {
              class: [ 'ck', 'ck-header-body-view-body' ]
            },
            children: [
              new UnclickableText(locale, t(body))
            ]
        }
      ]
    });
  }

  render() {
    super.render();
    this.keystrokes.listenTo(this.element);
  }
}