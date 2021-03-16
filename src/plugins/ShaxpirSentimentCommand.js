import Command from '@ckeditor/ckeditor5-core/src/command';

const MARKER_PREFIX = 'sentiment-marker:';

export class ShaxpirSentimentCommand extends Command {
	constructor( editor ) {
		super( editor );

		this._resultsMap = new Map();

		this._lastMarkerId = 0;

		this.set( 'isOn', false );

		this.editor.model.document.on( 'change:data', this._modelChangeListener.bind( this ) );
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
				this._processTextItem( item.is( '$textProxy' ) ? item.textNode : item );
			}
		}
	}

	_processTextItem( textItem ) {
		// @todo simplified handling, there's no handling for cases when a word is split into two text items/proxies.
		// E.g. [foo bar ba][z bom] - ba and z will be treated as two separate words.
		const parts = textItem.data.split( /([^\w]+)/ );
		const model = this.editor.model;

		let currentPartOffset = 0;

		for ( const currentPart of parts ) {
			const isWord = currentPart.length && currentPart[ 0 ].match( /\w/ );

			if ( isWord ) {
				const sentimentScore = this.editor.config.get( 'sentiment' ).getSentimentForWord( currentPart );

				if ( sentimentScore ) {
					model.change( writer => {
						this._lastMarkerId += 1;
						const markerName = `${ MARKER_PREFIX }${ this._lastMarkerId }`;

						const start = model.createPositionAt( textItem.parent, textItem.startOffset + currentPartOffset );
						const end = model.createPositionAt( textItem.parent,
							textItem.startOffset + currentPartOffset + currentPart.length );

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

		this._removeSentimentMarkers( model.createRangeIn( model.document.getRoot() ) );

		this._lastMarkerId = 0;
	}

	/**
	 * Removes all the existing markers intersecting with a given model `range`.
	 *
	 * @param {module:engine/model/range~Range} range
	 * @returns {module:engine/model/range~Range|null} A range spanned over content where the markers were removed or `null` if no
	 * markers were removed.
	 */
	_removeSentimentMarkers( range ) {
		const model = this.editor.model;
		let modifiedRange = null;

		for ( const marker of model.markers.getMarkersIntersectingRange( range ) ) {
			if ( marker.name.startsWith( MARKER_PREFIX ) ) {
				if ( !modifiedRange ) {
					modifiedRange = marker.getRange();
				} else {
					modifiedRange = modifiedRange.getJoined( marker.getRange() );
				}

				model.change( writer => {
					writer.removeMarker( marker );

					// We can't delete the sentiment data from resultsMap synchronously, as this method might be executed within
					// yet another model.change() closure.
					// This means that writer.removeMarker() call will NOT be executed synchronously. And other bits of code might
					// still operate on the marker.
					// E.g. during the development there were cases that editingDowncast's markerToHighlight converter was called.
					this.editor.model.document.once( 'change:data', () => this._resultsMap.delete( marker.name ) );
				} );
			}
		}

		return modifiedRange;
	}

	_modelChangeListener() {
		if ( !this.isOn ) {
			return;
		}

		const model = this.editor.model;
		const changes = Array.from( model.document.differ.getChanges() );

		for ( const entry of changes ) {
			if ( [ 'insert', 'remove' ].includes( entry.type ) == false ) {
				continue;
			}

			const range = model.createRange(
				entry.position,
				entry.position.clone().getShiftedBy( entry.length )
			);

			// In any case first remove markers in modified range.
			const removedRange = this._removeSentimentMarkers( range );

			// Search inserted content for any highlightable items.
			if ( entry.type == 'insert' ) {
				this._doCheck( range.getJoined( removedRange ) );
			}
		}
	}
}
