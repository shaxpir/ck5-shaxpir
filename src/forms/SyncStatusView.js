import FormHeaderView from '@ckeditor/ckeditor5-ui/src/formheader/formheaderview';
import View from '@ckeditor/ckeditor5-ui/src/view';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import HideableDivider from '../components/HideableDivider';
import SyncStatusItemView from '../components/SyncStatusItemView';

import '../../theme/css/sync-status.css';

const UPDATE_INTERVAL = 250;

export default class SyncStatusView extends View {
    
  constructor(locale, withSyncStatusCallback) {
    super(locale);
    const t = locale.t;
    this.keystrokes = new KeystrokeHandler();

    this.withSyncStatusCallback = withSyncStatusCallback;
    this.shouldUpdatePeriodicially = false;

    this.connectionView = new SyncStatusItemView(locale, t("Connection: "), t("Unknown"));
    this.lastSyncView = new SyncStatusItemView(locale, t("Last Sync: "), t("Unknown"));

    this.hideableDivider = new HideableDivider(locale);

    this.downloadingView = new SyncStatusItemView(locale, t("Downloading: "), t("Unknown"));
    this.uploadingView = new SyncStatusItemView(locale, t("Uploading: "), t("Unknown"));

    this.setTemplate({
      tag: 'div',
      attributes: {
        class: [ 'ck', 'ck-sync-status-bubble' ],
      },
      children: [
        new FormHeaderView(locale, { label: t("SYNC STATUS") }),
        this.connectionView,
        this.lastSyncView,
        this.hideableDivider,
        this.downloadingView,
        this.uploadingView
      ]
    });
  }

  render() {
    super.render();
    this.keystrokes.listenTo(this.element);
  }

  startUpdating() {
    this.shouldUpdatePeriodicially = true;
    this.updateViewPeriodically(this, this.withSyncStatusCallback);
  }

  stopUpdating() {
    this.shouldUpdatePeriodicially = false;
  }

  updateViewPeriodically(view, statusUpdateCallback) {
    statusUpdateCallback((status) => {
      this.updateView(view, status);
      if (this.shouldUpdatePeriodicially) {
        setTimeout(
          () => { this.updateViewPeriodically(view, statusUpdateCallback); },
          UPDATE_INTERVAL
        );
      }
    });
  }

  updateView(view, status) {
    let uploadingStatus = status.uploading;
    let downloadingStatus = status.downloading;
    view.connectionView.setValue(status.connection);
    view.lastSyncView.setValue(status.lastSync);
    if (uploadingStatus || downloadingStatus) {
      view.hideableDivider.setVisible(true);
      view.uploadingView.setValue(uploadingStatus);
      view.downloadingView.setValue(downloadingStatus);
      view.uploadingView.setVisible(!!uploadingStatus);
      view.downloadingView.setVisible(!!downloadingStatus);
    } else {
      view.hideableDivider.setVisible(false);
      view.uploadingView.setVisible(false);
      view.downloadingView.setVisible(false);
    }
  }
}