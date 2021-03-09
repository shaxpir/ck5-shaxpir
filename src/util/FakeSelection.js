export default class FakeSelection { 

  static init(editor, markerName) {
    // Renders a fake visual selection marker on an expanded selection.
    editor.conversion.for('editingDowncast').markerToHighlight({
      model: markerName,
      view: {
        classes: [ `ck-fake-${markerName}-selection` ]
      }
    });
  
    // Renders a fake visual selection marker on a collapsed selection.
    editor.conversion.for('editingDowncast').markerToElement({
      model: markerName,
      view: {
        name: 'span',
        classes: [
          `ck-fake-${markerName}-selection`,
          `ck-fake-${markerName}-selection-collapsed`
        ]
      }
    });
  }

  static getBalloonPositionData(editor, markerName) {
    const view = editor.editing.view;
    const model = editor.model;
    const viewDocument = view.document;
    let target = null;
    if (model.markers.has(markerName)) {
      // Create the highlight selection using a marker
      const markerViewElements = Array.from(editor.editing.mapper.markerNameToElements(markerName));
      const newRange = view.createRange(
        view.createPositionBefore(markerViewElements[ 0 ]),
        view.createPositionAfter(markerViewElements[ markerViewElements.length - 1 ])
      );
      target = view.domConverter.viewRangeToDom(newRange);
    } else {
      // Create the highlight selection using the current selection range.
      const range = viewDocument.selection.getFirstRange();
      target = view.domConverter.viewRangeToDom(range);
    }

    return { target };
  }

  static showFakeVisualSelection(editor, markerName) {
    const model = editor.model;
    model.change(writer => {
      const range = model.document.selection.getFirstRange();
      if (model.markers.has(markerName)) {
        writer.updateMarker(markerName, { range });
      } else {
        if (range.start.isAtEnd) {
          const focus = model.document.selection.focus;
          const nextValidRange = FakeSelection.getNextValidRange(range, focus, writer);
          writer.addMarker(markerName, {
            usingOperation: false,
            affectsData: false,
            range: nextValidRange
          });
        } else {
          writer.addMarker(markerName, {
            usingOperation: false,
            affectsData: false,
            range
          });
        }
      }
    });
  }

  // Returns next valid range for the fake visual selection marker.
  static getNextValidRange(range, focus, writer) {
    const nextStartPath = [ range.start.path[0] + 1, 0 ];
    const nextStartPosition = writer.createPositionFromPath(range.start.root, nextStartPath, 'toNext');
    const nextRange = writer.createRange(nextStartPosition, range.end);
    if (nextRange.start.path[ 0 ] > range.end.path[ 0 ]) {
      return writer.createRange(focus);
    }
    if (nextStartPosition.isAtStart && nextStartPosition.isAtEnd) {
      return FakeSelection.getNextValidRange(nextRange, focus, writer);
    }
    return nextRange;
  }

  static hideFakeVisualSelection(editor, markerName) {
    const model = editor.model;
    if (model.markers.has(markerName)) {
      model.change(writer => {
        writer.removeMarker(markerName);
      });
    }
  }

}