import React, { useEffect, useState } from 'react';
import { Alert, Image, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { addScript, getAllScripts, removeScript } from '../../src/helpers/utils';
import Modal from "react-native-modal";
import { FlatList } from 'react-native';
import { ScriptListItem } from '../../src/components/ScriptListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';



export function CreateScript({ navigation, route }: any) {

  
    const [inputString, setInputString] = useState('');
    const [scripts, setScripts] = useState([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
          const fetchedScripts = await getAllScripts();
          setScripts(fetchedScripts);
        };
        fetchData();
      }, []);
    

    const handleSave = async () => {
        if (inputString.length > 300) {
        const updatedScripts = await addScript(inputString);
        setScripts(updatedScripts);
        setInputString("");
        navigation.navigate("CameraPage", { text: inputString })
        } else {
          Alert.alert("Please insert atleast 200 words!!")
        }
    };

    const FlatListItemSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#888888',
                }}
            />
        );
    };


    const openScript = (script: string) => {
        setIsHistoryVisible(false);
        // navigation.navigate('Prompter', {text: script});
        navigation.navigate('CameraPage', { text: script });
    };

    interface RenderItemProps {
        item: string;
        index: number;
    }

    const renderItem: any = ({ item, index }: any) => {
        const length = 100;
        const trimmedString =
            item.length > length ? `${item.substring(0, length - 3)}...` : item;

        return (
            <ScriptListItem
                title={trimmedString}
                onPress={() => openScript(item)}
                handleDelete={async () => {
                    const updatedScripts = await removeScript(index);
                    setScripts(updatedScripts);
                }}
            />
        );
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} style={[styles.container]}>
            <View style={{ flex: 1, backgroundColor: '#1C1D20' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Image style={{ width: 20, height: 20, tintColor: 'white' }} source={require('../../images/arrow.png')} />
                    </TouchableOpacity>
                    <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: '#555459', fontSize: 20 }}>Magic Writing Assistant</Text>

                    </View>
                    <View style={{ flex: 1 }} />
                </View>
                <View style={{ flex: 4 }}>
                    <TextInput
                        placeholderTextColor={'#555459'}
                        placeholder='Add your script here'
                        style={{ height: '100%', fontSize: 20, paddingHorizontal: 20, color: 'white' }}
                        multiline={true}
                        numberOfLines={5}
                        value={inputString}
                        textAlignVertical={'top'}
                        onChangeText={(value: string) => setInputString(value)}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                        <TouchableOpacity onPress={() => { setIsHistoryVisible(true) }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>History</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSave()} style={{ backgroundColor: '#633fd1', paddingVertical: 12, borderRadius: 8, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Record</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Modal style={{ margin: 0 }} isVisible={isHistoryVisible}>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <View style={{ height: '80%', backgroundColor: '#1C1D21', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20 }}>
                           
                            <TouchableOpacity onPress={() => setIsHistoryVisible(false) } style={{ top:10,padding:20 }} >
                                <Image style={{ width: 24, height: 24, tintColor: 'white' }} source={require('../../images/57165.png')} />
                            </TouchableOpacity>

                            <FlatList
                                data={scripts}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => `key${index}`}
                                ItemSeparatorComponent={FlatListItemSeparator}
                            />
                        </View>
                    </View>
                </Modal>

            </View>
        </TouchableWithoutFeedback>
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