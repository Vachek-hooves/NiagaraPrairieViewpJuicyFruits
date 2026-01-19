import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';
export const handleGetAaid = async () => {
  // for android
  try {
    const aaid = await ReactNativeIdfaAaid.getAdvertisingInfo();

    // console.log('aaid handleGetAaid', aaid);
    // console.log('status handleGetAaid', status);
    // console.log('aaid handleGetAaid', aaid.id);
    return aaid.id;
  } catch (err) {
    console.log('err', err);
    return null;
  }
};
