import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import ThesaurusSuggestionListView from '../forms/ThesaurusSuggestionListView';
import HeaderBodyView from '../forms/HeaderBodyView';
import FakeSelection from '../util/FakeSelection';
import SelectedText from '../util/SelectedText';

import imageIcon from '../../theme/icons/thesaurus.svg';

const VISUAL_SELECTION_MARKER_NAME = 'thesaurus-ui';
const THESAURUS_KEYSTROKE = 'Ctrl+G';

export class ShaxpirThesaurusPlugin extends Plugin {

  static get requires() {
    return [ ContextualBalloon ];
  }

  constructor(editor) {
    super(editor);
    let pluginConfig = editor.config.get('thesaurus') || {};
    this._getSuggestionsForText = pluginConfig.getSuggestionsForText || function(word) { return []; };
  }

  static get pluginName() {
    return 'ShaxpirThesaurus';
  }

  init() {
    console.log('ShaxpirThesaurusPlugin was initialized');

    const editor = this.editor;
    const locale = editor.locale;
    const t = editor.t;

    editor.editing.view.addObserver(ClickObserver);

    this.suggestionListView = new ThesaurusSuggestionListView(
      locale, [], (replacement) => this._onChooseSuggestion(replacement)
    );
    this.noSuggestionsView = new HeaderBodyView(locale, t("THESAURUS"), t("No Suggestions."));
    this._balloon = editor.plugins.get(ContextualBalloon);

    // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
    this.editor.keystrokes.set('Esc', (data, cancel) => {
      if (this.isShowing) {
        this._hideUI();
        cancel();
      }
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.suggestionListView,
      activator: () => this.hasView,
      contextElements: [ this._balloon.view.element ],
      callback: () => this._hideUI()
    });

    // Initialize the fake selection
    FakeSelection.init(editor, VISUAL_SELECTION_MARKER_NAME);

    // Handle the `Ctrl+G` keystroke and show the panel.
    editor.keystrokes.set(THESAURUS_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();
      this.exec();
    });

    editor.ui.componentFactory.add('thesaurus', locale => {

      // Create the toolbar button
      const button = new ButtonView(locale);
      button.set({
        icon : imageIcon,
        isEnabled : true,
        label : t('Thesaurus'),
        keystroke : THESAURUS_KEYSTROKE,
        tooltip : true
      });

      // Callback executed once the button is clicked.
      button.on('execute', () => { this.exec() });

      return button;
    });
  }

  get hasView() {
    return this._balloon.hasView(this.suggestionListView) || this._balloon.hasView(this.noSuggestionsView);
  }

  get isShowing() {
    return this._balloon.visibleView == this.suggestionListView || this._balloon.visibleView == this.noSuggestionsView;
  }

  exec() {
    let text = SelectedText.collect(this.editor);
    if (text && text.length > 0) {
      console.log("selected text: " + text)
      let suggestions = this._getSuggestionsForText(text);
      console.log("suggestions: " + JSON.stringify(suggestions));
      this._showUI(text, suggestions);
    }
  }

  _onChooseSuggestion(replacement) {
    this._hideUI();
    SelectedText.replace(this.editor, replacement);
  }

  destroy() {
    super.destroy();
    this.suggestionListView.destroy();
    this.noSuggestionsView.destroy();
  }

  _showUI(text, suggestions) {
    const editor = this.editor;
    // Show visual selection of the text when the contextual balloon is displayed.
    // See https://github.com/ckeditor/ckeditor5/issues/4721.
    FakeSelection.showFakeVisualSelection(editor, VISUAL_SELECTION_MARKER_NAME);

    if (suggestions.length > 0) {
      this.suggestionListView = new ThesaurusSuggestionListView(
        editor.locale, suggestions, (replacement) => this._onChooseSuggestion(replacement)
      );
      if (!this._balloon.hasView(this.suggestionListView)) {
        this._balloon.add({
          view: this.suggestionListView,
          position: FakeSelection.getBalloonPositionData(editor, VISUAL_SELECTION_MARKER_NAME)
        });
      }
    } else {
      if (!this._balloon.hasView(this.noSuggestionsView)) {
        this._balloon.add({
          view: this.noSuggestionsView,
          position: FakeSelection.getBalloonPositionData(editor, VISUAL_SELECTION_MARKER_NAME)
        });
      }
    }

    // Be sure panel is visible.
    this._balloon.showStack('main');

    // Begin responding to ui#update once the UI is added.
    this._startUpdatingUI();
  }

  _hideUI() {
    if (!this.hasView) {
      return;
    }

    const editor = this.editor;

    // Make sure the focus always gets back to the editable _before_ removing the focused form view.
    // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
    editor.editing.view.focus();

    if (this._balloon.hasView(this.suggestionListView)) {
      this._balloon.remove(this.suggestionListView);
    }
    if (this._balloon.hasView(this.noSuggestionsView)) {
      this._balloon.remove(this.noSuggestionsView);
    }

    this.stopListening( editor.ui, 'update' );
    this.stopListening( this._balloon, 'change:visibleView' );

    FakeSelection.hideFakeVisualSelection(editor, VISUAL_SELECTION_MARKER_NAME);
  }

  _startUpdatingUI() {
    const editor = this.editor;
    let prevSelection = editor.model.document.selection;

    const update = () => {
      const currentSelection = editor.model.document.selection;
      if (currentSelection != prevSelection) {
        this._hideUI();
      } else if (this.isShowing) {
        this._balloon.updatePosition(
          FakeSelection.getBalloonPositionData(editor, VISUAL_SELECTION_MARKER_NAME)
        );
      }
      prevSelection = currentSelection;
    };

    this.listenTo( editor.ui, 'update', update );
    this.listenTo( this._balloon, 'change:visibleView', update );
  }
}