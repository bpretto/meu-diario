import React from "react";
import { Image, StyleSheet, View, TextInput, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import firebase from 'firebase'
import logo from '../../Images/logo.png'


export default function Welcome({ navigation }) {

    const [email, setEmail] = React.useState(null)

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    async function continueFunction() {
        let emailAlreadyExists
        const validEmail = validateEmail(email)
        if (!validEmail) {
            console.log("Preencha corretamente o campo.")
        } else {      
            firebase
            .database()
            .ref('users')
            .on('value', function (snapshot) {
                snapshot.forEach((user) => {
                    if (email == user.val().email) {
                        emailAlreadyExists = true;
                    }
                });

                if (emailAlreadyExists) {
                    navigation.navigate('Login', { email })
                } else {
                    navigation.navigate('CreateAccount',{ email })
                }

            }, function (error) {
            console.log(error);
            });
        }
    }

    return (
        <View style={styles.screen}>
            <Image source={logo} style={styles.logo} />

            <TextInput placeholder="E-mail" value={email} onChangeText={email => setEmail(email)} style={styles.email}/>
            
            <Button icon="login" style={styles.continue} color="#1E0253" onPress={continueFunction}>
                Continuar
            </Button>

        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#1E0253',
        height: Dimensions.get('screen').height,
        width: Dimensions.get('screen').width,
        justifyContent: 'center',
        alignItems: 'center'
    },

    logo: {
        height: 0.2*Dimensions.get('screen').height,
        width: 0.8*Dimensions.get('screen').width,
    },

    email: {
        fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        width: 0.75*Dimensions.get('screen').width,
        marginBottom: 5,
        borderRadius: 5,
    },

    continue: {
        backgroundColor: 'white',
        width: 0.75*Dimensions.get('screen').width,
        borderRadius: 5,
        marginBottom: 100
    }

});