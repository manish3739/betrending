import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { PermissionsPage } from './PermissionsPage';
import { MediaPage } from './MediaPage';
import type { Routes } from './Routes';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import CameraPage from './CameraPage';

import { PrompterContainer } from './src/containers/PrompterContainer';
import { Projects } from './screens/projects/projects';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { PermissionsAndroid, Platform } from 'react-native';
import { Login } from './screens/login';
import MyTabBar from './tabBar';
import { Profile } from './screens/profile/profile';
import { CreateScript } from './screens/createscript/createScript';

AntDesign.loadFont().then();
Ionicons.loadFont().then();
Feather.loadFont().then();

const Stack = createStackNavigator();
const AppStack= createStackNavigator();
const AuthStack= createStackNavigator();
const HomeS= createStackNavigator();
const Tab= createBottomTabNavigator();

const TabStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props: any) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="Projects" component={Projects} />
      <Tab.Screen name="CreateScript" component={CreateScript} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

const AppStackScreen = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen component={TabStack} name="Projects" />
      <AppStack.Screen component={CameraPage} name="CameraPage" />
    </AppStack.Navigator>
  );
};
const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={Login} name="Login" />
      <AuthStack.Screen component={TabStack} name="Projects" />
      <AuthStack.Screen component={CreateScript} name="CreateScript" />
      <AuthStack.Screen component={CameraPage} name="CameraPage" />
    </AuthStack.Navigator>
  );
};


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
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStackScreen} />
            <Stack.Screen name="App" component={AppStackScreen} /> 
        </Stack.Navigator>
      </NavigationContainer>
  );
};