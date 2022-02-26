import React from "react";
import { Image, StyleSheet, View, TextInput, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import firebase from 'firebase';
import Fire from "../../Components/Fire";
import logo from "../../Images/logo.png"


export default function CreateAccount({ route, navigation }) {

	const { email } = route.params;
	const [password, setPassword] = React.useState(null)

	async function signInFunction() {
	
		await firebase
		.auth()
		.createUserWithEmailAndPassword(email, password)
		.then(() => {
			const user = firebase.auth().currentUser;

			Fire.update("users", {
				id: user.uid,
				email,
			});
			
			navigation.navigate('AppRoutes')
		}).catch(function (error) {
				console.log(error)
		});
	};

	return (
		<View style={styles.screen}>

			<Image source={logo} style={styles.logo} />

			<TextInput placeholder="Senha" secureTextEntry={true} value={password} onChangeText={password => setPassword(password)} style={styles.password}/>

			<Button icon="login" style={styles.signIn} color="#1E0253" onPress={signInFunction}>
				Cadastrar-se
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

	password: {
		fontSize: 20,
		padding: 10,
		backgroundColor: 'white',
		width: 0.75*Dimensions.get('screen').width,
		marginBottom: 5,
		borderRadius: 5,
	},

	signIn: {
		backgroundColor: 'white',
		width: 0.75*Dimensions.get('screen').width,
		borderRadius: 5,
		marginBottom: 100,
	}

});