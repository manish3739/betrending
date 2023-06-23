import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Login({ navigation, route }: any) {
    return (
        <View style={[styles.container]}>
            <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 50 }}>
                <Text style={{ fontSize: 35, color: 'white' }}>Captions</Text>
                <Text style={{ fontSize: 20, color: 'white', textAlign: 'center', paddingTop: 20 }}>Automatically transcribe, caption and clip your talking videos</Text>
            </View>
            <View style={{ flex: 2, marginHorizontal:40 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Projects")} style={{backgroundColor:'white',flexDirection:'row',alignItems:'center',padding:10,borderRadius:10}}>
                    <Image style={{width:30,height:30}} source={require('../../images/google.png')} />
                    <Text style={{fontSize:15,left:5,color:'#281a52'}}>Sign in with Google</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1,justifyContent:'center' }}>
           <Text style={{fontSize: 20, color: 'white', textAlign: 'center', paddingTop: 20 }}>Continue another way</Text>
            </View>
        </View>
    );
};

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