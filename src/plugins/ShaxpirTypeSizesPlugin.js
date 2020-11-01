import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import icon from '../../theme/icons/typesizes.svg';

export class ShaxpirTypeSizesPlugin extends Plugin {

  constructor(editor) {
    super(editor);
    let pluginConfig = editor.config.get('typesizes') || {};
    this._choices = pluginConfig.choices;
    this._currentValueGetter = pluginConfig.currentValueGetter || function() { return null; };
    this._currentValueSetter = pluginConfig.currentValueSetter || function(value) {};
  }

  static get pluginName() {
    return "ShaxpirTypeSizes";
  }

  init() {
    console.log("ShaxpirTypeSizes plugin was initialized");

    const editor = this.editor;
    const componentFactory = editor.ui.componentFactory;
    const t = editor.t;

    // Create a button for each of the choices
    this._choices.forEach(choice => this._addButton(choice));

    // Create a drowdown view to contain all these buttons
    componentFactory.add('typesizes', locale => {

      // Create the dropdown itself
      const dropdownView = createDropdown(locale);

      // Add buttons to the dropdown
      const buttons = this._choices.map(choice => componentFactory.create(`typesizes:${choice}`));
      addToolbarToDropdown(dropdownView, buttons);

      // Create a toolbar button for this dropdown
      dropdownView.buttonView.set({
        label: t('Type Sizes'),
        icon : icon,
        tooltip: true
      });

      dropdownView.toolbarView.isVertical = true;
      dropdownView.toolbarView.ariaLabel = t('Type Sizes');

      // TODO: this isn't working yet, but it should set the drowdown to open ABOVE the toolbar...
      dropdownView.panelView.position = 'ne';

      // TODO: The active choice should be highlighted as "selected" whenever the dropdown is revealed.
      // The current choice can be retrieved anytime by calling `this._currentValueGetter()`

      return dropdownView;
    });
  }

  _addButton(choice) {
    const editor = this.editor;

    editor.ui.componentFactory.add(`typesizes:${choice}`, locale => {

      const buttonView = new ButtonView(locale);
      buttonView.set( {
        label: choice,
        withText: true,
        tooltip: false,
        isToggleable: true
      });

      this.listenTo(buttonView, 'execute', () => {
        this._currentValueSetter(choice);
      });

      return buttonView;
    });
  }
}
