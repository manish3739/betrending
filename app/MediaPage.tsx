import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Image, ActivityIndicator, PermissionsAndroid, Platform, TouchableOpacity } from 'react-native';
import Video, { LoadError, OnLoadData } from 'react-native-video';
import { SAFE_AREA_PADDING } from './Constants';
import { PressableOpacity } from 'react-native-pressable-opacity';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
// import CameraRoll from '@react-native-community/cameraroll';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import type { NativeSyntheticEvent } from 'react-native';
import type { ImageLoadEventData } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Routes } from './Routes';
import { useIsFocused } from '@react-navigation/core';
import { useIsForeground } from './useIsForeground';
import { StatusBarBlurBackground } from './StatusBarBlurBackground';
// import {
//   VESDK,
//   VideoEditorModal,
//   Configuration,
//   AlignmentMode,
// } from "react-native-videoeditorsdk";

const requestSavePermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  if (permission == null) return false;
  let hasPermission = await PermissionsAndroid.check(permission);
  if (!hasPermission) {
    const permissionRequestResult = await PermissionsAndroid.request(permission);
    hasPermission = permissionRequestResult === 'granted';
  }
  return hasPermission;
};

const isVideoOnLoadEvent = (event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>): event is OnLoadData =>
  'duration' in event && 'naturalSize' in event;

