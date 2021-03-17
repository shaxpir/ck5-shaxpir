/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import { ShaxpirSentimentPlugin } from '../../src/plugins/ShaxpirSentimentPlugin';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, ShaxpirSentimentPlugin ],
		toolbar: [
			'sentiment',
			'sentimentToggle',
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		sentiment: {
			getSentimentForWord: word => {
				if ( word == 'item' ) {
					return {
						score: 9.2,
						label: 'very positive',
						color: '#1e701e'
					};
				} else if ( word == 'Quote' ) {
					return {
						score: 3.5,
						label: 'negative',
						color: '#f4baba'
					};
				} else if ( word.match( /^[\d]+$/ ) ) {
					return null;
				} else {
					return {
						score: 7.2,
						label: 'moderately positive',
						color: '#6eb66e'
					};
				}
			}
		},
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
		editor.execute( 'shaxpirSentiment' );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
