import * as React from 'react';
import { useRef, useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { PinchGestureHandler, PinchGestureHandlerGestureEvent, TapGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  CameraDeviceFormat,
  CameraRuntimeError,
  FrameProcessorPerformanceSuggestion,
  PhotoFile,
  sortFormats,
  useCameraDevices,
  useFrameProcessor,
  VideoFile,
} from 'react-native-vision-camera';
import * as ImagePicker from "react-native-image-picker";
import Modal from "react-native-modal";
import Slider from '@react-native-community/slider';

import {
  ScrollView,
  Button,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRoute, RouteProp, ParamListBase } from '@react-navigation/native';
import { getValue, fontSizeKey, scrollingSpeedKey } from './src/helpers/utils';


import { Camera, frameRateIncluded } from 'react-native-vision-camera';
import { CONTENT_SPACING, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from './Constants';
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useIsForeground } from './useIsForeground';
import { StatusBarBlurBackground } from './StatusBarBlurBackground';
import { CaptureButton } from './CaptureButton';
import { PressableOpacity } from 'react-native-pressable-opacity';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import type { Routes } from './Routes';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/core';
import { examplePlugin } from './ExamplePlugin';
// import MusicFiles from 'react-native-get-music-files';
import { check, PERMISSIONS, RESULTS, request, checkMultiple } from 'react-native-permissions';
import VideoRecorder from './Components/lib';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true,
});

const SCALE_FULL_ZOOM = 3;
const BUTTON_SIZE = 40;

type Props = NativeStackScreenProps<Routes, 'CameraPage'>;



