import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Alert,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import PolicyModal from './PolicyModal';
import {
  getUrlChangeCallback,
  getExitToRootNavigatorCallback,
} from '../../../App';
import { WHITE_LIST, urlScheme } from './properties';
import { INITIAL_URL, URL_IDENTIFAIRE } from '../../../config/credentials';
import BounceIndicator from './BounceIndicator';

const fetchEvent = (eventName, stamp) => {
  fetch(
    `${INITIAL_URL}${URL_IDENTIFAIRE}?event=${eventName}&timestamp_user_id=${stamp}`,
  );
};

export default function TargetScreen({ route }) {
  const navigation = useNavigation();

  const webViewRef = useRef(null);
  // const [localOpenWithPush, setLocalOpenWithPush] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [webViewUrl, setWebViewUrl] = useState(null);
  const [currentWebViewUrl, setCurrentWebViewUrl] = useState('');

  // const [cloackUrl, setCloackUrl] = useState('');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [shouldHideWebView, setShouldHideWebView] = useState(false);

  const isFirstLoad = useRef(true);
  const { isFirstVisit, timeStamp, oneSignalPermissionStatus, url } =
    route.params;

  useEffect(() => {
    // Android back button - allow webview navigation but prevent exiting webview
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        // If we can go back, allow it
        if (webViewRef.current && webViewRef.current.canGoBack) {
          console.log('🔙 Back button - navigating back in webview');
          webViewRef.current.goBack();
          return true; // Prevent default
        }

        // If can't go back in webview, prevent exiting webview
        // User must use "Accept Privacy Policy" button to exit
        console.log(
          '🔙 Back button pressed - cannot go back in webview, but exit disabled (use Accept Privacy Policy button)',
        );
        console.log('webViewRef.current', webViewRef.current);
        return true; // Prevent default - don't exit webview
      },
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (isFirstVisit && oneSignalPermissionStatus) {
      fetchEvent('push_subscribe', timeStamp);
    }
    if (isFirstVisit) {
      const fetchTimeStamp = async () => {
        const storedTimeStamp = await AsyncStorage.getItem('timeStamp');
        // console.log('storedTimeStamp await', storedTimeStamp);
        fetchEvent('uniq_visit', storedTimeStamp);
      };
      fetchTimeStamp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstVisit, oneSignalPermissionStatus]);

  useEffect(() => {
    fetchEvent('webview_open', timeStamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initPushState = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const storedPushState = await AsyncStorage.getItem('openedWithPush');

        const shouldEnablePush =
          storedPushState === 'true' || route.params.openWithPush;
        if (shouldEnablePush) {
          console.log('Setting localOpenWithPush to true');
          // setLocalOpenWithPush(true);
          // Clear the push state immediately after reading
          // await AsyncStorage.removeItem('openedWithPush');
          console.log('Cleared push state from storage');
        }
      } catch (error) {
        console.error('Error checking push state:', error);
      }
    };

    initPushState();
  }, []);

  // Modify the initialization effect
  useEffect(() => {
    const initializeWebView = async () => {
      // if (isFirstLoad.current && isPushStateInitialized) {
      if (isFirstLoad.current) {
        try {
          // console.log('isPushStateInitialized', isPushStateInitialized);
          // console.log('this link insert cause of push???', url);
          setWebViewUrl(url);
          isFirstLoad.current = false;
        } catch (error) {
          console.error('Error initializing WebView:', error);
          Alert.alert('Error', String(error.message));
        }
      }
    };

    initializeWebView();
  }, [url]);

  // Modify the navigation state change handler
  const handleNavigationStateChange = (navState) => {
    // specific url for google pay
    const { url, canGoBack } = navState;
    // console.log('Set Current Web View URL-', url);
    setCurrentWebViewUrl(url);

    // Update WebView's canGoBack state
    if (webViewRef.current) {
      webViewRef.current.canGoBack = navState.canGoBack;
    }

    // Only handle blank pages if we're not in initial loading
    if (navState.url === 'about:blank' && !isFirstLoad.current) {
      const baseUrl = `${INITIAL_URL}${URL_IDENTIFAIRE}?${URL_IDENTIFAIRE}=1`;
      setWebViewUrl(baseUrl);
    }
  };

  // Modify the URL monitoring effect
  useEffect(() => {
    if (webViewUrl === 'about:blank' && !isFirstLoad.current) {
      const baseUrl = `${INITIAL_URL}${URL_IDENTIFAIRE}?${URL_IDENTIFAIRE}=1`;
      setWebViewUrl(baseUrl);
    }
  }, [webViewUrl]);

  const renderContent = () => {
    // Wrapper function to handle the async nature of handleCustomUrl
    const onShouldStartLoadWithRequest = (event) => {
      const { url } = event;
      // console.log('main should start load with requirest', url);

      // GOOGLE PAY METHOD
      if (url && url.includes('pay.google')) {
        const urlToOpen = currentWebViewUrl;
        if (urlToOpen) {
          Linking.openURL(urlToOpen).catch((e) =>
            console.error('Error opening current URL', e),
          );
          return false;
        }
      }

      // Handle RBC intent URL
      if (url.startsWith('intent://rbcbanking')) {
        // Extract the scheme and package from the intent URL
        const scheme = 'rbcbanking';
        const packageName = 'com.rbc.mobile.android';

        try {
          Linking.openURL(
            `${scheme}://${url.split('?')[1].split('#')[0]}`,
          ).catch(() => {
            // If custom scheme fails, try using intent
            Linking.sendIntent('android.intent.action.VIEW', [
              { key: 'package_name', value: packageName },
            ]).catch((error) => {
              console.error('Error opening RBC app:', error);
              Alert.alert(
                'App Not Found',
                'The RBC banking app is not installed.',
                [{ text: 'OK' }],
              );
            });
          });
        } catch (error) {
          console.error('Error parsing RBC URL:', error);
        }
        return false;
      }

      if (urlScheme.some((e) => url.startsWith(e))) {
        // Handle banking apps and crypto wallets
        console.log('app url', url);
        Linking.openURL(url).catch((error) => {
          Alert.alert('App Not Found', 'The requested app is not installed.', [
            { text: 'OK' },
          ]);
        });
        return false;
      } else if (url && !url.startsWith('http') && !url.startsWith('https')) {
        console.log('UNKNOWN URL !', url);
        return false;
      }
      // console.log('onShouldStartLoadWithRequest finished');
      // Handle regular web URLs to be opened in the webview ,logic to be added ....
      return true;
    };

    return (
      <SafeAreaView style={style.safeArea}>
        <StatusBar
          barStyle="default" // Options: 'dark-content', 'light-content', 'default'
          backgroundColor="#000000" // Background color for Android
          translucent={true} // Makes status bar transparent on Android
          hidden={true}
        />
        <WebView
          ref={webViewRef}
          // source={{uri: webViewUrl}}
          source={{ uri: url }}
          // source={{uri: 'https://www.dou.ua'}}
          onLoadStart={(syntheticEvent) => {
            // setIsLoading(true);
            // const {nativeEvent} = syntheticEvent;
            // console.log(nativeEvent);
            // console.log('onLoadStart fn start');
          }}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            const onFinishUrl = nativeEvent.url;
            console.log('🔗 onLoadEnd - URL:', onFinishUrl);
            setIsLoading(false);
            // setCloackUrl(onFinishUrl);

            // Check for privacypolicies.com URL - should navigate to RootNavigator
            if (onFinishUrl.includes('https://www.privacypolicies.com/')) {
              console.log('🔒 Privacy policies detected - hiding webview');
              setShouldHideWebView(true);
              // Call the URL tracking function from App.tsx
              // This will trigger navigation to RootNavigator
              const onUrlChange = getUrlChangeCallback();
              if (onUrlChange && typeof onUrlChange === 'function') {
                onUrlChange(onFinishUrl);
              }
            } else if (onFinishUrl.includes('https://www.termsfeed.com')) {
              // Show modal if 'https://www.termsfeed.com'
              console.log('📄 Terms feed detected - showing modal');
              setShowPolicyModal(true);

              // Save state to AsyncStorage so next time app opens, skip webview
              AsyncStorage.setItem('hasSeenTermsfeed', 'true')
                .then(() => {
                  console.log('✅ Termsfeed state saved to AsyncStorage');
                })
                .catch((error) => {
                  console.error('❌ Error saving termsfeed state:', error);
                });

              // Call the URL tracking function from App.tsx
              const onUrlChange = getUrlChangeCallback();
              if (onUrlChange && typeof onUrlChange === 'function') {
                onUrlChange(onFinishUrl);
              }
            } else {
              // For all other URLs (normal URLs), continue loading normally
              console.log('🌐 Normal URL detected - continuing to load');

              // Ensure webview is visible for normal URLs
              setShouldHideWebView(false);
              setShowPolicyModal(false);

              // Call the URL tracking function from App.tsx
              const onUrlChange = getUrlChangeCallback();
              if (onUrlChange && typeof onUrlChange === 'function') {
                onUrlChange(onFinishUrl);
              }
            }

            console.log('onLoadEnd fn stop');
          }}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            flex: 1,
            opacity: shouldHideWebView ? 0 : 1,
            backgroundColor: '#000000',
            marginBottom: showPolicyModal ? 80 : 0, // Add margin to prevent content from being hidden behind button
          }}
          // style={style.webContainer}
          originWhitelist={WHITE_LIST}
          onLoadProgress={({ nativeEvent }) => {
            const { progress } = nativeEvent;
            console.log(progress);
          }}
          onLoad={() => {
            // handleWebViewLoad(); // Uncomment if prefer onLoad over onLoadStart
          }}
          onError={(syntheticEvent) => {
            // Alert.alert('WebView Error', syntheticEvent.nativeEvent.description);
          }}
          onLoadError={(syntheticEvent) => {
            // Alert.alert('Load Error', syntheticEvent.nativeEvent.description);
          }}
          thirdPartyCookiesEnabled={true}
          allowsBackForwardNavigationGestures={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          allowFileAccess={true}
          javaScriptCanOpenWindowsAutomatically={true}
          setSupportMultipleWindows={false} // prevent opening external browser
          onMessage={(event) => {
            console.log('WebView Message:', event.nativeEvent.data);
          }}
          onNavigationStateChange={(navState) => {
            // Updates webview's canGoBack state
            //   console.log('navState', navState.url);
            if (webViewRef.current) {
              // console.log('webViewRef.current', webViewRef.current);
              webViewRef.current.canGoBack = navState.canGoBack;
            }
            handleNavigationStateChange(navState);
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
        {isLoading ? <BounceIndicator /> : null}
        <PolicyModal
          visible={showPolicyModal}
          onClose={() => {
            setShowPolicyModal(false);
            // Exit webview and navigate to RootNavigator
            // Note: State is already saved in onLoadEnd when termsfeed URL is detected
            const exitCallback = getExitToRootNavigatorCallback();
            if (exitCallback && typeof exitCallback === 'function') {
              console.log(
                '✅ Privacy Policy accepted - exiting to RootNavigator',
              );
              exitCallback();
            }
          }}
        />
      </SafeAreaView>
    );
  };

  return renderContent();
}

const style = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#000000',
    opacity: 0.2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
});
