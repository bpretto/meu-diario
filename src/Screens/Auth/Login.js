import React from "react";
import { Image, StyleSheet, View, TextInput, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import firebase from 'firebase'
import logo from "../../Images/logo.png"


export default function Login({ route, navigation }) {

    const { email } = route.params;

    const [password, setPassword] = React.useState(null)

    function loginFunction() {
        try {
        firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {navigation.navigate('AppRoutes')})
            
        } catch (error) {
            console.log(error)
        }
            
    }

    return (
        <View style={styles.screen}>
            <Image source={logo} style={styles.logo} />

            <TextInput placeholder="Senha" secureTextEntry={true} value={password} onChangeText={password => setPassword(password)} style={styles.password}/>
            
            <Button icon="login" style={styles.login} color="#1E0253" onPress={loginFunction}>
                Entrar
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

    password: {fontSize: 20,
        padding: 10,
        backgroundColor: 'white',
        width: 0.75*Dimensions.get('screen').width,
        marginBottom: 5,
        borderRadius: 5,
    },

    login: {
        backgroundColor: 'white',
        width: 0.75*Dimensions.get('screen').width,
        borderRadius: 5,
        marginBottom: 100
    }

});