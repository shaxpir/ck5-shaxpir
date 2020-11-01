import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/css/sync-status-item-view.css';

export default class SyncStatusItemView extends View {

  constructor(locale, label, value) {
    super(locale);
    const bind = this.bindTemplate;
    this.set('visible', true);
    this.set('value', value);
    this.setTemplate({
      tag: 'div',
      attributes: {
        style: [
          bind.to( 'visible', v => v ? 'display:block' : 'display:none' )
        ],
        class: [ 'ck', 'ck-sync-status-item' ]
      },
      children: [
        {
          tag: 'span',
          attributes: {
            class : [ 'ck', 'ck-sync-status-item-label' ]
          },
          children : [
            { text: label }
          ]
        },
        {
          tag: 'span',
          attributes: {
            class : [ 'ck', 'ck-sync-status-item-value' ]
          },
          children : [
            { text: bind.to( 'value' ) }
          ]
        }
      ]
    });
  }

  setVisible(visible) {
    this.set('visible', visible);
  }

  setValue(value) {
    this.set('value', value);
  }

}
