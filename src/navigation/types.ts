export type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;
  Tabs: undefined;
  CustomeWelcome: undefined;
  TargetScreen: {
    isFirstVisit: boolean | null;
    timeStamp: string;
    url: string | null;
    oneSignalPermissionStatus: boolean | null;
  };
  RootNavigator: undefined;
};

export type TabsParamList = {
  'Curated spots': undefined;
  'Interactive Map': undefined;
  'Random Place': undefined;
  'Nature Notes': undefined;
  saved: undefined;
};
