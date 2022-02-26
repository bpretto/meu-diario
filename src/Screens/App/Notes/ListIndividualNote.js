import React from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { GetFormattedDate } from '../../../Components/Date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button } from 'react-native-paper';
import 'react-native-get-random-values';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';

export default function ListIndividualNote({ route, navigation }) {

    const { user, card } = route.params;
    const date = new Date();
    const [isPlaying, setIsPlaying] = React.useState(false);
    const Player = React.useRef(new Audio.Sound());
    const [recordedURI, setRecordedURI] = React.useState('');

    React.useEffect(() => {
        loadSound()

        async function loadSound() {
            if (card.audioId) {
                const audio = await firebase.storage().ref("audios").child(card.audioId).getDownloadURL()
                setRecordedURI(audio)
            }
        }
    })

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

    function editNote() {
        navigation.navigate('EditNote', {
            user, card, recordedURI
        })
    }

    function deleteNote() {
        Fire.remove(`notes/${user.uid}`, card.id);
        navigation.goBack();
    }


    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <View style={styles.board} >
                        <Text style={styles.title}>{card.title}</Text>

                        <Text>{card.note}</Text>
                    </View>

                    {card.audioId && (
                        <TouchableOpacity onPress={isPlaying ? () => stopSound : () => playSound()} >
                            <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} style={styles.micButton} size={40} color='white' />
                        </TouchableOpacity>
                    )}

                    <View style={styles.btnContainer}>
                        <Button icon="pencil" style={styles.button} color="white" onPress={editNote}>
                            Editar
                        </Button>

                        <Button icon="delete" style={styles.button} color="white" onPress={deleteNote}>
                            Apagar
                        </Button>
                    </View>

                </ScrollView>
            </SafeAreaView>
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
    
    board: {
        textAlignVertical: 'top',
        padding: 10,
        backgroundColor: 'white',
        width: 0.92*Dimensions.get('screen').width,
        marginBottom: 5,
        borderRadius: 5,
    },

    title: {
        color: '#1E0253',
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    micButton: {
        marginTop: 10,
        alignSelf: 'center',
        padding: 5,
        backgroundColor: '#1E0253',
        borderRadius: 5,
        marginHorizontal: 5,
    },

    btnContainer: {
        marginHorizontal: 0.05*Dimensions.get('screen').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 50,
        borderRadius: 5,
        marginBottom: 50
    },

    button: {
        backgroundColor: '#1E0253',
        width: 0.4*Dimensions.get('screen').width,
    }


})