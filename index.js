"use strict";

import React from "react";

import PropTypes from "prop-types";
import { WebView } from "react-native-webview";
import { View, Linking, PixelRatio } from "react-native";

import BaseComponent from "./BaseComponent";
import Utils from "./Utils";

import styles from "./styles";

import BackButton from "./BackButton";
import StatusBar from "./StatusBar";
import AddressBar from "./AddressBar";
import Toolbar from "./Toolbar";

const WEBVIEW_REF = "webview";

const propTypes = {
  url: PropTypes.string,
  hideToolbar: PropTypes.bool,
  hideAddressBar: PropTypes.bool,
  hideStatusBar: PropTypes.bool,
  hideRefreshButton: PropTypes.bool,
  hideActivityIndicator: PropTypes.bool,
  foregroundColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  onNavigationStateChange: PropTypes.func,
  onShouldStartLoadWithRequest: PropTypes.func,
  backButtonVisible: PropTypes.bool,
  onBackPress: PropTypes.func,
  cookie: PropTypes.string,
  webviewProps: PropTypes.object
};

const defaultProps = {
  url: "",
  hideToolbar: false,
  hideAddressBar: false,
  hideStatusBar: false,
  hideRefreshButton: false,
  hideActivityIndicator: false,
  onNavigationStateChange: () => {},
  onShouldStartLoadWithRequest: () => true,
  backButtonVisible: true,
  cookie: "",
  webviewProps: {}
};

class Webbrowser extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: "",
      currentUrl: Utils.sanitizeUrl(this.props.url),
      url: Utils.sanitizeUrl(this.props.url),
      backButtonEnabled: false,
      forwardButtonEnabled: false,
      homeButtonEnabled: true,
      loading: true,
      cookie: this.props.cookie,
    };

    this._bind(
      "render",
      "goBack",
      "goHome",
      "goForward",
      "reload",
      "stop",
      "openInExternalBrowser",
      "onNavigationStateChange",
      "onShouldStartLoadWithRequest",
      "renderToolbar"
    );
  }

  componentDidMount() {
    this.props.getWebviewRef(this.refs[WEBVIEW_REF]);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      url: Utils.sanitizeUrl(nextProps.url)
    });
  }

  pxToDp(px) {
    return PixelRatio.roundToNearestPixel(px);
  }

  renderAddressBar() {
    if (this.props.hideAddressBar) {
      return;
    }

    return (
      <AddressBar
        onReload={this.reload}
        onLoad={url => {
          this.load(url);
        }}
        url={this.state.currentUrl}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderBackButton() {
    return (
      <BackButton
        visible={this.props.backButtonVisible}
        onPress={this.props.onBackPress}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderStatusBar() {
    if (this.props.hideStatusBar) {
      return;
    }

    return (
      <StatusBar
        status={this.state.status}
        foregroundColor={this.props.foregroundColor}
      />
    );
  }

  renderToolbar() {
    if (this.props.hideToolbar) {
      return;
    }

    return (
      <Toolbar
        onBack={this.goBack}
        onHome={this.reload}
        onForward={this.goForward}
        onStop={this.stop}
        onOpenInExternalBrowser={this.openInExternalBrowser}
        backButtonEnabled={this.state.backButtonEnabled}
        forwardButtonEnabled={this.state.forwardButtonEnabled}
        hideRefreshButton={this.props.hideRefreshButton}
        foregroundColor={this.props.foregroundColor}
        webViewRef={this.refs[WEBVIEW_REF]}
      />
    );
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          this.props.backgroundColor && {
            backgroundColor: this.props.backgroundColor
          },
        ]}
      >
        <View style={styles.header}>
          <View style={{ flexDirection: "row" }}>
            {/* {this.renderBackButton()} */}
            {this.renderAddressBar()}
          </View>
          {this.renderStatusBar()}
        </View>
        <WebView
          ref={WEBVIEW_REF}
          automaticallyAdjustContentInsets={false}
          style={styles.webView}
          source={{ uri: this.state.url }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          decelerationRate="normal"
          sharedCookiesEnabled={true}
          onNavigationStateChange={this.onNavigationStateChange}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          startInLoadingState={true}
          onLoad={() => this.refs[WEBVIEW_REF].postMessage(this.state.cookie)}
          {...this.props.webviewProps}
          onLoadEnd={() => {
            this.props.stopRefreshing(false);
          }}
        />
        {this.renderToolbar()}
      </View>
    );
  }

  goBack() {
    this.refs[WEBVIEW_REF].goBack();
  }

  goForward() {
    this.refs[WEBVIEW_REF].goForward();
  }

  goHome() {
    this.load(this.props.url);
  }

  load(url) {
    this.setState({
      url
    });
  }

  reload() {
    this.refs[WEBVIEW_REF].reload();
  }

  stop() {
    this.refs[WEBVIEW_REF].stopLoading();
  }

  openInExternalBrowser() {
    this.props.segmentTracking(this.state.currentUrl);
    Linking.openURL(this.state.currentUrl);
  }

  onShouldStartLoadWithRequest(event) {
    return this.props.onShouldStartLoadWithRequest(event);
  }

  onNavigationStateChange(navState) {
    this.setState({
      backButtonEnabled: navState.canGoBack,
      forwardButtonEnabled: navState.canGoForward,
      currentUrl: navState.url,
      status: navState.title,
      loading: navState.loading
    });

    this.props.onNavigationStateChange(navState);
  }
}

Webbrowser.propTypes = propTypes;
Webbrowser.defaultProps = defaultProps;

export default Webbrowser;
