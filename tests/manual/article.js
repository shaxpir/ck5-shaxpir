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
						color: 'green'
					};
				} else if ( word == 'Quote' ) {
					return {
						score: 3.5,
						label: 'negative',
						color: 'lightred'
					};
				} else {
					return {
						score: 7.2,
						label: 'moderately positive',
						color: 'darkgreen'
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );
