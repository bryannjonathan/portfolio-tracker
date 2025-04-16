import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../asset/theme';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign }from '@expo/vector-icons'
import { wp, hp } from '../../helpers/common';
import axios from 'axios';
import { API_URL } from '../config';

const BuyAsset = () => {
    const router = useRouter();
    
    const { portfolioId, type, ticker, name, cryptoId }  = useLocalSearchParams()

    const [amount, setAmount] = useState(0)
    const [price, setPrice] = useState(0.0)
    const [total, setTotal] = useState(0)
    

    console.log(`In buyAsset.js`)
    console.log(`portfolioId: ${portfolioId}`)
    console.log(`type: ${type}`)
    console.log(`ticker: ${ticker}`)
    console.log(`name: ${name}`)
    console.log(`cryptoId: ${cryptoId}`)

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    useEffect(() => {
        const calcTotal = Number(amount) * Number(price);
        setTotal(calcTotal.toFixed(2))
    }, [amount, price])

    
    const handleBuy = async() => {
        console.log(`Try to purchase ${name} for ${portfolioId}`)
        const quantity = parseFloat(amount);
        const priceVal = parseFloat(price);

        // Validate inputs
        console.log(`Checking input => quantity: ${quantity} ; priceVal: ${priceVal}`)
        if (isNaN(quantity) || quantity <= 0 || isNaN(priceVal) || priceVal <= 0){
            console.log('Bad input values')
            Alert.alert('Invalid input', 'Please enter a valid amount and price')
            return;
        }
        
        console.log('Pass input check')

        const data = {
            portfolioId: portfolioId.toString(),
            type: type.toString(),
            quantity: quantity,
            price: priceVal,
            ticker: ticker.toString(),
            name: name.toString(),
            cryptoId: cryptoId,
        };


        try{
            console.log('Enter try statement')
            const res = await axios.post(`${API_URL}/api/purchase_asset`, data)

            // Logging
            console.log('LOG: Successful purhcase');
            console.log(res)

            Alert.alert(
                'Purchase Successful',
                `Successfuly purchased ${amount} of ${name}.`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // GO back twice
                            router.back();
                            setTimeout(() => router.back(), 100)
                        }
                    }
                ]
            )


        } catch (err){
            console.error(err)            
        }

         


    }

       
    return(
        <ScreenWrapper bg={theme.colors.background} showNav={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View>
                        {/* Top Container: back button and search bar*/}
                        <View style={styles.topHeading}>
                            <BackButton 
                                router={router}         
                            />
                            <Text style={styles.heading}>Buy Asset</Text>
                        </View>

                        <View style={styles.body}>
                            <View style={styles.tickerContainer}> 
                                <Text style={styles.tickerHeading}>{ticker}</Text>
                                <Text style={styles.tickerSubHeading}>{name}</Text>
                            </View>

                            <View style={styles.inputSection}>
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputTitle}>Amount</Text>
                                    <Input 
                                        placeholder={"0"} 
                                        containerStyles={styles.inputContainer} 
                                        textStyle={styles.inputText}
                                        onChangeText={(text) => setAmount(text)}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputTitle}>Average Price (USD)</Text>
                                    <Input 
                                        placeholder={`$${formatNumber(0)}`} 
                                        containerStyles={styles.inputContainer} 
                                        textStyle={styles.inputText}
                                        onChangeText={(text) => setPrice(text)}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.totalText}>Total</Text>
                                    <Text style={styles.totalAmount}>${formatNumber(total)}</Text>
                                </View>
                            </View>


                        </View>
                    </View>


                    <View style={styles.footer}>
                        <Button 
                            title={'Purchase Asset'}
                            buttonStyle={styles.buttonStyle}
                            textStyle={styles.buttonTextStyle}
                            onPress={handleBuy}
                        />
                    </View>
                                             
                </View>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    ) 

    
}

const styles = StyleSheet.create({
    container:{
        flex:1,
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

    body:{
        marginTop: hp(2),
    },
    
    
    backButtonContainer:{
        justifyContent: "center", // center the back button
    },

    tickerContainer:{

    },

    tickerHeading:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.bold,
        fontSize: hp(3.5),
    },

    tickerSubHeading:{
        color: theme.colors.textLight,
        fontSize: hp(2),
    },

    inputSection:{
        marginVertical: hp(2),
        gap: hp(2),
    },

    inputRow:{
        flexDirection: 'row',
        // backgroundColor: 'red',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    inputTitle:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
        fontSize: hp(2),
    },

    inputContainer:{
        width: wp(40),
        // backgroundColor: 'blue',
        height: hp(5),
        borderRadius: 12,
    },

    inputText:{
        textAlign: 'right',
    },

    totalText:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
        fontSize: hp(2),
    },

    totalAmount:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
        fontSize: hp(2.2),
    },

    buttonStyle:{
        height: hp(5.5),
    },

    footer:{
        paddingVertical: hp(3),
        // position: 'absolute',
    }
   
});


export default BuyAsset;

