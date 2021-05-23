import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import '../../theme/css/linguistic-tooltip.css';

const DEFAUL_COLOR = "#000";
const DEFAULT_DISPLAY = "none";

const DEFAULT_PARTOFSPEECH_LABEL = "ANALYSIS";

const DEFAULT_SENTIMENT_LABEL = "Sentiment Neutral";
const DEFAULT_VIVIDNESS_LABEL = "Not Vivid";

const DEFAULT_SENTIMENT_SCORE = 5.5;
const DEFAULT_VIVIDNESS_SCORE = 0.0;

export default class LinguisticTooltipView extends View {

  constructor(locale) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();
    const bind = this.bindTemplate;

    this.set('partOfSpeechLabel', DEFAULT_PARTOFSPEECH_LABEL);
    this.set('partOfSpeechColor', DEFAUL_COLOR);
    this.set('partOfSpeechDisplay', DEFAULT_DISPLAY);
    
    this.set('sentimentLabel', DEFAULT_SENTIMENT_LABEL);
    this.set('sentimentScore', DEFAULT_SENTIMENT_SCORE);
    this.set('sentimentColor', DEFAUL_COLOR);
    this.set('sentimentDisplay', DEFAULT_DISPLAY);

    this.set('vividnessLabel', DEFAULT_VIVIDNESS_LABEL);
    this.set('vividnessScore', DEFAULT_VIVIDNESS_SCORE);
    this.set('vividnessColor', DEFAUL_COLOR);
    this.set('vividnessDisplay', DEFAULT_DISPLAY);
    
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
    // Set all values to their defaults
    this.partOfSpeechLabel = DEFAULT_PARTOFSPEECH_LABEL;
    this.partOfSpeechColor = DEFAUL_COLOR;
    this.partOfSpeechDisplay = DEFAULT_DISPLAY;
    this.sentimentLabel = DEFAULT_SENTIMENT_LABEL;
    this.sentimentScore = DEFAULT_SENTIMENT_SCORE;
    this.sentimentColor = DEFAUL_COLOR;
    this.sentimentDisplay = DEFAULT_DISPLAY;
    this.vividnessLabel = DEFAULT_VIVIDNESS_LABEL;
    this.vividnessColor = DEFAUL_COLOR;
    this.vividnessScore = DEFAUL_COLOR;
    this.vividnessDisplay = DEFAULT_DISPLAY;
    // Set values for the highlight rules we actually care about.
    if (analysis.partOfSpeech && (command.isPassiveVoiceOn || command.isAdverbsOn)) {
      this.partOfSpeechLabel = analysis.partOfSpeech.label;
      this.partOfSpeechColor = analysis.partOfSpeech.color;
      this.partOfSpeechDisplay = 'block';
    }
    if (command.isSentimentOn && analysis.sentiment) {
      this.sentimentLabel = analysis.sentiment.label;
      this.sentimentColor = analysis.sentiment.color;
      this.sentimentScore = analysis.sentiment.score;
      this.sentimentDisplay = 'block';
    }
    if (command.isVividnessOn && analysis.vividness) {
      this.vividnessLabel = analysis.vividness.label;
      this.vividnessColor = analysis.vividness.color;
      this.vividnessScore = analysis.vividness.score;
      this.vividnessDisplay = 'block';
    }
  }
}
