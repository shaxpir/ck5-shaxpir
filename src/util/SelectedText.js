export default class SelectedText { 

  static collect(editor) {
    let result = "";
    let selection = editor.model.document.selection;
    let range = selection.getFirstRange();
    for (const item of range.getItems()) {
      if (item.is('textProxy')) {
        result = result + item.data;
      }
    }
    return result;
  }

  static replace(editor, replacementText) {
    const model = editor.model;
    const selection = model.document.selection;
    const currentText = SelectedText.collect(editor);
    // TODO: the replacement can be misplaced if the selection has moved. Use the relevant marker instead.
    const replacePosition = selection.getFirstRange().start;
    const replaceRange = model.createRange( replacePosition, replacePosition.getShiftedBy(currentText.length));
    const textNode = replacePosition.textNode
      ? replacePosition.textNode
      : replacePosition.nodeAfter;
    const attributes = textNode.getAttributes();
    model.enqueueChange( writer => {
      model.insertContent( writer.createText( replacementText, attributes ), replaceRange );
    });
  }

}