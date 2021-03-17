
import { ShaxpirSentimentCommand } from './../src/plugins/ShaxpirSentimentCommand';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'HighlightEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, Input ],
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
		editor.destroy();
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

	describe( 'typing in a existing marker', () => {
		it( 'adds a new marker to a single letter', () => {
			setModelData( model, '<paragraph>foo [] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'f' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>f<sentiment-marker:3:end></sentiment-marker:3:end> ' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>baz<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );
		} );

		it( 'adds a new marker to a multiple letters', () => {
			setModelData( model, '<paragraph>foo [] baz</paragraph>' );
			editor.execute( 'shaxpirSentiment' );

			editor.execute( 'input', { text: 'cke' } );

			assertMarkers( 3, '<paragraph>' +
				'<sentiment-marker:1:start></sentiment-marker:1:start>foo<sentiment-marker:1:end></sentiment-marker:1:end> ' +
				'<sentiment-marker:3:start></sentiment-marker:3:start>cke<sentiment-marker:3:end></sentiment-marker:3:end> ' +
				'<sentiment-marker:2:start></sentiment-marker:2:start>baz<sentiment-marker:2:end></sentiment-marker:2:end>' +
				'</paragraph>' );
		} );
	} );

	function assertMarkers( expectedCount, expectedModelDataWithMarkers ) {
		const markers = [ ...model.markers ];

		expect( markers.length, 'markers count' ).to.be.equal( expectedCount );

		expect( getModelData( model, {
			withoutSelection: true,
			convertMarkers: true
		} ) ).to.eql( expectedModelDataWithMarkers );
	}
} );
