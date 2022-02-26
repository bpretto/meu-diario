import React from 'react';
import { View, StyleSheet, Dimensions, Text, TextInput, ScrollView, SafeAreaView, Image, TouchableOpacity, Picker } from 'react-native';
import { GetFormattedDate, GetShortFormattedDate } from '../../../Components/Date';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button, Portal, Dialog, ActivityIndicator } from 'react-native-paper';
import 'react-native-get-random-values';
import { v4 as uuidV4 } from 'uuid';
import firebase from 'firebase';
import Fire from '../../../Components/Fire';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

export default function CreateMemory({ route, navigation }) {

    const { user } = route.params;

    const date = new Date();
    const [title, setTitle] = React.useState('');
    const [subtitle, setNote] = React.useState('');
    const [image, setImage] = React.useState(null);
    const [cameraOrImage, setCameraOrImage] = React.useState(false);
    const [cameraVisible, setCameraVisible] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState("selectAnOption");
    const [activityIndicator, setActivityIndicator] = React.useState(false);
    const [location, setLocation] = React.useState();
    const [notesArray, setNotesArray] = React.useState([]);

    const camRef = React.useRef(null);

    React.useEffect(() => { loadNotes() }, []);

    function loadNotes() {
        firebase
        .database()
        .ref(`notes/${user.uid}`)
        .on('value', function (snapshot) {
            setNotesArray([])
            snapshot.forEach((one) => {
                const note = {
                    title: one.val().title,
                    date: new Date(one.val().date),
                    id: one.val().id,
                };
                
                setNotesArray((oldArray) => [...oldArray, note]);
            });
        });
    }

    async function saveFunction() {
        if (title && subtitle && image && location) {
            try {
                setActivityIndicator(true)
                const file = await new Promise((resolve, reject) => {
                    var xhttp = new XMLHttpRequest();
                    xhttp.onerror = function (error) {
                        reject(new Error('error'));
                    };

                    xhttp.onload = function () {
                        resolve(xhttp.response);
                    };

                    xhttp.responseType = 'blob';
                    xhttp.open("GET", image, true);
                    xhttp.send();
                })

                let imageId = uuidV4();
                const metadata = {
                    contentType: 'image/jpg'
                }

                await firebase.storage().ref().child(`images/${imageId}`).put(file, metadata)

                if (selectedValue !== "selectAnOption") {
                    await Fire.save(`memories/${user.uid}`, {
                        title,
                        subtitle,
                        date: selectedValue.date,
                        note: selectedValue,
                        imageId,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                } else {
                    await Fire.save(`memories/${user.uid}`, {
                        title,
                        subtitle,
                        date,
                        imageId,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                }

                setActivityIndicator(false)
                navigation.goBack()
            } catch (error) {
                console.log(error)
            }
        } else {
            console.log('Preencha todos os campos!')
        }
    }

    async function selectImage() {
        setCameraOrImage(false)
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        const image = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images
        });
        if(!image.cancelled) {
            setImage(image.uri)
        };
    };

    async function openCamera() {
        setCameraOrImage(false)
        const { status } = await Camera.requestPermissionsAsync();
        if(status) {
            setCameraVisible(true)
        } else {
            console.log("Acesso à câmera negado!")
        }
    }
    
    async function takePicture() {
        if (camRef) {
            const data = await camRef.current.takePictureAsync();
            setImage(data.uri);
            setCameraVisible(false)
        }
    }

    async function useLocation() {
        await Location.requestForegroundPermissionsAsync();
        setLocation(await Location.getCurrentPositionAsync({}));
    }

    return (
        <View style={styles.screen}>

            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>
            
                    <Text style={styles.date}>{GetFormattedDate(date)}</Text>

                    <Text style={styles.label}>Título</Text>
                    <TextInput value={title} onChangeText={title => setTitle(title)} maxLength={100} style={styles.title} />

                    <Text style={styles.label}>Legenda</Text>
                    <TextInput value={subtitle} onChangeText={subtitle => setNote(subtitle)} multiline={true} numberOfLines={7} maxLength={300} style={styles.subtitle} />

                    <Text style={styles.label}>Anexar à uma nota</Text>
                    <Picker
                        selectedValue={selectedValue}
                        style={styles.picker}
                        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                        
                    >
                        <Picker.Item
                                label={"Selecione uma opção"}
                                value={"selectAnOption"}
                        />
                        {notesArray.map((note) => (
                            <Picker.Item
                                key={note.id}
                                label={`${note.title}, de ${GetFormattedDate(new Date(note.date))}`}
                                value={note}
                            />
                        ))}
                    </Picker>

                    <Button icon="image" style={styles.imageButton} color="white" onPress={() => setCameraOrImage(true)}>
                    Anexar imagem
                    </Button>

                    {image && (
                        <View>
                            <Image style={styles.image} source={{ uri: image }} />
                        </View>
                    )}

                    <Button icon="pin" style={styles.imageButton} color="white" onPress={useLocation}>
                    Anexar localização
                    </Button>

                    {location && (
                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            initialRegion={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.030,
                                longitudeDelta:0.030
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                }}
                            >
                            </Marker>
                        </MapView>
                    )}

                    <Button icon="download" disabled={activityIndicator} style={styles.save} color="white" onPress={saveFunction}>
                        Salvar
                    </Button>

                </ScrollView>
            </SafeAreaView>

            <Portal>
                <Dialog
                    visible={cameraOrImage}
                    dismissable={true}
                    onDismiss={() => setCameraOrImage(false)}
                >
                    <Dialog.Content>
                        <Button
                            icon="camera"
                            onPress={openCamera}
                        >
                            Câmera
                        </Button>
                        <Button
                            icon="image"
                            onPress={selectImage}
                        >
                            Galeria
                        </Button>
                    </Dialog.Content>
                </Dialog>

                {cameraVisible && (
                    <Camera
                    style={{flex: 1, height: '100%'}}
                    ref={camRef}
                    >
                        <View
                            style={{
                            position: 'absolute',
                            bottom: 0,
                            flexDirection: 'row',
                            flex: 1,
                            width: '100%',
                            padding: 20,
                            justifyContent: 'space-between'
                            }}
                        >
                            <View
                            style={{
                            alignSelf: 'center',
                            flex: 1,
                            alignItems: 'center'
                            }}
                            >
                                <TouchableOpacity
                                onPress={takePicture}
                                style={{
                                width: 70,
                                height: 70,
                                bottom: 0,
                                borderRadius: 50,
                                backgroundColor: '#fff'
                                }}
                                />
                            </View>
                        </View>
                    </Camera>
                )}

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

    subtitle: {
        textAlignVertical: 'top',
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        marginBottom: 5,
        borderRadius: 5,
    },

    picker: {
        width: 0.92*Dimensions.get('screen').width,
    },

    imageButton: {
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: '#1E0253',
        width: 0.92*Dimensions.get('screen').width,
        borderRadius: 5,
    },

    image: {
        marginTop: 5,
        height: 0.2*Dimensions.get('screen').height,
        borderRadius: 5
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

    map: {
        marginTop: 5,
        width: 0.92*Dimensions.get('screen').width,
        height: 150,
    },
})