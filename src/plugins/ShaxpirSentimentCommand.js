import Command from '@ckeditor/ckeditor5-core/src/command';

const MARKER_PREFIX = 'sentiment-marker:';

export class ShaxpirSentimentCommand extends Command {
	constructor( editor ) {
		super( editor );

		this._resultsMap = new Map();

		this._lastMarkerId = 0;

		this.set( 'isOn', false );

		this.editor.model.document.on( 'change:data', this._modelChangeListener.bind( this ) )
	}

	execute() {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();

		const newOnValue = !this.isOn;

		if ( newOnValue ) {
			this._doCheck( model.createRangeIn( modelRoot ) );
		} else {
			this._clearSentimentMarkers();
		}

		this.isOn = newOnValue;
	}

	_doCheck( range ) {
		for ( const item of range.getItems() ) {
			if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
				this._processTextItem( item.is( '$textProxy' ) ? item.textNode : item )
			}
		}
	}

	_processTextItem( textItem ) {
		// @todo simplified handling, there's no handling for cases when a word is split into two text items/proxies.
		// E.g. [foo bar ba][z bom] - ba and z will be treated as two separate words.
		const parts = textItem.data.split( /([^\w]+)/ );
		const model = this.editor.model;

		let currentPartOffset = 0;

		for (const currentPart of parts) {
			const isWord = currentPart.length && currentPart[ 0 ].match( /\w/ );

			if ( isWord ) {
				const sentimentScore = this.editor.config.get( 'sentiment' ).getSentimentForWord( currentPart );

				if ( sentimentScore ) {
					model.change( writer => {
						this._lastMarkerId += 1;
						const markerName = `${ MARKER_PREFIX }${ this._lastMarkerId }`;

						const start = model.createPositionAt( textItem.parent, textItem.startOffset + currentPartOffset );
						const end = model.createPositionAt( textItem.parent, textItem.startOffset + currentPartOffset + currentPart.length );

						writer.addMarker( markerName, {
							usingOperation: false,
							affectsData: false,
							range: model.createRange( start, end )
						} );

						this._resultsMap.set( markerName, sentimentScore );
					} );
				}
			}

			currentPartOffset += currentPart.length;
		}
	}

	/**
	 * Removes all the existing sentiment markers from model.
	 *
	 * @private
	 */
	_clearSentimentMarkers() {
		const model = this.editor.model;

		for ( const marker of model.markers ) {
			const markerName = marker.name;
			if ( markerName.startsWith( MARKER_PREFIX ) ) {
				model.change( writer => {
					writer.removeMarker( marker );
				} );

				this._resultsMap.delete( markerName );
			}
		}
	}

	_modelChangeListener( eventInfo, batch ) {
		if ( !this.isOn ) {
			return;
		}
	}
}
