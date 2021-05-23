import { inspect } from 'util';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import HeaderBodyView from '../forms/HeaderBodyView';
import LinguisticTooltipView from '../forms/LinguisticTooltipView';
import ReplacementSuggestionListView from '../forms/ReplacementSuggestionListView';

import sentimentIcon from '../../theme/icons/sentiment.svg';
import vividnessIcon from '../../theme/icons/vividness.svg';
import passiveVoiceIcon from '../../theme/icons/passive-voice.svg';
import adverbsIcon from '../../theme/icons/adverbs.svg';
import spellCheckIcon from '../../theme/icons/spellcheck.svg';

const MARKER_PREFIX = 'linguistic-marker:';
const COMMAND_NAME = 'shaxpirLinguisticHighlight';

export class ShaxpirLinguisticHighlightPluginUI extends Plugin {

    static get requires() {
        return [ ContextualBalloon ];
    }

    static get pluginName() {
        return 'ShaxpirLinguisticHighlightPluginUI';
    }

    constructor(editor) {
        super(editor);
    }

    init() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = editor.t;

        editor.editing.view.addObserver(ClickObserver);

        this.linguisticTooltipView = new LinguisticTooltipView(locale);
        this.spellCheckNoSuggestionsView = new HeaderBodyView(locale, t("SPELL CHECK"), t("No Suggestions."));
        this.spellCheckSuggestionsListView = new ReplacementSuggestionListView(
          locale, t("SPELL CHECK"), "#000", [], (replacement) => {}
        );

        this._balloon = editor.plugins.get(ContextualBalloon);

        const viewDocument = this.editor.editing.view.document;

        // Handle click on view document and show panel when selection is placed inside a linguistic marker.
        this.listenTo( viewDocument, 'click', () => {
            const marker = this._getMarkerForCurrentSelection();
            if (marker) {
                this._showUI(marker);
            }
        } );

        // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
        this.editor.keystrokes.set('Esc', (data, cancel) => {
          if (this.isShowing) {
            this._hideUI();
            cancel();
          }
        });

        // Close on click outside of balloon panel element.
        clickOutsideHandler({
          emitter: this.linguisticTooltipView,
          activator: () => this.hasView,
          contextElements: [ this._balloon.view.element ],
          callback: () => this._hideUI()
        });

