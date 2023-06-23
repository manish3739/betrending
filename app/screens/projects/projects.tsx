import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function Projects({ navigation, route }: any) {
    return (
        <View style={[styles.container]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                <Text style={{ color: '#fff', fontSize: 25 }}>My Projects</Text>
                <Text style={{ color: '#633fd1', fontSize: 18 }}>Select</Text>
            </View>
            <View style={{ flex: 4 }}>

            </View>
            <View style={{ flex: 1 }}>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1D20',
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