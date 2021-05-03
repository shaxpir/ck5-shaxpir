/*
   NOTE:

   This file was copied from here...

     https://github.com/ckeditor/ckeditor5-build-decoupled-document/blob/master/src/ckeditor.js
   
   ...but I added 'HorizontalLine', 'TodoList', and 'WordCount' plugins, and re-ordered the toolbar buttons
 */

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';

import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';

import { ShaxpirLinguisticHighlightPlugin } from './plugins/ShaxpirLinguisticHighlightPlugin.js';
import { ShaxpirSentimentPlugin } from './plugins/ShaxpirSentimentPlugin.js';
import { ShaxpirSyncStatusPlugin } from './plugins/ShaxpirSyncStatusPlugin.js';
import { ShaxpirThemeSwitcherPlugin } from './plugins/ShaxpirThemeSwitcherPlugin.js';
import { ShaxpirTypeFacesPlugin } from './plugins/ShaxpirTypeFacesPlugin.js';
import { ShaxpirTypeSizesPlugin } from './plugins/ShaxpirTypeSizesPlugin.js';
import { ShaxpirThesaurusPlugin } from './plugins/ShaxpirThesaurusPlugin.js';

export default class DecoupledEditor extends DecoupledEditorBase {}

// TODO: external UI
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/external-ui.html

// NOTE: document edtior?
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/document-editor.html

// TODO: multi-root editor
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/custom-editor-creator.html

// TODO: theme customization
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/theme-customization.html

// LEARN MORE ABOUT: focus-tracking
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/focus-tracking.html

// LEARN MORE ABOUT: widgets
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/ui/widget-internals.html

// CUSTOMIZING EDITOR OUTPUT
// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/conversion/conversion-extending-output.html

// Plugins to include in the build.
DecoupledEditor.builtinPlugins = [
  Essentials,
  Alignment,
  FontSize,
  FontFamily,
  FontColor,
  FontBackgroundColor,
  UploadAdapter,
  Autoformat,
  Bold,
  Italic,
  Strikethrough,
  Underline,
  BlockQuote,
  CKFinder,
  CloudServices,
  EasyImage,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  TextTransformation,
  TodoList,
  WordCount,

  ShaxpirSentimentPlugin,
  ShaxpirSyncStatusPlugin,
  ShaxpirThemeSwitcherPlugin,
  ShaxpirTypeFacesPlugin,
  ShaxpirTypeSizesPlugin,
  ShaxpirThesaurusPlugin,
  ShaxpirLinguisticHighlightPlugin,
];

// Editor configuration.
DecoupledEditor.defaultConfig = {
  toolbar: {
    items: [
      'highlight', 'vividness', 'spellcheck', 'sentimentToggle',
      '|',
      'thesaurus',
      '|',
      'syncStatus', 'themes', 'typefaces', 'typesizes',
      '|',
      'heading',
      '|',
      'bold', 'italic', 'underline', 'strikethrough',  'subscript',  'superscript',
      '|',
      'alignment',
      '|',
      'indent', 'outdent', 'numberedList', 'bulletedList', 'todoList', 'blockquote', 'horizontalLine',
      '|',
      /*
      'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor',
      '|',
      */
      'link', 'imageUpload', 'insertTable',
      '|',
      /*
      'mediaEmbed',
      '|'
      */
     'undo', 'redo'
    ]
  },
  image: {
    styles: [
      'full',
      'alignLeft',
      'alignRight'
    ],
    toolbar: [
      'imageStyle:alignLeft',
      'imageStyle:full',
      'imageStyle:alignRight',
      '|',
      'imageTextAlternative'
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: 'en'
};