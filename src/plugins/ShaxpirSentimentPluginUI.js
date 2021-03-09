import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { ShaxpirSentimentCommand } from './ShaxpirSentimentCommand';

import imageIcon from '../../theme/icons/sentiment.svg';

const SENTIMENT_COMMAND_NAME = 'shaxpirSentiment';

export class ShaxpirSentimentPluginUI extends Plugin {

	static get requires() {
		return [];
	}

	static get pluginName() {
		return 'ShaxpirSentimentPluginUI';
	}

	init() {
		const editor = this.editor;

		this.addConversion( editor );
		this.addButtons( editor );
	}

	addConversion( editor ) {
		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'sentiment-marker',
			view: ( markerData, conversionApi ) => {
				const sentimentInfo = editor.commands.get( SENTIMENT_COMMAND_NAME )._resultsMap.get( markerData.markerName );

				return {
					name: 'span',
					attributes: {
						'data-sentiment-score': sentimentInfo.score,
						'style': 'background-color: ' + sentimentInfo.color
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
				editor.execute( SENTIMENT_COMMAND_NAME );
				editor.editing.view.focus();
			} );

			const command = editor.commands.get( SENTIMENT_COMMAND_NAME );

			button.bind( 'isOn' ).to( command, 'isOn' );

			return button;
		} );
	}
}
