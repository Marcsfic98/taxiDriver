import { Stack } from 'expo-router';

function RootLayout() {
  return (
    <Stack screenOptions={{headerShown:false}}>
      <Stack.Screen name="index" />
      <Stack.Screen name='taximeterApp'/>
    </Stack>
  );
}

export default RootLayout;