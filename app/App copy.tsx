import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PermissionsPage } from './PermissionsPage';
import { MediaPage } from './MediaPage';
import type { Routes } from './Routes';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import CameraPage from './CameraPage';

import {PrompterContainer} from './src/containers/PrompterContainer';
import {Home} from './src/containers/Home';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { PermissionsAndroid, Platform } from 'react-native';

AntDesign.loadFont().then();
Ionicons.loadFont().then();
Feather.loadFont().then();

const Stack = createNativeStackNavigator<Routes>();

export default function App(): React.ReactElement | null {
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>();
  const [microphonePermission, setMicrophonePermission] = useState<CameraPermissionStatus>();

  useEffect(() => {
    Camera.getCameraPermissionStatus().then(setCameraPermission);
    Camera.getMicrophonePermissionStatus().then(setMicrophonePermission);
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]).then((result) => {
        if (
          result["android.permission.CAMERA"] &&
          result["android.permission.READ_EXTERNAL_STORAGE"] &&
          result["android.permission.RECORD_AUDIO"] &&
          result["android.permission.WRITE_EXTERNAL_STORAGE"]
        ) {
        } else if (
          result["android.permission.CAMERA"] ||
          result["android.permission.READ_EXTERNAL_STORAGE"] ||
          result["android.permission.RECORD_AUDIO"] ||
          result["android.permission.WRITE_EXTERNAL_STORAGE"]
        ) {
        }
      });
    }
  }, []);

  console.log(`Re-rendering Navigator. Camera: ${cameraPermission} | Microphone: ${microphonePermission}`);

  if (cameraPermission == null || microphonePermission == null) {
    // still loading
    return null;
  }

  const showPermissionsPage = cameraPermission !== 'authorized' || microphonePermission === 'not-determined';
  return (
    <NavigationContainer>
   
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          statusBarStyle: 'dark',
          animationTypeForReplace: 'push',
        }}
        // initialRouteName={'CameraPage'}
        >
             <Stack.Screen  
      initialRouteName={'Home'}
       name="Home" 
       component={Home} />
        <Stack.Screen
        options={{ headerShown: false }}
        name="CameraPage" component={CameraPage} />
        <Stack.Screen
          name="MediaPage"
          component={MediaPage}
          options={{
            animation: 'none',
            presentation: 'transparentModal',
            headerShown: false 
          }}
        />
        {/* <Stack.Screen
          name="Prompter"
          component={PrompterContainer}
          options={{
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#ffffff',
            headerBackTitleVisible: false,
          }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}