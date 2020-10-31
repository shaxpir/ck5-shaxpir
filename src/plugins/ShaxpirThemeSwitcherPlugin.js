import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import themesIcon from '../../theme/icons/themes.svg';
import typeFacesIcon from '../../theme/icons/typefaces.svg';
import typeSizesIcon from '../../theme/icons/typesizes.svg';

export class ShaxpirThemeSwitcherPlugin extends Plugin {
  init() {
    console.log('ShaxpirThemeSwitcherPlugin was initialized');

    const editor = this.editor;

    editor.ui.componentFactory.add('themes', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Themes',
          icon : themesIcon,
          tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });

    editor.ui.componentFactory.add('typefaces', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Typefaces',
          icon : typeFacesIcon,
          tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });

    editor.ui.componentFactory.add('typesizes', locale => {

      const view = new ButtonView(locale);

      view.set({
        label : 'Type Sizes',
          icon : typeSizesIcon,
          tooltip : true
      });

      // Callback executed once the button is clicked.
      view.on('execute', () => {
        // TODO
      });

      return view;
    });
  }
}
