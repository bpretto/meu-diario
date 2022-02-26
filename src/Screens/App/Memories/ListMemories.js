import React from 'react';
import { View, StyleSheet, Dimensions, Text, ScrollView, SafeAreaView } from 'react-native';
import { Card, Paragraph, Searchbar, Title, FAB } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ModalDatePicker } from "react-native-material-date-picker";
import firebase from "firebase"
import  { GetShortFormattedDate } from '../../../Components/Date';

export default function ListMemories({ route, navigation }) {

	const user = firebase.auth().currentUser
    const [searchText, setSearchText] = React.useState('')
    const [searchDate, setSearchDate] = React.useState(null)
    const [cardsArray, setCardsArray] = React.useState([])

    React.useEffect(() => { loadMemories() }, []);

    function loadMemories() {
        firebase
        .database()
        .ref(`memories/${user.uid}`)
        .on('value', function (snapshot) {
            setCardsArray([])
            snapshot.forEach((one) => {
                const card = {
                    title: one.val().title,
                    subtitle: one.val().subtitle,
                    date: new Date(one.val().date),
                    imageId: one.val().imageId,
                    id: one.val().id,
                    latitude: one.val().latitude,
                    longitude: one.val().longitude,
                    note: one.val().note,
                };

                setCardsArray((oldArray) => [...oldArray, card]);
            });
        });
    }
    
    async function searchByTitle() {  
        loadMemories()      
        if (searchText !== '') {
            setCardsArray(cardsArray.filter((one) => {
                return one.title == searchText
            }))
        }
    }

    async function searchByDate(date) {
        setSearchDate(null)
        loadMemories()
        const dateZeroHours = date.setHours(0,0,0,0)
        setSearchDate(dateZeroHours)
        setCardsArray(cardsArray.filter((one) => {
            const oneDate = one.date.setHours(0,0,0,0)
            return oneDate == dateZeroHours
        }))
    }

    function removeSearchByDate() {
        setSearchDate(null);
        loadMemories()
    }

    cardsArray.sort((a,b) => {
        return a.date < b.date;
    });

    function navigateCard(id) {
        cardsArray.map((card) => {
            if (card.id == id) {
            navigation.navigate('ListIndividualMemory', {
                user,
                card
            })
            }

        })
    }

    function navigateCreateMemory() {
        navigation.navigate('CreateMemory', { user })
    }

    return (
        <View style={styles.screen}>
            
            <View style={styles.searchView}>
                <Searchbar
                    iconColor="white"
                    placeholder="Buscar"
                    placeholderTextColor="white"
                    style={styles.searchBar}
                    inputStyle={{ color: 'white' }}
                    value={searchText}
                    onChangeText={searchText => setSearchText(searchText)}
                    onIconPress={searchByTitle}
                />
                
                <ModalDatePicker
                button={
                    <View style={styles.dateFilterButton}>
                        <MaterialCommunityIcons name="calendar" size={26} color='white' />
                        <Text style={styles.dateFilterButtonText}>
                            Filtrar por data
                        </Text>
                        {searchDate && (
                            <MaterialCommunityIcons onPress={removeSearchByDate} name="close" size={26} color='white' />
                        )}
                    </View>
                }    
                onSelect={(date) => searchByDate(date)}
                isHideOnSelect={true}
                initialDate={new Date()}    
              />
                
            </View>


            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {cardsArray.map((card) => (
                        <Card key={card.id} style={styles.card} accessible={true} onPress={() => navigateCard(card.id)} >
                            <Card.Content style={styles.cardContent}>
                                <Title style={styles.cardTitle}>{card.title}</Title>
                                <Paragraph style={styles.cardParagraph}>{GetShortFormattedDate(new Date(card.date))}</Paragraph>
                            </Card.Content>
                        </Card>
                    ))}
                </ScrollView>
            </SafeAreaView>

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={navigateCreateMemory}
            />

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

    searchView: {
        width: Dimensions.get('screen').width,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    searchBar: {
        width: 0.45*Dimensions.get('screen').width,
        marginLeft: 0.04*Dimensions.get('screen').width,
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#1E0253',
        color: 'white'
    },

    dateFilterButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 0.45*Dimensions.get('screen').width,
        height: 48,
        marginRight: 0.04*Dimensions.get('screen').width,
        marginTop: 10,
        alignSelf: 'flex-end',
        backgroundColor: '#1E0253',
        color: 'white',
        borderRadius: 5,
        padding: 12
    },

    dateFilterButtonText: {
        marginHorizontal: 5,
        alignSelf: 'center',
        fontSize: 18,
        color: 'white'
    },

    safeAreaView: {
        marginBottom: 220,
        marginTop: 10,
        width: 0.92*Dimensions.get('screen').width,        
    },

    card: {
        marginBottom: 10
    },

    cardContent: {
        alignItems: 'center'
    },

    fab: {
        backgroundColor: '#1E0253',
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 166,
      },
})