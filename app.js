let GLOBALS = {};

$(document).ready(function(){
  DecoupledEditor
    .create(
      document.querySelector('#editor'),
      {

        themes : {
          currentValueGetter : () => { return GLOBALS.theme || "Atwood"; },
          currentValueSetter : (value) => {
            console.log(`Changing theme from ${GLOBALS.theme} to ${value}`);
            GLOBALS.theme = value;
          },
          choices : [ "Atwood", "Salinger", "Vonnegut", "Shelley", "Deveraux", "Bradbury", "Lovecraft" ]
        },

        typefaces : {
          currentValueGetter : () => { return GLOBALS.typeface || "Minion Pro"; },
          currentValueSetter : (value) => {
            console.log(`Changing typeface from ${GLOBALS.typeface} to ${value}`);
            GLOBALS.typeface = value;
          },
          choices : [ "Alegreya", "Avro", "Courier", "Crimson Text", "Lora", "Minion Pro", "Noto Serif", "Rokkitt", "Vollkorn" ]
        },

        typesizes : {
          currentValueGetter : () => { return GLOBALS.typesize || "Medium"; },
          currentValueSetter : (value) => {
            console.log(`Changing typesize from ${GLOBALS.typesize} to ${value}`);
            GLOBALS.typesize = value;
          },
          choices : [ "Huge", "Large", "Medium", "Small", "Tiny" ]
        },

        thesaurus : {
          getSuggestionsForText : fakeThesaurusCallback
        },

        sentiment : {
          getSentimentForWord : fakeSentimentCallback
        },

        syncStatus : {
          withSyncStatus : fakeSyncStatusCallback
        }
      }
    )
    .then((editor) => {
      // Attach toolbar
      document.querySelector('div#toolbar').appendChild(editor.ui.view.toolbar.element);
      console.log("CREATED EDITOR");
    })
    .catch((error) => {
      console.log("ERROR CREATING EDITOR: " + error);
    }
  );
});

function fakeThesaurusCallback(text) {
  console.log(`thesaurus, getting suggestions for text: ${text}`);
  if (text == "zip") {
    return [ "zap", "zop", "zoop" ];
  } else if (text == "ding") {
    return [ "dang", "dong", "dung" ];
  }
  return [];
}

const INTENSE_BLUE = "#2600ff";
const PALE_BLUE = "#b3a6ff";
const INTENSE_RED = "#ff0000";
const PALE_RED = "#ffa6a6";

function fakeSentimentCallback(word) {
  console.log(`sentiment, getting score for word: ${word}`);
  word = word.trim().toLowerCase();
  switch (word) {
    case "joy" : return { "score" : 9.8, "label" : "Strongly Positive", "color" : INTENSE_BLUE };
    case "happy" : return { "score" : 7.2, "label" : "Moderately Positive", "color" : PALE_BLUE };
    case "sad" : return { "score" : 3.5, "label" : "Moderately Negative", "color" : PALE_RED };
    case "pain" : return { "score" : 1.2, "label" : "Strongly Negative", "color" : INTENSE_RED };
  }
  return null;
}

let start = new Date();
function fakeSyncStatusCallback(callback) {
  let now = new Date();
  let elapsed = Math.round((now - start) / 1000);
  let uploadCount = Math.max(0, 10 - Math.round(elapsed / 3));
  let downloadCount = Math.max(0, 6 - Math.round(elapsed / 4));
  let status = {
    connection : "Online",
    lastSync : elapsed + " Seconds Ago"
  };
  if (uploadCount > 0) {
    status.uploading = uploadCount + " picture" + (uploadCount > 1 ? "s" : "");
  }
  if (downloadCount > 0) {
    status.downloading = downloadCount + " picture" + (downloadCount > 1 ? "s" : "");
  }
  callback(status);
}

function getHighlightsForText(text) {
  
}