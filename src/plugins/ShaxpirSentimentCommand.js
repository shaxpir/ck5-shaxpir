import Command from '@ckeditor/ckeditor5-core/src/command';

const MARKER_PREFIX = 'sentiment-marker-';

export class ShaxpirSentimentCommand extends Command {
	constructor( editor ) {
		super( editor );

		this._lastMarkerId = 0;
	}

	execute() {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();

		// Triggering the command intends to reevaluate whole document.
		// So remove previous results.
		this._clearSentimentMarkers();

		for ( const item of model.createRangeIn( modelRoot ).getItems() ) {
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

				console.log( `Word ${ currentPart }, score: `, sentimentScore );

				model.change( writer => {
					this._lastMarkerId += 1;
					const markerName = `${ MARKER_PREFIX }${ this._lastMarkerId }`;

					const start = model.createPositionAt( textItem.parent, textItem.startOffset + currentPartOffset );
					const end = model.createPositionAt( textItem.parent, textItem.startOffset + currentPartOffset + currentPart.length );

					writer.addMarker( markerName, {
						usingOperation: false,
						affectsData: false,
						range: model.createRange( start, end )
					});
				} );
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
			if ( marker.name.startsWith( MARKER_PREFIX ) ) {
				model.change( writer => {
					writer.removeMarker( marker );
				} );
			}
		}
	}
}
