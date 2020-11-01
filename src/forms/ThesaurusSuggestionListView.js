import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';
import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ClickableTextList from '../components/ClickableTextList';

import '../../theme/css/thesaurus-suggestions.css';

export default class ThesaurusSuggestionListView extends View {
  constructor(locale, suggestions, callback) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-thesaurus-suggestion-bubble' ],
      },
      children: [
        new FormHeaderView(locale, { label: t("THESAURUS") }),
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