type Props = NativeStackScreenProps<Routes, 'MediaPage'>;
export function MediaPage({ navigation, route }: Props): React.ReactElement {
  const { path, type } = route.params;
  const [isVisible, setIsVisible] = useState(true);
  const [hasMediaLoaded, setHasMediaLoaded] = useState(false);
  const [isAspectRatio, setIsAspectRatio] = useState(false);
  const [aspectRatioValue, setAspectRatio] = useState(2);
  const isForeground = useIsForeground();
  const isScreenFocused = useIsFocused();
  const isVideoPaused = !isForeground || !isScreenFocused;
  const [savingState, setSavingState] = useState<'none' | 'saving' | 'saved'>('none');

  const onMediaLoad = useCallback((event: OnLoadData | NativeSyntheticEvent<ImageLoadEventData>) => {
    if (isVideoOnLoadEvent(event)) {
      console.log(
        `Video loaded. Size: ${event.naturalSize.width}x${event.naturalSize.height} (${event.naturalSize.orientation}, ${event.duration} seconds)`,
      );
    } else {
      console.log(`Image loaded. Size: ${event.nativeEvent.source.width}x${event.nativeEvent.source.height}`);
    }
  }, []);
  const onMediaLoadEnd = useCallback(() => {
    console.log('media has loaded.');
    setHasMediaLoaded(true);
  }, []);
  const onMediaLoadError = useCallback((error: LoadError) => {
    console.log(`failed to load media: ${JSON.stringify(error)}`);
  }, []);

  // const onSavePressed = useCallback(async () => {
  //   console.log("path",path)
  //   try {
  //     setSavingState('saving');

  //     const hasPermission = await requestSavePermission();
  //     if (!hasPermission) {
  //       Alert.alert('Permission denied!', 'Vision Camera does not have permission to save the media to your camera roll.');
  //       return;
  //     }
  //     await CameraRoll.save(`file://${path}`, {
  //       type: type,
  //     });
  //     setSavingState('saved');
  //   } catch (e) {
  //     const message = e instanceof Error ? e.message : JSON.stringify(e);
  //     setSavingState('none');
  //     Alert.alert('Failed to save!', `An unexpected error occured while trying to save your ${type}. ${message}`);
  //   }
  // }, [path, type]);

  async function onSavePressed(params: any) {
    try {
      setSavingState('saving');

      const hasPermission = await requestSavePermission();
      if (!hasPermission) {
        Alert.alert('Permission denied!', 'Vision Camera does not have permission to save the media to your camera roll.');
        return;
      }
      await CameraRoll.save(params?.video, {
        type: type,
      });
      setSavingState('saved');
    } catch (e) {
      const message = e instanceof Error ? e.message : JSON.stringify(e);
      setSavingState('none');
      Alert.alert('Failed to save!', `An unexpected error occured while trying to save your ${type}. ${message}`);
    }
  }

  const source = useMemo(() => ({ uri: `file://${path}` }), [path]);

  const screenStyle = useMemo(() => ({ opacity: hasMediaLoaded ? 1 : 0 }), [hasMediaLoaded]);

  let configuration: Configuration = {
    // Configure sticker tool
    sticker: {
      // Enable personal stickers
      personalStickers: true,
      // Configure sticker library
      categories: [
        // Create sticker category with stickers
        {
          identifier: 'example_sticker_category_logos',
          name: 'Logos',
          thumbnailURI: require('./assets/React.png'),
          items: [
            {
              identifier: 'example_sticker_logos_react',
              name: 'React',
              stickerURI: require('./assets/React.png'),
            },
            {
              identifier: 'example_sticker_logos_imgly',
              name: 'IMG.LY',
              stickerURI: require('./assets/Igor.png'),
            },
          ],
        },
        // Reorder and use existing sticker categories
        { identifier: 'imgly_sticker_category_animated' },
        { identifier: 'imgly_sticker_category_emoticons' },
        // Modify existing sticker category
        {
          identifier: 'imgly_sticker_category_shapes',
          items: [
            { identifier: 'imgly_sticker_shapes_badge_01' },
            { identifier: 'imgly_sticker_shapes_arrow_02' },
            { identifier: 'imgly_sticker_shapes_spray_03' },
          ],
        },
      ],
    },
    // Configure video composition tool
    composition: {
      // Enable personal video clips
      personalVideoClips: true,
      // Configure video clip library
      // categories: [
      //   // Create video clip category with video clips
      //   {
      //     identifier: "example_video_category_custom",
      //     name: "Custom",
      //     items: [
      //       {
      //         identifier: "example_video_custom_dj",
      //         videoURI: require('./assets/DJ.mp4')
      //       },
      //       {
      //         identifier: "example_video_custom_notes",
      //         videoURI: require('./assets/Notes.mp4')
      //       },
      //     ]
      //   }
      // ]
    },
    // Configure audio tool
    audio: {
      // Configure audio clip library
      categories: [
        // Create audio clip category with audio clips
        {
          identifier: "example_audio_category_custom",
          name: "Custom",
          items: [
            {
              // Use metadata to display title and artist
              identifier: "example_audio_custom_elsewhere",
              audioURI: require('./assets/Elsewhere.mp3')
            },
            {
              // Override metadata to display title and artist
              identifier: "example_audio_custom_danceharder",
              title: "Dance Harder",
              artist: "Three Chain Links",
              audioURI: require('./assets/DanceHarder.mp3')
            },
            {
              // Override metadata to display title and artist
              identifier: "example",
              title: "Dance Salman",
              artist: "Arjit",
              audioURI: require('./assets/bhai-ka-birthday.mp3')
            },
            {
              // Override metadata to display title and artist
              identifier: "example_audio_custom_danceharder44",
              title: "Happy birthday",
              artist: "Diljit",
              audioURI: require('./assets/haye-ni-tere-happy.mp3')
            }
          ]
        }
      ]
    },
    watermark: {
       size: 0,
       watermarkURI: require('./assets/React.png'),
       inset: 0,
       alignment: AlignmentMode.CENTER
    }
  };

  return (
    <View style={[styles.container, screenStyle]}>
      {type === 'photo' && (
        <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" onLoadEnd={onMediaLoadEnd} onLoad={onMediaLoad} />
      )}
      <>
        {type === 'video' && (
          <Video
            source={source}
            // style={StyleSheet.absoluteFill}
            style={{ width: '100%', aspectRatio: 1 / aspectRatioValue }}
            paused={isVideoPaused}
            resizeMode="cover"
            posterResizeMode="cover"
            allowsExternalPlayback={false}
            automaticallyWaitsToMinimizeStalling={false}
            disableFocus={true}
            repeat={true}
            useTextureView={false}
            controls={false}
            playWhenInactive={true}
            ignoreSilentSwitch="ignore"
            onReadyForDisplay={onMediaLoadEnd}
            onLoad={onMediaLoad}
            onError={onMediaLoadError}
          />


          // working with editing
          // <VideoEditorModal
          //   configuration={configuration}
          //   onCancel={() => navigation.goBack()}
          //   onExport={(e) => { onSavePressed(e), navigation.goBack() }}
          //   onError={(e) => console.log("error", e)}
          //   visible={isVisible}
          //   video={source}
          // />

          // openEditor()
        )}
      </>


      <View style={{ width: '80%', flexDirection: 'row',position:'absolute', top:90,left:20}}>
      <PressableOpacity style={styles.closeButton} onPress={navigation.goBack}>
        <Image style={{ width: 30, height: 30, tintColor: 'white', top:40 }} source={require('./images/57165.png')} />
      </PressableOpacity>
        </View>

     

      {/* <View style={{ width: '80%', flexDirection: 'row',bottom:40 }}>
        <PressableOpacity style={styles.saveButton} onPress={onSavePressed} disabled={savingState !== 'none'}>
          {savingState === 'none' &&
            <Image style={{ width: 35, height: 35, tintColor: 'white' }} source={require('./images/532.png')} />
          }
          {savingState === 'saved' &&
            <Image style={{ width: 35, height: 35, tintColor: 'red' }} source={require('./images/check-mark.png')} />
          }
          {savingState === 'saving' && <ActivityIndicator color="black" />}
        </PressableOpacity>
        <TouchableOpacity style={{left: 10}} onPress={() => handleAspectRatio()}>
          <Image style={{ width: 35, height: 35, tintColor: 'white' }} source={isAspectRatio ? require('./images/aspect-ratio.png') : require('./images/ratio.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={{left: 20}}>
          <Image style={{ width: 35, height: 35, tintColor: 'white' }} source={require('./images/trim.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={{left: 30}}>
          <Image style={{ width: 35, height: 35, tintColor: 'white' }} source={require('./images/dark-mode.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={{left: 40}}>
          <Image style={{ width: 35, height: 35, tintColor: 'white' }} source={require('./images/subtitles.png')} />
        </TouchableOpacity>
      </View> */}

      <StatusBarBlurBackground />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
  },
  saveButton: {
    width: 40,
    height: 40,
  },
  icon: {
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
  },
});