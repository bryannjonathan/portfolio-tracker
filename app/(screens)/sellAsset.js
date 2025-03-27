import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect, } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../asset/theme';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { wp, hp } from '../../helpers/common';
import axios from 'axios';
import Slider from '@react-native-community/slider';

const SellAsset = () => {
    const router = useRouter();
    
    const { portfolioId, ticker, name, amount, lastPrice, asset_id }  = useLocalSearchParams()

    const [price, setPrice] = useState(lastPrice)
    const [total, setTotal] = useState(0)
    const [sliderValue, setSliderValue] = useState(0);
    const [sellAmount, setSellAmount] = useState(0);

    const numericAmount = parseFloat(amount || '0');

    useEffect(() => {
        if (numericAmount > 0){
            const newSellAmount = (sliderValue / 100) * numericAmount;
            setSellAmount(newSellAmount.toFixed(4));
            setTotal(newSellAmount * parseFloat(price || lastPrice || 0));
        }
    },[sliderValue])
    

    // console.log(`In SellAsset.js
    //     portfolioId: ${portfolioId},        
    //     ticker: ${ticker},
    //     name: ${name},
    //     amount: ${amount},
    //     last price: ${lastPrice},
    //     asset_id: ${asset_id},
    // `)

    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }
    
    const handleBuy = async() => {
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
                            <Text style={styles.heading}>Sell Asset</Text>
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
                                        inputType={"number"}
                                        value={sellAmount}
                                        onChangeText={(text) => {
                                            let numeric = parseFloat(text) || 0;
                                            setSellAmount(numeric);

                                            if (numericAmount > 0) {
                                                const percent = (numeric / numericAmount) * 100;
                                                setSliderValue(Math.min(100, Math.max(0, percent)))
                                                setTotal(numeric * parseFloat(price || lastPrice || 0));
                                            }
                                        }}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.inputTitle}>Average Price (USD)</Text>
                                    <Input 
                                        placeholder={lastPrice} 
                                        containerStyles={styles.inputContainer} 
                                        textStyle={styles.inputText}
                                        value={price}
                                        onChangeText={(text) => setPrice(text)}
                                    />
                                </View>

                                <View style={styles.inputRow}>
                                    {/* Slider */}
                                    <Slider
                                        style={{width: wp(75), height: 40}}
                                        minimumValue={0}
                                        step={1}
                                        maximumValue={100}
                                        minimumTrackTintColor={theme.colors.primary}
                                        maximumTrackTintColor={theme.colors.primary}
                                        thumbTintColor={theme.colors.secondary}
                                        onValueChange={(value) => setSliderValue(value)}
                                        // value={sliderValue}
                                    />
                                    <Text style={styles.inputTitle}>{sliderValue}%</Text>
                                </View>

                                <View style={styles.inputRow}>
                                    <Text style={styles.totalText}>Total</Text>
                                    <Text style={styles.totalAmount}>${formatNumber(total)}</Text>
                                </View>
                            </View>



                        </View>
                    </View>

                    {/* Sell Button */}
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


export default SellAsset;

