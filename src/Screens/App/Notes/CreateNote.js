import React from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { GetFormattedDate } from '../../../Components/Date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Portal, ActivityIndicator } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';

let recording = new Audio.Recording();

export default function CreateNote({ route, navigation }) {

    const { user } = route.params;

    const date = new Date();
    const [title, setTitle] = React.useState('');
    const [note, setNote] = React.useState('');
    const [recordedURI, setRecordedURI] = React.useState('');
    const [activityIndicator, setActivityIndicator] = React.useState(false);

    React.useEffect(() => {
        GetPermission();
      }, []);

    const [AudioPerm, setAudioPerm] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const Player = React.useRef(new Audio.Sound());

    async function GetPermission() {
        const getAudioPerm = await Audio.requestPermissionsAsync();
        setAudioPerm(getAudioPerm.granted);
    };

    async function startRecording() {
        if (AudioPerm === true) {
            try {
                await recording.prepareToRecordAsync(
                    Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
                );
                await recording.startAsync();
                setIsRecording(true);
            } catch (error) {
                console.log(error);
            }
        } else {
            GetPermission();
        }
    };

    async function stopRecording() {
        try {
            await recording.stopAndUnloadAsync();
            const result = recording.getURI();
            setRecordedURI(result);
            recording = new Audio.Recording();
            setIsRecording(false);
          } catch (error) {
            console.log(error);
          }
      }

    async function playSound() {
        try {
            await Player.current.unloadAsync()
            await Player.current.loadAsync(
                { uri: recordedURI },
                {},
                true
            );
        
            const response = await Player.current.getStatusAsync();
            if (response.isLoaded) {
                if (response.isPlaying == false) {
                    setIsPlaying(true);
                    await Player.current.playAsync();
                    setTimeout(function () {
                        setIsPlaying(false)
                    }, response.playableDurationMillis)
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function stopSound() {
        try {
          const checkLoading = await Player.current.getStatusAsync();
          if (checkLoading.isLoaded === true) {
            await Player.current.stopAsync();
            setIsPlaying(false);
          }
        } catch (error) {
          console.log(error);
        }
    };

    async function saveFunction() {
        if (title && note) {
            try {
                setActivityIndicator(true)
                let audioId = null

                if(recordedURI) {
                    const file = await new Promise((resolve, reject) => {
                        var xhttp = new XMLHttpRequest();
                        xhttp.onerror = function (error) {
                            reject(new Error('error'));
                        };

                        xhttp.onload = function () {
                            resolve(xhttp.response);
                        };

                        xhttp.responseType = 'blob';
                        xhttp.open("GET", recordedURI, true);
                        xhttp.send();
                    })

                    audioId = uuidV4()
                    const metadata = {
                        contentType: 'audio/mp3'
                    }

                    await firebase.storage().ref().child(`audios/${audioId}`).put(file, metadata)
                }
                

                await Fire.save(`notes/${user.uid}`, {
                    title,
                    note,
                    date,
                    audioId
                });

                setActivityIndicator(false)
                navigation.goBack()
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Preencha todos os campos!')
        }
    }

    return (
        <View style={styles.screen}>

            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>
            
                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <Text style={styles.label}>Título</Text>
                    <TextInput value={title} onChangeText={title => setTitle(title)} maxLength={100} style={styles.title} />

                    <Text style={styles.label}>Nota</Text>
                    <TextInput value={note} onChangeText={note => setNote(note)} multiline={true} numberOfLines={15} maxLength={3000} style={styles.note} />

                    <Text style={styles.label}>Anexar áudio</Text>
                    <View style={styles.audioView}>
                        <TouchableOpacity onPress={isRecording ? () => stopRecording() : () => startRecording()} >
                            <MaterialCommunityIcons name={isRecording ? 'check' : 'microphone'} style={styles.micButton} size={40} color='white'/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={isPlaying ? () => stopSound : () => playSound()} >
                            <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} style={styles.micButton} size={40} color='white' />
                        </TouchableOpacity>
                    </View>

                    <Button icon="download" disabled={activityIndicator} style={styles.save} color="white" onPress={saveFunction}>
                        Salvar
                    </Button>

                </ScrollView>
            </SafeAreaView>

            <Portal>
                <ActivityIndicator animating={activityIndicator} size="large" style={styles.activityIndicator} color="#1E0253" />
            </Portal>
        </View>
    )
}

const styles = StyleSheet.create({
    screen: { 
		backgroundColor: '#C8ABFF',
		height: Dimensions.get('screen').height,
		width: Dimensions.get('screen').width,
		justifyContent: 'flex-start',
		alignItems: 'center'
	},

    safeAreaView: {
        marginBottom: 160,
        width: 0.92*Dimensions.get('screen').width,        
    },

    date: {
        alignSelf: 'center',
        marginVertical: 10,
        fontSize: 16,
        fontWeight: 'bold'
    },
    
    label: {
        marginTop: 10,
        alignSelf: 'flex-start',
        fontWeight: 'bold'
    },

    title: {
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },

    note: {
        textAlignVertical: 'top',
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },

    audioView: {
        alignSelf: 'center',
        flexDirection: 'row',
    },

    micButton: {
        padding: 5,
        backgroundColor: '#1E0253',
        borderRadius: 5,
        marginHorizontal: 5,
    },

    save: {
        alignSelf: 'center',
        marginTop: 50,
        backgroundColor: '#1E0253',
        width: 0.4*Dimensions.get('screen').width,
        borderRadius: 5,
        marginBottom: 50
    },

    activityIndicator: {
        marginTop: Dimensions.get('window').height / 3,
    },
})