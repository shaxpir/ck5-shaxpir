import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/css/hideable-divider.css';

export default class HideableDivider extends View {

  constructor(locale) {
    super(locale);
    const bind = this.bindTemplate;
    this.set('visible', true);
    this.setTemplate({
      tag: 'hr',
      attributes: {
        style: [
          bind.to( 'visible', v => v ? 'display:block' : 'display:none' )
        ],
        class: [ 'ck', 'ck-hideable-divider' ]
      }
    });
  }

  setVisible(visible) {
    this.set('visible', visible);
  }
}
