/**
 * TypeScript declaration file for 'react-native-fb-deeplink'
 * This library doesn't have built-in TypeScript definitions,
 * so we create our own type declarations.
 */

declare module 'react-native-fb-deeplink' {
  interface FBDeepLinkInterface {
    /**
     * Initializes the Facebook Deep Link SDK
     * @param appId - Facebook App ID
     * @param clientToken - Facebook Client Token
     * @returns Promise that resolves when initialization is complete
     */
    initialize(appId: string, clientToken: string): Promise<void>;

    /**
     * Retrieves the deep link data
     * @returns Promise that resolves to the deep link string or null/undefined if no deep link exists
     */
    getDeepLink(): Promise<string | null | undefined>;
  }

  const FBDeepLink: FBDeepLinkInterface;
  export default FBDeepLink;
}
