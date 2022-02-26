import React from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, SafeAreaView, Image } from 'react-native';
import { Audio } from 'expo-av';
import { GetFormattedDate, GetShortFormattedDate } from '../../../Components/Date';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';
import { useEffect } from 'react/cjs/react.production.min';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function ListIndividualMemory({ route, navigation }) {

    const { user, card } = route.params;
    const [image, setImage] = React.useState(null);
    const [note, setNote] = React.useState(null);

    React.useEffect(() => {
        loadImage()
        loadNote()
    }, [])

    async function loadImage() {
        if (card.imageId) {
            const image = await firebase.storage().ref("images").child(card.imageId).getDownloadURL()
            setImage(image)
        }
    }

    async function loadNote() {
        if (card.note) {
            firebase
            .database()
            .ref(`notes/${user.uid}`)
            .on('value', function (snapshot) {
                snapshot.forEach((one) => {
                    if (card.note.id == one.val().id) {                        
                        const note = {
                            title: one.val().title,
                            note: one.val().note,
                            date: new Date(one.val().date),
                            audioId: one.val().audioId,
                            id: one.val().id,
                        };

                        setNote(note);
                    }

    
                });
            });
        }
    }

    function navigateCard(card) {
        navigation.navigate('ListIndividualNote', {
            user,
            card
        })
    }

    function editMemory() {
        navigation.navigate('EditMemory', {
            user, card, image, note
        })
    }

    function deleteMemory() {
        Fire.remove(`memories/${user.uid}`, card.id);
        navigation.goBack();
    }    

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <Text style={styles.date}>{GetFormattedDate(card.date)}</Text>

                    <Text style={styles.title}>{card.title}</Text>
                    <Text style={styles.subtitle}>{card.subtitle}</Text>

                    <Text style={styles.label}>Imagem</Text>
                    <View>
                        <Image style={styles.image} source={{ uri: image }} />
                    </View>

                    {note && (
                        <View>
                            <Text style={styles.label}>Nota anexada</Text>
                            <Card key={note.id} style={styles.card} accessible={true} onPress={() => navigateCard(note)} >
                                <Card.Content style={styles.cardContent}>
                                    <Title style={styles.cardTitle}>{note.title}</Title>
                                    <Paragraph style={styles.cardParagraph}>{GetShortFormattedDate(new Date(note.date))}</Paragraph>
                                </Card.Content>
                            </Card>
                        </View>
                    )}

                    <Text style={styles.label}>Localização</Text>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: card.latitude,
                            longitude: card.longitude,
                            latitudeDelta: 0.030,
                            longitudeDelta:0.030
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: card.latitude,
                                longitude: card.longitude,
                            }}
                        >
                        </Marker>
                    </MapView>

                    <View style={styles.btnContainer}>
                        <Button icon="pencil" style={styles.button} color="white" onPress={editMemory}>
                            Editar
                        </Button>

                        <Button icon="delete" style={styles.button} color="white" onPress={deleteMemory}>
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

    title: {
        color: '#1E0253',
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },

    image: {
        height: 0.2*Dimensions.get('screen').height,
        borderRadius: 5
    },

    subtitle: {
        alignSelf: 'center',
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
    },

    map: {
        width: 0.92*Dimensions.get('screen').width,
        height: 150,
    },

    cardContent: {
        alignItems: 'center'
    },

    label: {
        marginTop: 10,
        marginBottom: 5,
        alignSelf: 'flex-start',
        fontWeight: 'bold'
    },
})