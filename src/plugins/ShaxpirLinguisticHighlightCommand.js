import Command from '@ckeditor/ckeditor5-core/src/command';
import Range from '@ckeditor/ckeditor5-engine/src/model/range';

const MARKER_PREFIX = 'linguistic-marker:';
const WORD_PATTERN = /[\w\-'‘’]+/;
const WORD_SEPARATOR_PATTERN = /([^\w\-'‘’]+)/;

export class ShaxpirLinguisticHighlightCommand extends Command {

	constructor( editor ) {
		super( editor );

		this._resultsMap = new Map();

		this._lastMarkerId = 0;

		let pluginConfig = this.editor.config.get( 'linguistics' );
		this._analyzeWord = pluginConfig.analyzeWord;

		this.editor.model.document.on( 'change:data', this._modelChangeListener.bind( this ) );

		this.set( 'isSentimentOn', false );
		this.set( 'isVividnessOn', false );
		this.set( 'isPassiveVoiceOn', false );
		this.set( 'isAdverbsOn', false );
	}

	execute() {
		const model = this.editor.model;
		const modelRoot = model.document.getRoot();

		// TODO: whenver ANY of the highlight rules are toggled on, apply a "light grey" style to all text in the editor,
		// so that non-highlighted text fades into the background a bit.

		// TODO: Don't start from scratch. Clear markers for highlight-rules that just got
		// toggled off, and only add new markers for highlight-rules that just got toggled on.

		this._clearAllMarkers();
		if ( this.isAnyOn ) {
			this._doCheck( model.createRangeIn( modelRoot ) );
		}
	}

	get isAnyOn() {
		return this.isVividnessOn
		    || this.isPassiveVoiceOn
	        || this.isSentimentOn
		    || this.isAdverbsOn;
	}

	_doCheck( range ) {
		for ( const item of range.getItems() ) {
			if ( item.is( '$text' ) || item.is( '$textProxy' ) ) {
				this._processTextItem( item );
			}
		}
	}

	_processTextItem( textItem ) {
		// @todo simplified handling, there's no handling for cases when a word is split into two text items/proxies.
		// E.g. [foo bar ba][z bom] - ba and z will be treated as two separate words.
		const parts = textItem.data.split( WORD_SEPARATOR_PATTERN );

		let currentPartOffset = 0;
		const startOffset = textItem.startOffset;
		const model = this.editor.model;
		model.change( writer => {
			for ( const currentPart of parts ) {
				const isWord = currentPart.length && currentPart[ 0 ].match( WORD_PATTERN );

				if ( isWord ) {
					let word = currentPart;
					const analysis = this._analyzeWord( word );

					if ( this._shouldHighlightWord( analysis ) ) {

						this._lastMarkerId += 1;
						const markerName = `${ MARKER_PREFIX }${ this._lastMarkerId }`;

						const currentPartStart = startOffset + currentPartOffset;
						const currentPartEnd = currentPartStart + word.length;

						const wordStart = model.createPositionAt( textItem.parent, currentPartStart );
						const wordEnd = model.createPositionAt( textItem.parent, currentPartEnd );
						writer.addMarker( markerName, {
							usingOperation: false,
							affectsData: false,
							range: model.createRange( wordStart, wordEnd )
						} );

						// TODO: maybe we should include 'sentiment' or 'vividness' (etc) in the marker name, to help
						// with clearning some markers but not others, when the various highliters are toggled off and on. 
						this._resultsMap.set( markerName, analysis );

					}
				}

				currentPartOffset += currentPart.length;
			}
		});
	}

	_shouldHighlightWord( analysis ) {
		if (analysis) {
			if (this.isVividnessOn && analysis.vividness) {
				return true;
			}
			if (this.isSentimentOn && analysis.sentiment) {
				return true;
			}
			if (analysis.partOfSpeech) {
				const pos = analysis.partOfSpeech.type;
				if (this.isPassiveVoiceOn && analysis.partOfSpeech.type === "PASSIVE") {
					return true;
				}
				if (this.isAdverbsOn && analysis.partOfSpeech.type === "ADVERB") {
					return true;
				}
			}
		}
		return false;
	}

	 _clearAllMarkers() {
		const model = this.editor.model;

		this._removeMarkersInRange( model.createRangeIn( model.document.getRoot() ) );

		this._resultsMap.clear();
		this._lastMarkerId = 0;
	}

	_removeMarkersInRange( range ) {
		const model = this.editor.model;
		let modifiedRange = null;

		// @todo: this helps with typing at the end/beginning of existing marker. But such implementation have a risk of invalid offsets.
		try {
			if ( range.start.textNode && range.start.compareWith( model.createPositionBefore( range.start.textNode ) ) == 'after' ) {
					range = model.createRange(
						range.start.getShiftedBy( -1 ),
						range.end
					);
			}
		} catch ( err ) {
		}

		try {
			if ( range.end.textNode && range.end.compareWith( model.createPositionAfter( range.end.textNode ) ) == 'before' ) {
				// Checks whether end position is in text node, and whether it's before the end of this text node.
				range = model.createRange(
					range.start,
					range.end.getShiftedBy( 1 )
				);
			}
		} catch ( err ) {
		}

		for ( const marker of model.markers.getMarkersIntersectingRange( range ) ) {
			if ( marker.name.startsWith( MARKER_PREFIX ) ) {
				if ( !modifiedRange ) {
					modifiedRange = marker.getRange();
				} else {
					modifiedRange = modifiedRange.getJoined( marker.getRange() );
				}

				model.change( writer => {
					writer.removeMarker( marker );

					// We can't delete the analysis data from resultsMap synchronously, as this method might be executed within
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
		if ( !this.isAnyOn ) {
			return;
		}

		const model = this.editor.model;
		const changes = Array.from( model.document.differ.getChanges() );

		for ( const entry of changes ) {
			if ( [ 'insert', 'remove' ].includes( entry.type ) == false ) {
				continue;
			}

			let range = model.createRange(
				entry.position,
				// Expand selection only in case of addition (in case of removing it doesn't make sense as the content was removed).
				entry.type == 'insert' ? entry.position.getShiftedBy( entry.length ) : entry.position
			);

			range = this._expandRangeToWord( range );

			// In any case first remove markers in modified range.
			const removedRange = this._removeMarkersInRange( range );

			// Search modified content for any highlightable items.
			this._doCheck( removedRange ? range.getJoined( removedRange ) : range );
		}
	}

	/**
	 * Expands a given range to contain whole word.
	 *
	 * Examples:
	 * ```
	 * foo ba[aa]ar baz   ----> foo [baaaar] baz
	 * [f]oo ba[aa]ar baz   ----> [foo] baaaar baz
	 * [foo] ba[aa]ar baz   ----> [foo] baaaar baz
	 * ```
	 */
	_expandRangeToWord( range ) {
		const positions = {
			start: range.start.clone(),
			end: range.end.clone()
		};

		// Expanding left.
		const startTextNode = range.start.textNode;
		if ( startTextNode ) {
			const charsToCheck = range.start.offset - startTextNode.startOffset;
			let charsToShift = 0;

			// Iterate characters one by one as long as there is no word separator.
			for ( let i = charsToCheck; i > 0; i-- ) {
				if ( startTextNode.data[ i - 1 ].match( WORD_SEPARATOR_PATTERN ) ) {
					break;
				} else {
					charsToShift++;
				}
			}

			if ( charsToShift ) {
				positions.start = range.start.getShiftedBy( charsToShift * -1 );
			}
		}

		// Expanding right.
		const endTextNode = range.end.textNode;
		if ( endTextNode ) {
			const charsToCheck = endTextNode.endOffset - range.end.offset;
			let charsToShift = 0;

			// Iterate characters one by one as long as there is no word separator.
			for ( let i = 0; i < charsToCheck; i++ ) {
				if ( endTextNode.data[ range.end.offset - endTextNode.startOffset + i ].match( WORD_SEPARATOR_PATTERN ) ) {
					break;
				} else {
					charsToShift++;
				}
			}

			if ( charsToShift ) {
				positions.end = range.end.getShiftedBy( charsToShift );
			}
		}

		return new Range( positions.start, positions.end );
	}
}
