import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/css/linguistic-tooltip.css';

const DEFAULT_PARTOFSPEECH_COLOR = "#000";
const DEFAULT_PARTOFSPEECH_LABEL = "ANALYSIS";
const DEFAULT_PARTOFSPEECH_DISPLAY = "none";

const DEFAULT_SENTIMENT_COLOR = "#000";
const DEFAULT_SENTIMENT_LABEL = "Sentiment Neutral";
const DEFAULT_SENTIMENT_SCORE = 5.5;
const DEFAULT_SENTIMENT_DISPLAY = "none";

const DEFAULT_VIVIDNESS_COLOR = "#000";
const DEFAULT_VIVIDNESS_LABEL = "Not Vivid";
const DEFAULT_VIVIDNESS_SCORE = 0.0;
const DEFAULT_VIVIDNESS_DISPLAY = "none";

export default class LinguisticTooltipView extends View {

  constructor(locale) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    const bind = this.bindTemplate;

    this.set('partOfSpeechLabel', DEFAULT_PARTOFSPEECH_LABEL);
    this.set('partOfSpeechColor', DEFAULT_PARTOFSPEECH_COLOR);
    this.set('partOfSpeechDisplay', DEFAULT_PARTOFSPEECH_DISPLAY);
    
    this.set('sentimentLabel', DEFAULT_SENTIMENT_LABEL);
    this.set('sentimentScore', DEFAULT_SENTIMENT_SCORE);
    this.set('sentimentColor', DEFAULT_SENTIMENT_COLOR);
    this.set('sentimentDisplay', DEFAULT_SENTIMENT_DISPLAY);

    this.set('vividnessLabel', DEFAULT_VIVIDNESS_LABEL);
    this.set('vividnessScore', DEFAULT_VIVIDNESS_SCORE);
    this.set('vividnessColor', DEFAULT_VIVIDNESS_COLOR);
    this.set('vividnessDisplay', DEFAULT_VIVIDNESS_DISPLAY);
    
    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-linguistic-tooltip' ]
      },
      children: [

        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('partOfSpeechColor', c => 'color:' + c ),
              ";",
              bind.to('partOfSpeechDisplay', d => 'display:' + d)
            ],
            class: [ 'ck', 'ck-linguistic-tooltip-details' ],
          },
          children: [
            { text : bind.to( 'partOfSpeechLabel' ) }
          ]
        },

        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('sentimentColor', c => 'color:' + c ),
              ";",
              bind.to('sentimentDisplay', d => 'display:' + d)
            ],
            class: [ 'ck', 'ck-linguistic-tooltip-details' ],
          },
          children: [
            { text : bind.to( 'sentimentLabel' ) },
            { text : ": " },
            { text: bind.to( 'sentimentScore' ) }
          ]
        },

        {
          tag: 'div',
          attributes: {
            style: [
              bind.to('vividnessColor', c => 'color:' + c ),
              ";",
              bind.to('vividnessDisplay', d => 'display:' + d)
            ],
            class: [ 'ck', 'ck-linguistic-tooltip-details' ],
          },
          children: [
            { text : bind.to( 'vividnessLabel' ) },
            { text : ": " },
            { text: bind.to( 'vividnessScore' ) }
          ]
        }
      ]
    });
  }

  setAnalysisDetails(command, analysis) {
    if (analysis.partOfSpeech && (command.isPassiveVoiceOn || command.isAdverbsOn)) {
      this.partOfSpeechLabel = analysis.partOfSpeech.label;
      this.partOfSpeechColor = analysis.partOfSpeech.color;
      this.partOfSpeechDisplay = 'block';
    } else {
      this.partOfSpeechLabel = DEFAULT_PARTOFSPEECH_LABEL;
      this.partOfSpeechColor = DEFAULT_PARTOFSPEECH_COLOR;
      this.partOfSpeechDisplay = DEFAULT_PARTOFSPEECH_DISPLAY;
    }
    if (command.isSentimentOn && analysis.sentiment) {
      this.sentimentLabel = analysis.sentiment.label;
      this.sentimentColor = analysis.sentiment.color;
      this.sentimentScore = analysis.sentiment.score;
      this.sentimentDisplay = 'block';
    } else {
      this.sentimentLabel = DEFAULT_SENTIMENT_LABEL;
      this.sentimentScore = DEFAULT_SENTIMENT_SCORE;
      this.sentimentColor = DEFAULT_SENTIMENT_COLOR;
      this.sentimentDisplay = DEFAULT_SENTIMENT_DISPLAY;
    }
    if (command.isVividnessOn && analysis.vividness) {
      this.vividnessLabel = analysis.vividness.label;
      this.vividnessColor = analysis.vividness.color;
      this.vividnessScore = analysis.vividness.score;
      this.vividnessDisplay = 'block';
    } else {
      this.vividnessLabel = DEFAULT_VIVIDNESS_LABEL;
      this.vividnessColor = DEFAULT_VIVIDNESS_COLOR;
      this.vividnessScore = DEFAULT_VIVIDNESS_SCORE;
      this.vividnessDisplay = DEFAULT_VIVIDNESS_DISPLAY;
    }
  }
}
