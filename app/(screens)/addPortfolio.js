import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../../asset/theme';
import { wp, hp } from '../../helpers/common';
import ScreenWrapper from '../../components/ScreenWrapper';
import BackButton from '../../components/BackButton';
import { useRouter } from 'expo-router';
import Input from '../../components/Input';
import { useState } from 'react';
import Button from '../../components/Button';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';



const addPortfolio = () => {
    const router = useRouter();
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const { user }  = useAuth();

    const handlePress = async () => {
        console.log(`Trying to add portfolio ${name} for user ${user.user_id}`)
        
        if (!name.trim()){
            console.log("what")
            Alert.alert("Error", "Portfolio name cannot be empty") 
            return;
        }

        setLoading(true)

        try{
            console.log("enter try");
            const url = "http://10.0.2.2:3000/api/portfolios/" 
            const userId = user.user_id;

            const res = await axios.post(url, { userId, name });
            
            Alert.alert("Succes", res.data.message, [
                { text: "OK", onPress: () => router.back()}
            ])

            console.log("sucess");

        } catch (error) {
            if (error.response && error.response.data){
                // API error message 
                Alert.alert("Error", error.response.data.message);
            } else {
                console.log(error);
                Alert.alert("Error", "Something went wrong. Please try again");
            }

        } finally {
            setLoading(false);
        }

    

    }
    
    return(
        <ScreenWrapper bg={theme.colors.background} showNav={false}> 
            <View style={styles.container}>
                <View>
                    <View style={styles.topHeading}>
                        <BackButton 
                            router={router}         
                        />
                        <Text style={styles.heading}>Add Portfolio</Text>
                    </View>

                    <View style={styles.body}>
                        <Text style={styles.title}>Enter portfolio name</Text>
                        <Input 
                            placeholder={"e.g Retirement, Japan Trip, New Computer"}
                            containerStyles={styles.inputContainer}                        
                            onChangeText={(text) => setName(text)}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Button 
                        buttonStyle={styles.saveButton}
                        textStyle={styles.saveText}
                        title={"SAVE"}
                        onPress={handlePress}
                    />
                </View>
                
            </View>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: wp(5),
        justifyContent: 'space-between',
    },

    topHeading:{
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(5),
    },

    heading:{
        color: theme.colors.primary,
        fontSize: hp(3.1),
        fontWeight: theme.fonts.bold,
    },

    title:{
        color: theme.colors.primary,
        fontSize: hp(3.3),
        fontWeight: theme.fonts.bold,
    },

    body:{
        marginVertical: hp(2),
        gap: hp(1.2),
    },

    inputContainer:{
        // height: hp(6.7),
    },

    footer:{
        // alignSelf: 'flex-end',
        paddingVertical: hp(3),
    },

    saveButton: {
        height: hp(5.5),
    },


});


export default addPortfolio;

