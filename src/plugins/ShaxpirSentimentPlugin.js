/* eslint-disable padded-blocks,indent,space-in-parens,template-curly-spacing,prefer-const,quotes,ckeditor5-rules/ckeditor-imports  */
/* eslint-disable key-spacing,max-statements-per-line  */
/* global console */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import FakeSelection from '../util/FakeSelection';
import SentimentTooltipView from '../forms/SentimentTooltipView';
import { ShaxpirSentimentCommand } from './ShaxpirSentimentCommand';
import { ShaxpirSentimentPluginUI } from './ShaxpirSentimentPluginUI';

import imageIcon from '../../theme/icons/sentiment.svg';

const VISUAL_SELECTION_MARKER_NAME = 'sentiment-ui';
const SENTIMENT_KEYSTROKE = 'Ctrl+J';

export class ShaxpirSentimentPlugin extends Plugin {

  static get requires() {
    return [ ContextualBalloon, ShaxpirSentimentPluginUI ];
  }

  constructor(editor) {
    super(editor);
    let pluginConfig = editor.config.get('sentiment') || {};
    this._getSentimentForWord = pluginConfig.getSentimentForWord || function(word) { return null; };
  }

  static get pluginName() {
    return 'ShaxpirSentiment';
  }

  init() {
    console.log('ShaxpirSentimentPlugin was initialized');

    const editor = this.editor;
    const locale = editor.locale;
    const t = editor.t;

    editor.commands.add( 'shaxpirSentiment', new ShaxpirSentimentCommand( editor) );

    editor.editing.view.addObserver(ClickObserver);

    this.sentimentTooltipView = new SentimentTooltipView(locale);
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
      emitter: this.sentimentTooltipView,
      activator: () => this.hasView,
      contextElements: [ this._balloon.view.element ],
      callback: () => this._hideUI()
    });

    // Initialize the fake selection
    FakeSelection.init(editor, VISUAL_SELECTION_MARKER_NAME);

    // Handle the `Ctrl+J` keystroke and show the panel.
    editor.keystrokes.set(SENTIMENT_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();
      this.exec();
    });

    editor.ui.componentFactory.add('sentiment', locale => {

      // Create the toolbar button
      const button = new ButtonView(locale);
      button.set({
        icon : imageIcon,
        isEnabled : true,
        label : t('Sentiment Analysis'),
        keystroke : SENTIMENT_KEYSTROKE,
        tooltip : true
      });

      // Callback executed once the button is clicked.
      button.on('execute', () => { this.exec(); });

      return button;
    });
  }

  get hasView() {
    return this._balloon.hasView(this.sentimentTooltipView);
  }

  get isShowing() {
    return this._balloon.visibleView == this.sentimentTooltipView;
  }

  exec() {
    let text = this._getSelectedText();
    if (text && text.length > 0) {
      console.log("selected text: " + text);
      let sentiment = this._getSentimentForWord(text);
      if (sentiment) {
        console.log("sentiment.score: " + sentiment.score);
        console.log("sentiment.label: " + sentiment.label);
        console.log("sentiment.color: " + sentiment.color);
        this._showUI(text, sentiment);
      }
    }
  }

  _getSelectedText() {
    let result = "";
    let selection = this.editor.model.document.selection;
    let range = selection.getFirstRange();
    for (const item of range.getItems()) {
      if (item.is('textProxy')) {
        result = result + item.data;
      }
    }
    return result;
  }

  destroy() {
    super.destroy();
    this.sentimentTooltipView.destroy();
  }

  _showUI(text, sentiment) {
    const editor = this.editor;
    // Show visual selection of the text when the contextual balloon is displayed.
    // See https://github.com/ckeditor/ckeditor5/issues/4721.
    FakeSelection.showFakeVisualSelection(editor, VISUAL_SELECTION_MARKER_NAME);

    this.sentimentTooltipView.setScore(sentiment.score);
    this.sentimentTooltipView.setLabel(sentiment.label);
    this.sentimentTooltipView.setColor(sentiment.color);

    if (!this._balloon.hasView(this.sentimentTooltipView)) {
      this._balloon.add({
        view: this.sentimentTooltipView,
        position: FakeSelection.getBalloonPositionData(editor, VISUAL_SELECTION_MARKER_NAME)
      });
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
    this.editor.editing.view.focus();

    if (this._balloon.hasView(this.sentimentTooltipView)) {
      this._balloon.remove(this.sentimentTooltipView);
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
