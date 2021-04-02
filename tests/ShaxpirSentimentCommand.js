
import { ShaxpirSentimentCommand } from './../src/plugins/ShaxpirSentimentCommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import { Enter, ShiftEnter } from 'ckeditor5/src/enter';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { parse, stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightEditing', () => {
	let editor, model, editableElement;

	beforeEach( () => {
		editableElement = document.createElement( 'div' );
		document.body.appendChild( editableElement );

		return ClassicEditor
			.create( editableElement, {
				plugins: [ Paragraph, Input, Delete, Enter, ShiftEnter ],
				sentiment: {
					getSentimentForWord: sinon.spy( word => {
						if ( word != 'ignore' ) {
							return {
								score: 7.2,
								label: 'moderately positive',
								color: '#6eb66e'
							};
						}
					} )
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;

				editor.commands.add( 'shaxpirSentiment', new ShaxpirSentimentCommand( editor ) );
			} );
	} );

	afterEach( () => {
		editor.destroy().then( () => {
			editableElement.remove();
		} );
	} );

	describe( 'execute()', () => {
		let command;

		beforeEach( () => {
			setModelData( model, '<paragraph>foo bar baz</paragraph>' );
			command = editor.commands.get( 'shaxpirSentiment' );
		} );

		it( 'matches all when the command is first enabled', () => {
			editor.execute( 'shaxpirSentiment' );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>bar<sentiment-marker:2:end></sentiment-marker:2:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>baz<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );
		} );

		it( 'removes the marker when toggled (turned off)', () => {

			editor.execute( 'shaxpirSentiment' );
			editor.execute( 'shaxpirSentiment' );

			expect( getModelData( model, {
				withoutSelection: true,
				convertMarkers: true
			} ) ).to.eql( '<paragraph>foo bar baz</paragraph>' );
		} );

		it( 'sets isEnabled when first turned on', () => {
			editor.execute( 'shaxpirSentiment' );
			expect( command.isOn ).to.be.true;
		} );

		it( 'unsets isEnabled when toggled', () => {
			editor.execute( 'shaxpirSentiment' );
			editor.execute( 'shaxpirSentiment' );
			expect( command.isOn ).to.be.false;
		} );
	} );

	describe( 'typing', () => {
		it( 'adds a new marker for a single letter', () => {
			setModelData( model, '<paragraph>foo [] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'f' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>f<sentiment-marker:3:end></sentiment-marker:3:end> ' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>baz<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );
		} );

		it( 'adds a new marker for multiple letters', () => {
			setModelData( model, '<paragraph>foo [] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'cke' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>cke<sentiment-marker:3:end></sentiment-marker:3:end> ' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>baz<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );
		} );

		it( 'works in the middle of sentiment', () => {
			setModelData( model, '<paragraph>foo 22[]22 baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'b' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:4:start></sentiment-marker:4:start>22b22<sentiment-marker:4:end></sentiment-marker:4:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>baz<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, '22b22' );
		} );

		it( 'works when typed at the end of existing sentiment', () => {
			setModelData( model, '<paragraph>foo 22[] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'b' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:4:start></sentiment-marker:4:start>22b<sentiment-marker:4:end></sentiment-marker:4:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>baz<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, '22b' );
		} );

		it( 'works when typed at the beginning of existing sentiment', () => {
			setModelData( model, '<paragraph>foo []22 baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'b' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:4:start></sentiment-marker:4:start>b22<sentiment-marker:4:end></sentiment-marker:4:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>baz<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'b22' );
		} );

		it( 'works when typed into an empty paragraph', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );

			assertMarkers( 1, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>a<sentiment-marker:1:end></sentiment-marker:1:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'a' );
		} );

		it( 'works when multiple letters typed into an empty paragraph', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );
			editor.execute( 'input', { text: 'b' } );

			assertMarkers( 1, '<paragraph>' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>ab<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'a' );
		} );

		it( 'works when typed after ignored word', () => {
			setModelData( model, '<paragraph>ignore ignore[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );

			assertMarkers( 1, '<paragraph>' +
				'ignore ' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>ignorea<sentiment-marker:1:end></sentiment-marker:1:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'ignorea' );
		} );

		it( 'works when typed before ignored word', () => {
			setModelData( model, '<paragraph>ignore []ignore</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );

			assertMarkers( 1, '<paragraph>' +
				'ignore ' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>aignore<sentiment-marker:1:end></sentiment-marker:1:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'aignore' );
		} );

		it( 'creates only one marker when typed multiple letters', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );
			editor.execute( 'input', { text: 'b' } );
			editor.execute( 'input', { text: 'c' } );

			// @todo: would be nice to improve it in a way, so that marker numbering is reset.
			// So that instead sentiment-marker:3:start it's sentiment-marker:1:start.
			assertMarkers( 1, '<paragraph>' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>abc<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'a' );
			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'ab' );
			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'abc' );
		} );
	} );

	describe( 'mixed text nodes attribute', () => {
		// This test suite checks whether a single word, split into multiple text items (e.g. due
		// to fact that part of it is formatted) is handled properly.

		it.skip( 'works with half of a word bolded', () => {
			// This is not yet supported.
			setModelData( model, '<paragraph><$text bold="true">foo</$text>ba[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );
			console.log( getModelData( model ) );

			editor.execute( 'input', { text: 'r' } );

			assertMarkers( 1, '<paragraph>' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>abc<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'fooba' );
			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'foobar' );
		} );
	} );

	describe( 'removing content', () => {
		it( 'removing fully selected sentiment word removes associated marker', () => {
			setModelData( model, '<paragraph>foo [bar] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'delete' );

			assertMarkers( 2, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end>  ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>baz<sentiment-marker:3:end></sentiment-marker:3:end>' +
				'</paragraph>' );
		} );

		it( 'backspace after highlighted single letter word removes the marker', () => {
			setModelData( model, '<paragraph>foo b[] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'delete' );

			assertMarkers( 2 );
		} );

		it( 'forward delete before highlighted single letter word removes the marker', () => {
			setModelData( model, '<paragraph>foo []b baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'forwardDelete' );

			assertMarkers( 2 );
		} );

		it( 'backspace at the end of an editable', () => {
			setModelData( model, '<paragraph>foo bar[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'delete' );

			assertMarkers( 2 );
		} );

		it( 'backspace to empty content', () => {
			setModelData( model, '<paragraph>f[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'delete' );

			// assertMarkers( 0 );
		} );
	} );

	describe( 'integration', () => {
		it( 'can type after soft break', () => {
			setModelData( model, '<paragraph>foo<softBreak></softBreak>[] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', {
				text: 'f'
			} );

			assertMarkers( 3 );
		} );
	} );

	describe( '_expandRangeToWord', () => {
		let command;

		beforeEach( () => {
			command = editor.commands.get( 'shaxpirSentiment' );
		} );

		it( 'doesn\'t change range where whole word is selected', () => {
			setModelData( model, '<paragraph>[foo] bar</paragraph>' );

			const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

			expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>[foo] bar</paragraph>' );
		} );

		it( 'works with empty surrounding', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );

			const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

			expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>[]</paragraph>' );
		} );

		it( 'works at the end of an element', () => {
			setModelData( model, '<paragraph>t[]</paragraph>' );

			const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

			expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>t[]</paragraph>' );
		} );

		describe( 'expanding left', () => {
			it( 'expands to left', () => {
				setModelData( model, '<paragraph>foo ba[r] baz</paragraph>' );

				const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

				expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>foo [bar] baz</paragraph>' );
			} );

			it( 'doesnt expand left on space', () => {
				setModelData( model, '<paragraph>foo bar [baz]</paragraph>' );

				const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

				expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>foo bar [baz]</paragraph>' );
			} );
		} );

		describe( 'expanding right', () => {
			it( 'expands to right', () => {
				setModelData( model, '<paragraph>foo [b]ar baz</paragraph>' );

				const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

				expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>foo [bar] baz</paragraph>' );
			} );

			it( 'doesnt expand right on space', () => {
				setModelData( model, '<paragraph>foo [bar] baz</paragraph>' );

				const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

				expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>foo [bar] baz</paragraph>' );
			} );

			it( 'expands to right edge case', () => {
				setModelData( model, '<paragraph>ignore []ignore</paragraph>' );

				const range = command._expandRangeToWord( model.document.selection.getFirstRange() );

				expect( stringify( model.document.getRoot(), range ) ).to.eql( '<paragraph>ignore [ignore]</paragraph>' );
			} );
		} );
	} );

	function assertMarkers( expectedCount, expectedModelDataWithMarkers ) {
		const markers = [ ...model.markers ];

		expect( markers.length, 'marker count' ).to.be.equal( expectedCount );

		if ( expectedModelDataWithMarkers ) {
			expect( getModelData( model, {
				withoutSelection: true,
				convertMarkers: true
			} ) ).to.eql( expectedModelDataWithMarkers );
		}
	}
} );
