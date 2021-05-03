import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import SentimentTooltipView from '../forms/SentimentTooltipView';

import imageIcon from '../../theme/icons/sentiment.svg';

const MARKER_PREFIX = 'sentiment-marker:';
const COMMAND_NAME = 'shaxpirSentiment';

export class ShaxpirSentimentPluginUI extends Plugin {

    static get requires() {
        return [ ContextualBalloon ];
    }

    static get pluginName() {
        return 'ShaxpirSentimentPluginUI';
    }

    constructor(editor) {
        super(editor);
        let pluginConfig = editor.config.get('sentiment') || {};
        this._getSentimentForWord = pluginConfig.getSentimentForWord || function(word) { return null; };
    }

    init() {
        const editor = this.editor;
        const locale = editor.locale;
        const t = editor.t;

        editor.editing.view.addObserver(ClickObserver);

        this.sentimentTooltipView = new SentimentTooltipView(locale);
        this._balloon = editor.plugins.get(ContextualBalloon);

        const viewDocument = this.editor.editing.view.document;

        // Handle click on view document and show panel when selection is placed inside a sentiment marker.
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
          emitter: this.sentimentTooltipView,
          activator: () => this.hasView,
          contextElements: [ this._balloon.view.element ],
          callback: () => this._hideUI()
        });

        this.addConversion( editor );
        this.addButtons( editor );
    }

    destroy() {
      super.destroy();
      this.sentimentTooltipView.destroy();
    }

    addConversion( editor ) {
        editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
            model: 'sentiment-marker',
            view: ( markerData, conversionApi ) => {
                const command = editor.commands.get( COMMAND_NAME );
                const sentimentInfo = command._resultsMap.get( markerData.markerName );
                return {
                    name: 'span',
                    attributes: {
                        'data-sentiment-label': sentimentInfo.label,
                        'data-sentiment-score': sentimentInfo.score,
                        'style': `color:${sentimentInfo.color};text-shadow:${sentimentInfo.shadow}`
                    }
                };
            }
        } );
    }

    addButtons( editor ) {
        const t = editor.t;

        editor.ui.componentFactory.add( 'sentimentToggle', locale => {
            // Create the toolbar button
            const button = new ButtonView( locale );
            button.set( {
                icon: imageIcon,
                isEnabled: true,
                label: t( 'Sentiment Analysis' ),
                tooltip: true
            } );

            // Callback executed once the button is clicked.
            button.on( 'execute', () => {
                editor.execute( COMMAND_NAME );
                editor.editing.view.focus();
            } );

            const command = editor.commands.get( COMMAND_NAME );

            button.bind( 'isOn' ).to( command, 'isOn' );

            return button;
        } );
    }

    get hasView() {
        return this._balloon.hasView(this.sentimentTooltipView);
    }

    get isShowing() {
        return this._balloon.visibleView == this.sentimentTooltipView;
    }

    _showUI(marker) {

        if (!marker.name.startsWith(MARKER_PREFIX)) {
            return;
        }

        const editor = this.editor;
        const command = editor.commands.get( COMMAND_NAME );
        const sentimentInfo = command._resultsMap.get( marker.name );

        this.sentimentTooltipView.setScore(sentimentInfo.score);
        this.sentimentTooltipView.setLabel(sentimentInfo.label);
        this.sentimentTooltipView.setColor(sentimentInfo.color);

        if (!this._balloon.hasView(this.sentimentTooltipView)) {
            this._balloon.add({
                fitInViewport: true,
                view: this.sentimentTooltipView,
                position: this._getBalloonPositionForMarker(editor, marker)
            });
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

        if (this._balloon.hasView(this.sentimentTooltipView)) {
            this._balloon.remove(this.sentimentTooltipView);
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

}
