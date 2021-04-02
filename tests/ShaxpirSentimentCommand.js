
import { ShaxpirSentimentCommand } from './../src/plugins/ShaxpirSentimentCommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightEditing', () => {
	let editor, model, editableElement;

	beforeEach( () => {
		editableElement = document.createElement( 'div' );
		document.body.appendChild( editableElement );

		return ClassicEditor
			.create( editableElement, {
				plugins: [ Paragraph, Input, Delete ],
				sentiment: {
					getSentimentForWord: sinon.stub().returns( {
						score: 7.2,
						label: 'moderately positive',
						color: '#6eb66e'
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

		it( 'creates only one marker when typed multiple letters', () => {
			setModelData( model, '<paragraph>[]</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'a' } );
			editor.execute( 'input', { text: 'b' } );
			editor.execute( 'input', { text: 'c' } );

			assertMarkers( 1, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>abc<sentiment-marker:1:end></sentiment-marker:1:end>' +
				'</paragraph>' );

			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'a' );
			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'ab' );
			sinon.assert.calledWith( editor.config.get( 'sentiment' ).getSentimentForWord, 'abc' );
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
