import { Platform, View, ActivityIndicator } from 'react-native';

// Dynamically import AuthenticateWithRedirectCallback only on the web
let AuthenticateWithRedirectCallback: any = null;
if (Platform.OS === 'web') {
  AuthenticateWithRedirectCallback = require('@clerk/clerk-react').AuthenticateWithRedirectCallback;
}

export default function OAuthCallback() {
  if (Platform.OS !== 'web' || !AuthenticateWithRedirectCallback) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#000" />
      <AuthenticateWithRedirectCallback />
    </View>
  );
}