const styles = StyleSheet.create({
  scrollView: {
    // backgroundColor: 'rgba(52, 52, 52, 0.8)'

  },
  buttonPlayPause: {
    alignItems: 'center',
    // backgroundColor: 'rgba(52, 52, 52, 0.8)',
    padding: 10,
  },
  buttonText: { color: '#fffb00', fontSize: 20 },

  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    // right: SAFE_AREA_PADDING.paddingRight,
    bottom: '5%',
    right:'20%'
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

interface RootStackParamList extends ParamListBase {
  params: {
    text: string;
  };
}

export default function CameraPage({ navigation }: Props): React.ReactElement {
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const zoom = useSharedValue(0);
  const isPressingButton = useSharedValue(false);
  // check if camera page is active
  const isFocussed = useIsFocused();
  const isForeground = useIsForeground();
  const isActive = isFocussed && isForeground;

  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const [enableHdr, setEnableHdr] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [enableNightMode, setEnableNightMode] = useState(false);

  const [isTelepromter, setIsTelepromter] = useState(false);
  const [cameraCountTimer, setCameraCountTimer] = useState(0);

  // camera format settings
  const devices = useCameraDevices();
  const device = devices[cameraPosition];
  const formats = useMemo<CameraDeviceFormat[]>(() => {
    if (device?.formats == null) return [];
    return device.formats.sort(sortFormats);
  }, [device?.formats]);


  useEffect(() => {
    check(PERMISSIONS.IOS.MEDIA_LIBRARY)
      .then((result) => {
        console.log("🚀 ~ file: MediaPage.tsx:58 ~ .then ~ result:", result)

        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log("RESULTS.UNAVAILABLE");
            break;
          case RESULTS.DENIED:
            console.log("RESULTS.DENIED");
            break;
          case RESULTS.LIMITED:
            console.log("RESULTS.LIMITED");
            break;
          case RESULTS.GRANTED:
            console.log('The permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log("RESULTS.BLOCKED");
            break;
        }
      })
      .catch((error) => {
        console.log("error", error)
      });

    //   MusicFiles.getAll({
    //     blured : true, // works only when 'cover' is set to true
    //     artist : true,
    //     duration : true, //default : true
    //     cover : false, //default : true,
    //     genre : true,
    //     title : true,
    //     cover : true,
    //     minimumSongDuration : 10000, // get songs bigger than 10000 miliseconds duration,
    //     fields : ['title','albumTitle','genre','lyrics','artwork','duration'] // for iOs Version
    // }).then(tracks => {
    //     console.log("🚀 ~ file: MediaPage.tsx:65 ~ useEffect ~ tracks:", tracks)
    //     // do your stuff...
    // }).catch(error => {
    //     console.log("🚀 ~ file: MediaPage.tsx:68 ~ useEffect ~ error:", error)
    //     // catch the error
    // })

  }, []);

  //#region Memos
  const [is60Fps, setIs60Fps] = useState(true);
  const fps = useMemo(() => {
    if (!is60Fps) return 30;

    if (enableNightMode && !device?.supportsLowLightBoost) {
      // User has enabled Night Mode, but Night Mode is not natively supported, so we simulate it by lowering the frame rate.
      return 30;
    }

    const supportsHdrAt60Fps = formats.some((f) => f.supportsVideoHDR && f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if (enableHdr && !supportsHdrAt60Fps) {
      // User has enabled HDR, but HDR is not supported at 60 FPS.
      return 30;
    }

    const supports60Fps = formats.some((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, 60)));
    if (!supports60Fps) {
      // 60 FPS is not supported by any format.
      return 30;
    }
    // If nothing blocks us from using it, we default to 60 FPS.
    return 60;
  }, [device?.supportsLowLightBoost, enableHdr, enableNightMode, formats, is60Fps]);

  const supportsCameraFlipping = useMemo(() => devices.back != null && devices.front != null, [devices.back, devices.front]);
  const supportsFlash = device?.hasFlash ?? false;
  const supportsHdr = useMemo(() => formats.some((f) => f.supportsVideoHDR || f.supportsPhotoHDR), [formats]);
  const supports60Fps = useMemo(() => formats.some((f) => f.frameRateRanges.some((rate) => frameRateIncluded(rate, 60))), [formats]);
  const canToggleNightMode = enableNightMode
    ? true // it's enabled so you have to be able to turn it off again
    : (device?.supportsLowLightBoost ?? false) || fps > 30; // either we have native support, or we can lower the FPS
  //#endregion

  const format = useMemo(() => {
    let result = formats;
    if (enableHdr) {
      // We only filter by HDR capable formats if HDR is set to true.
      // Otherwise we ignore the `supportsVideoHDR` property and accept formats which support HDR `true` or `false`
      result = result.filter((f) => f.supportsVideoHDR || f.supportsPhotoHDR);
    }

    // find the first format that includes the given FPS
    return result.find((f) => f.frameRateRanges.some((r) => frameRateIncluded(r, fps)));
  }, [formats, fps, enableHdr]);

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z,
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Callbacks
  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton;
    },
    [isPressingButton],
  );
  // Camera callbacks
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error(error);
  }, []);
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!');
    setIsCameraInitialized(true);
  }, []);
  const onMediaCaptured = useCallback(
    (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      // console.log(`Media captured! ${JSON.stringify(media)}`);
      setIsScrolling(false);
      setIsTelepromter(false);
      navigation.navigate('MediaPage', {
        path: media.path,
        type: type,
      });
    },
    [navigation],
  );
  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'));
  }, []);
  const onFlashPressed = useCallback(() => {
    setFlash((f) => (f === 'off' ? 'on' : 'off'));
  }, []);
  //#endregion

  //#region Tap Gesture
  const onDoubleTap = useCallback(() => {
    onFlipCameraPressed();
  }, [onFlipCameraPressed]);
  //#endregion

  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run everytime the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);

  useEffect(() => {
    Camera.getMicrophonePermissionStatus().then((status) => setHasMicrophonePermission(status === 'authorized'));
  }, []);
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP);
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP);
    },
  });
  //#endregion

  if (device != null && format != null) {
    // console.log(
    //   `Re-rendering camera page with ${isActive ? 'active' : 'inactive'} camera. ` +
    //   `Device: "${device.name}" (${format.photoWidth}x${format.photoHeight} @ ${fps}fps)`,
    // );
  } else {
    // console.log('re-rendering camera page without active camera');
  }

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // const values = examplePlugin(frame);
    // console.log(`Return Values: ${JSON.stringify(values)}`);
  }, []);

  const onFrameProcessorSuggestionAvailable = useCallback((suggestion: FrameProcessorPerformanceSuggestion) => {
    console.log(`Suggestion available! ${suggestion.type}: Can do ${suggestion.suggestedFrameProcessorFps} FPS`);
  }, []);


  const options: any = {
    title: 'Video Picker',
    mediaType: 'video',
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  };


  function handleImportVideo() {
    ImagePicker.launchImageLibrary(options, (response: any) => {
      navigation.navigate('MediaPage', {
        path: response?.assets[0].uri,
        type: 'video',
      });
    });
  };


  const route = useRoute() as RouteProp<RootStackParamList, 'params'>;
  const { text } = route?.params;
  const refContainer = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isSettingModal, setIsSettingModal] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [scrollSpeed, setScrollSpeed] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      const defaultFontSize = await getValue(fontSizeKey);
      if (defaultFontSize !== null) {
        setFontSize(parseInt(defaultFontSize as string, 10));
      }
      const defaultScrollingSpeed = await getValue(scrollingSpeedKey);
      if (defaultScrollingSpeed !== null) {
        setScrollSpeed(parseInt(defaultScrollingSpeed as string, 10));
      }
    };
    fetchData();
  }, []);

  const textStyle = () => {
    return {
      color: '#ffffff',
      fontSize,
      textAlign: 'center'
    };
  };

  let scrollOffset = 0;

  const scroll = () => {
    refContainer.current?.scrollTo({
      x: 0,
      y: scrollOffset + scrollSpeed,
      animated: true,
    });
  };

  useEffect(() => {
    if (isScrolling) {
      const interval = setInterval(() => {
        scroll();
      }, 100);
      return () => { clearInterval(interval) };
    }
  }, [isScrolling]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset = event.nativeEvent.contentOffset.y;
    let paddingToBottom = 10;
    paddingToBottom += event.nativeEvent.layoutMeasurement.height;
    if (event.nativeEvent.contentOffset.y >= event.nativeEvent.contentSize.height - paddingToBottom) {
      // make something...
      setIsScrolling(false);
    }
  };

  function fancyTimeFormat(duration: any) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
  }

  const videoRecorder = useRef(null)

  useEffect(() => {
    startRecorder()
  }, [])
  function startRecorder() {
    if (videoRecorder && videoRecorder.current) {
      videoRecorder.current.open({ maxLength: 120 }, (data: any) => {
        console.log('captured data', data);
      })
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ position: 'absolute', height: 20, bottom: 0, zIndex: 99999, top: 55, left: 20 }} onPress={() => { navigation.goBack() }}>
        <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={require('./images/57165.png')} />
      </TouchableOpacity>
      {!isTelepromter &&
        <TouchableOpacity style={{ position: 'absolute', height: 20, bottom: 0, zIndex: 99999, top: 55, right: 20 }} onPress={() => setIsTelepromter(!isTelepromter)}>
          <Text style={{
            color: 'white',
            paddingLeft: 30
          }}>Telepromter</Text>
        </TouchableOpacity>
      }
      <Modal
        style={{ margin: 0 }}
        isVisible={isTelepromter}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <View style={{ height: '70%', paddingTop: 70, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(52, 52, 52, 0.6)', position: 'absolute', bottom: 0, zIndex: 99999, top: 0, left: 0, right: 0 }}>
            <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: 20 }}>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%',paddingBottom:20 }}>

                <TouchableOpacity style={{}} onPress={() => { setIsTelepromter(false), setIsScrolling(false) }}>
                  <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={require('./images/undo.png')} />
                </TouchableOpacity>

                <TouchableOpacity style={{}} onPress={() => { setIsSettingModal(true), setIsScrolling(false) }}>
                  <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={require('./images/setting.png')} />
                </TouchableOpacity>
              </View>

            </View>

            <ScrollView
              ref={refContainer}
              onScroll={handleScroll}
              scrollEventThrottle={scrollSpeed / 2}
              showsVerticalScrollIndicator={false}
              contentInsetAdjustmentBehavior="automatic"
              style={styles.scrollView}>
              <Text style={textStyle()}>{text}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.buttonPlayPause}
              onPress={() => {
                if (isScrolling) {
                  setIsScrolling(false)
                } else {
                  setIsScrolling(true)
                  refContainer.current?.scrollTo({
                    x: 0,
                    y: 0,
                    animated: true,
                  });
                }
              }}>
              <Text style={styles.buttonText}>{isScrolling ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
          </View>
        </View>



        <Modal style={{ margin: 0 }} isVisible={isSettingModal}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ height: '40%', backgroundColor: '#1C1D21', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20 }}>
              <View style={{ paddingVertical: 20, flex: 1 }}>
                <Text style={{ color: '#DDDFE7', fontSize: 20 }}>Teleprompter Settings</Text>
                <Text style={{ color: '#797D86', fontSize: 12, top: 5 }}>Select the details of how your script will display</Text>
              </View>
              <View style={{ flex: 3 }}>
                <Text style={{ color: '#797D86', fontSize: 14 }}>SCRIPT SPEED</Text>
              </View>
              <View style={{ flex: 2 }}>
                <Text
                  style={{ color: 'white' }}
                >{`Scrolling Speed: ${scrollSpeed}`}</Text>
                <Slider
                  style={{ width: 350, height: 40 }}
                  minimumValue={2}
                  maximumValue={100}
                  minimumTrackTintColor="#bdbdbd"
                  maximumTrackTintColor="#000000"
                  onValueChange={(value: React.SetStateAction<number>) => setScrollSpeed(value)}
                  step={1}
                  value={scrollSpeed}
                />
                <TouchableOpacity onPress={() => setIsSettingModal(false)}>
                  <Text style={{ color: '#DDDFE7', fontSize: 20, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </Modal>

      {/* {device != null && (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
            <Reanimated.View style={StyleSheet.absoluteFill}>
              <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                <ReanimatedCamera
                  ref={camera}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  format={format}
                  fps={fps}
                  hdr={enableHdr}
                  lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                  isActive={isActive}
                  onInitialized={onInitialized}
                  onError={onError}
                  enableZoomGesture={false}
                  animatedProps={cameraAnimatedProps}
                  photo={true}
                  video={true}
                  audio={hasMicrophonePermission}
                  frameProcessor={device.supportsParallelVideoProcessing ? frameProcessor : undefined}
                  orientation="portrait"
                  frameProcessorFps={1}
                  onFrameProcessorPerformanceSuggestionAvailable={onFrameProcessorSuggestionAvailable}
                />
              </TapGestureHandler>
            </Reanimated.View>
          </PinchGestureHandler>
        </GestureHandlerRootView>
      )} */}
      <VideoRecorder
        handleClose={() => navigation.goBack()} 
        cameraPosition={cameraPosition}
        ref={videoRecorder} compressQuality={'medium'} />
         <View style={styles.rightButtonRow}>
{supportsCameraFlipping && (
          <PressableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
            <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={require('./images/camera.png')} />
          </PressableOpacity>
        )}
        </View>
      {/* <View style={{ height: 130, alignSelf: 'center' }}>
        <CaptureButton
          style={styles.captureButton}
          camera={camera}
          onMediaCaptured={onMediaCaptured}
          cameraZoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          // handleTimer={(timer: any) => {setCameraCountTimer(timer)}}
          handleTimer={(timer: any) => {}}
          flash={supportsFlash ? flash : 'off'}
          enabled={isCameraInitialized && isActive}
          setIsPressingButton={setIsPressingButton}
        />

      </View> */}

      {/* <StatusBarBlurBackground /> */}

        {/* {supportsFlash && (
          <PressableOpacity style={styles.button} onPress={onFlashPressed} disabledOpacity={0.4}>
            <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={flash === 'on' ? require('./images/electricity-bill.png') : require('./images/flash.png')} />

          </PressableOpacity>
        )} */}
    </View>
  );
}