        this.addConversion( editor );
        this.addButtons( editor );
    }

    destroy() {
      super.destroy();
      this.linguisticTooltipView.destroy();
    }

    addConversion( editor ) {
        editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
            model: 'linguistic-marker',
            view: ( markerData, conversionApi ) => {
                const command = editor.commands.get( COMMAND_NAME );
                const analysis = command._resultsMap.get( markerData.markerName );
                // TODO: spell-check stying should have squiggly underlines, or something...
                const color = this._getColorForHighlight(command, analysis);
                const shadow = this._getShadowForHighlight(command, analysis);
                return {
                    name: 'span',
                    attributes: {
                        'style': `color:${color};text-shadow:${shadow}`
                    }
                };
            }
        } );
    }

    addButtons( editor ) {
        const t = editor.t;

        editor.ui.componentFactory.add( 'passiveVoiceToggle', locale => {
            const button = new ButtonView( locale );
            const command = editor.commands.get( COMMAND_NAME );
            button.set( {
                icon: passiveVoiceIcon,
                isEnabled: true,
                label: t( 'Passive Voice' ),
                tooltip: true
            } );
            button.on( 'execute', () => {
                command.isPassiveVoiceOn = !command.isPassiveVoiceOn;
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );
            button.bind( 'isOn' ).to( command, 'isPassiveVoiceOn' );
            return button;
        } );

        editor.ui.componentFactory.add( 'adverbsToggle', locale => {
            const button = new ButtonView( locale );
            const command = editor.commands.get( COMMAND_NAME );
            button.set( {
                icon: adverbsIcon,
                isEnabled: true,
                label: t( 'Adverbs' ),
                tooltip: true
            } );
            button.on( 'execute', () => {
                command.isAdverbsOn = !command.isAdverbsOn;
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );
            button.bind( 'isOn' ).to( command, 'isAdverbsOn' );
            return button;
        } );

        editor.ui.componentFactory.add( 'sentimentToggle', locale => {
            const button = new ButtonView( locale );
            const command = editor.commands.get( COMMAND_NAME );
            button.set( {
                icon: sentimentIcon,
                isEnabled: true,
                label: t( 'Sentiment Analysis' ),
                tooltip: true
            } );
            button.on( 'execute', () => {
                command.isSentimentOn = !command.isSentimentOn;
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );
            button.bind( 'isOn' ).to( command, 'isSentimentOn' );
            return button;
        } );

        editor.ui.componentFactory.add( 'vividnessToggle', locale => {
            const button = new ButtonView( locale );
            const command = editor.commands.get( COMMAND_NAME );
            button.set( {
                icon: vividnessIcon,
                isEnabled: true,
                label: t( 'Vividness' ),
                tooltip: true
            } );
            button.on( 'execute', () => {
                command.isVividnessOn = !command.isVividnessOn;
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );
            button.bind( 'isOn' ).to( command, 'isVividnessOn' );
            return button;
        } );

        editor.ui.componentFactory.add( 'spellcheckToggle', locale => {
            const button = new ButtonView( locale );
            const command = editor.commands.get( COMMAND_NAME );
            button.set( {
                icon: spellCheckIcon,
                isEnabled: true,
                label: t( 'Spell Check' ),
                tooltip: true
            } );
            button.on( 'execute', () => {
                command.isSpellCheckOn = !command.isSpellCheckOn;
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );
            button.bind( 'isOn' ).to( command, 'isSpellCheckOn' );
            return button;
        } );
    }

    get hasView() {
        return this._balloon.hasView(this.linguisticTooltipView)
            || this._balloon.hasView(this.spellCheckNoSuggestionsView)
            || this._balloon.hasView(this.spellCheckSuggestionsListView)
    }

    get isShowing() {
        return this._balloon.visibleView == this.linguisticTooltipView
            || this._balloon.visibleView == this.spellCheckNoSuggestionsView
            || this._balloon.visibleView == this.spellCheckSuggestionsListView;
    }

    _showUI(marker) {

        if (!marker.name.startsWith(MARKER_PREFIX)) {
            return;
        }

        const editor = this.editor;
        const locale = editor.locale;
        const t = locale.t;
        const command = editor.commands.get( COMMAND_NAME );
        const analysis = command._resultsMap.get( marker.name );

        console.log("CLICKED MARKER: " + marker.name);
        console.log("ANALYSIS: " + JSON.stringify(analysis));

        if (!analysis) {
            // DEBUGGING: why would there be no analysis object for a known marker?
            command._resultsMap.forEach((v, k) => {
                console.log(`_resultsMap['${k}'] = ${inspect(v)}`);
            })
        }

        if (!this.hasView) {
            let v = null;
            if (analysis.spellCheck) {
                if (analysis.spellCheck.suggestions.length > 0) {
                    this.spellCheckSuggestionsListView = new ReplacementSuggestionListView(
                      locale, t("SPELL CHECK"),
                      analysis.spellCheck.color,
                      analysis.spellCheck.suggestions,
                      (replacement) => this._onChooseSuggestion(editor, marker, replacement)
                    );
                    v = this.spellCheckSuggestionsListView;
                } else {
                    v = this.spellCheckNoSuggestionsView;
                }
            } else {
                this.linguisticTooltipView.setAnalysisDetails( command, analysis );
                v = this.linguisticTooltipView;
            }
            let p = this._getBalloonPositionForMarker(editor, marker);
            this._balloon.add({ fitInViewport: true, view: v, position: p });
        }

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

        if (this._balloon.hasView(this.linguisticTooltipView)) {
            this._balloon.remove(this.linguisticTooltipView);
        } else if (this._balloon.hasView(this.spellCheckSuggestionsListView)) {
            this._balloon.remove(this.spellCheckSuggestionsListView);
        } else if (this._balloon.hasView(this.spellCheckNoSuggestionsView)) {
            this._balloon.remove(this.spellCheckNoSuggestionsView);
        }
    }

    _startUpdatingUI() {
        const editor = this.editor;
        let prevPosition = editor.model.document.selection.anchor;

        const update = () => {
            // TODO: verify this is correct in a collaborative context
            const currentPosition = editor.model.document.selection.anchor;
            if (currentPosition != prevPosition) {
                this.stopListening( editor.ui, 'update' );
                this.stopListening( this._balloon, 'change:visibleView' );
                this._hideUI();
            } else if (this.isShowing) {
                this._balloon.updatePosition(
                    this._getBalloonPositionForMarker(editor, this._getMarkerForCurrentSelection())
                );
            }
            prevPosition = currentPosition;
        };

        this.listenTo( editor.ui, 'update', update );
        this.listenTo( this._balloon, 'change:visibleView', update );
    }

    _onChooseSuggestion(editor, marker, replacement) {
        const model = editor.model;

        const replaceRange = marker.getRange();
        const replacePosition = marker.getStart();

        const textNode = replacePosition.textNode
          ? replacePosition.textNode
          : replacePosition.nodeAfter;

        const attributes = textNode.getAttributes();

        const command = editor.commands.get( COMMAND_NAME );
        command._resultsMap.delete( marker.name );

        model.enqueueChange( writer => {
            model.insertContent( writer.createText( replacement, attributes ), replaceRange );
        });
    }

    _getMarkerForCurrentSelection() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectionFirstRange = selection.getFirstRange()

        // Find the marker that overlaps with the current selection
        for (const marker of model.markers) {
            if (marker.name.startsWith(MARKER_PREFIX)) {
                let markerRange = marker.getRange();
                if (markerRange.containsRange(selectionFirstRange)) {
                    return marker;
                }
            }
        }

        return null;
    }

    _getBalloonPositionForMarker(editor, marker) {
        const mapper = editor.editing.mapper;
        const view = editor.editing.view;
        const markerViewElements = Array.from(mapper.markerNameToElements(marker.name));
        const newRange = view.createRange(
            view.createPositionBefore(markerViewElements[ 0 ]),
            view.createPositionAfter(markerViewElements[ markerViewElements.length - 1 ])
        );
        return { target : view.domConverter.viewRangeToDom(newRange) };
    }

    _getColorForHighlight(command, analysis) {
        if (analysis) {
            if (command.isSpellCheckOn && analysis.spellCheck) {
                return analysis.spellCheck.color;
            }
            if (command.isSentimentOn && analysis.sentiment) {
                return analysis.sentiment.color;
            }
            if (command.isVividnessOn && analysis.vividness) {
                return analysis.vividness.color;
            }
            if (analysis.partOfSpeech) {
                let type = analysis.partOfSpeech.type;
                if (
                    (command.isAdverbsOn && type === "ADVERB") ||
                    (command.isPassiveVoiceOn && type === "PASSIVE")
                ) {
                    return analysis.partOfSpeech.color;
                }
            }
        }
        return null;
    }

    _getShadowForHighlight(command, analysis) {
        if (analysis) {
            if (command.isSpellCheckOn && analysis.spellCheck) {
                return analysis.spellCheck.shadow;
            }
            if (command.isSentimentOn && analysis.sentiment) {
                return analysis.sentiment.shadow;
            }
            if (command.isVividnessOn && analysis.vividness) {
                return analysis.vividness.shadow;
            }
            if (analysis.partOfSpeech) {
                let type = analysis.partOfSpeech.type;
                if (
                    (command.isAdverbsOn && type === "ADVERB") ||
                    (command.isPassiveVoiceOn && type === "PASSIVE")
                ) {
                    return analysis.partOfSpeech.shadow;
                }
            }
        }
        return null;
    }

}
