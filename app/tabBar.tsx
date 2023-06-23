import React, { useContext } from 'react';
import {
  View, TouchableOpacity, Image, Text, Platform, Dimensions, StyleSheet,
} from 'react-native';
export const windowHeight = Dimensions.get('window').height;

const MyTabBar = ({ state, descriptors, navigation }: any) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e: any) => {
      e.preventDefault();
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          height: 70,
          backgroundColor: '#1C1D20',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingHorizontal: 10,
        }}
      >
        {state.routes.map((route: any, index: any) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              // @ts-ignore
              accessibilityStates={isFocused ? ['selected'] : []}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingBottom: 3,
              }}
            >
              {label === 'Projects' && (
                <View style={{alignItems:'center'}}>
                  <Image style={{width:30,height:30,tintColor:'white'}} source={require('./images/movie.png')} />
                  <Text
                  style={{color:'white',fontSize:16,top:5}}
                  >
                    {"Projects"}
                  </Text>
                </View>
              )}
              {label === 'CreateScript' && (
                <View style={{backgroundColor:'#8400F8',width:120,bottom:20,height:50,alignItems:'center',justifyContent:'center',borderRadius:5}}>
                  <Text
                  style={{color:'white',fontSize:15,fontWeight:'bold'}}
                  >
                    {"Create"}
                  </Text>
                </View>
              )}
              {label === 'Profile' && (
                <View style={{alignItems:'center'}}>
                <Image style={{width:30,height:30,tintColor:'white'}} source={require('./images/user.png')} />
                <Text
                style={{color:'white',fontSize:16,top:5}}
                >
                  {"Profile"}
                </Text>
              </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default MyTabBar;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#281a52',
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