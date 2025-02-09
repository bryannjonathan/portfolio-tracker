import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../asset/theme';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons'
import { wp, hp } from '../../helpers/common';
import axios from 'axios';

const AddAsset = () => {
    const router = useRouter();
    const [query, setQuery] = useState("")
    const [result, setResult] = useState([])
    const [error, setError] = useState(false)
    const [isStock, setIsStock] = useState(true)

    const { portfolioId } = useLocalSearchParams()

    console.log(`portfolioId: ${portfolioId}`)

    // Fetch Stock or Crypto tickers from the backend
    const fetchTickers = async(query) => {
        try{
            console.log(`isStock: ${isStock}, keyword: ${query}`);

            const url = isStock ? `http://10.0.2.2:3000/api/searchStock?keyword=${encodeURIComponent(query)}` : `http://10.0.2.2:3000/api/searchCrypto?keyword=${encodeURIComponent(query)}`

            const res = await axios.get(url);
            console.log("res", res.data.data);
            setError(false)
            return res.data.data
        } catch (error) {
            console.error("Error fetching tickers: ", error.message)
            setError(true)
            return []
        }
    };
    
    useEffect(() => {
        // delay API calls
        const delayDebounceFn = setTimeout(() => {
            if (query) {
                fetchTickers(query).then((data) => {
                    setResult(data);
                });
            } else {
                setResult([])
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn);

    }, [query, isStock]); 
    
    
    // Render each ticker itme for both Crypto and Ticker
    const renderItem = ({item}) => {
        if (isStock){
            // Stock list
            return(
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname:'/buyAsset',
                        params:{
                            portfolioId: portfolioId,
                            type: 'stock',
                            ticker: item['ticker'],
                            name: item['name'],
                            cryptoId: null,
                        }
                    })}
                >
                    <View style={styles.resultItem}>
                        <View style={styles.tickerLeft}>
                            <Text style={styles.tickerSymbol}>{item["ticker"]}</Text> 
                            <Text style={styles.tickerName}>{item["name"]}</Text>
                        </View>

                        <Text style={styles.tickerExchange}>{item["primary_exchange"]}</Text>
                    </View> 
                </TouchableOpacity>
            )
        } else {
            // Crypto list
            return(
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname:'/buyAsset',
                        params:{
                            portfolioId: portfolioId,
                            type: 'crypto',
                            ticker: item['symbol'],
                            name: item['name'],
                            cryptoId: item['id'],
                        }
                    })}
                >
                    <View style={styles.resultItem}>
                        <View style={styles.tickerLeft}>
                            <Text style={styles.tickerSymbol}>{item["symbol"]}</Text> 
                            <Text style={styles.tickerName}>{item["name"]}</Text>
                        </View>

                        <Text style={styles.tickerExchange}>{item["primary_exchange"]}</Text>
                    </View> 
                </TouchableOpacity>
            )
        }
    };
   
    return(
        <ScreenWrapper bg={theme.colors.background} showNav={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>

                    {/* Top Container: back button and search bar*/}
                    <View style={styles.topHeading}>
                        <BackButton 
                            router={router}         
                        />
                        <Text style={styles.heading}>Add Asset</Text>
                    </View>

                    <View style={styles.body}>
                        <Input 
                            placeholder={"e.g Bitcoin, Apple, NVIDIA"}
                            containerStyles={styles.inputContainer}                        
                            icon={<AntDesign name="search1" size={24} color={theme.colors.textLight}/>}
                            onChangeText={(text) => setQuery(text)}
                        />
                        {/* Switch for Stock and Crypto */}
                        <View style={styles.switchContainer}>
                            <Button
                                title="Stock"
                                onPress={() => setIsStock(true)}
                                buttonStyle={[styles.switchButton , isStock && styles.activeButton]}
                                textStyle={[isStock && styles.activeText, !isStock && styles.inactiveText]}
                            /> 
                            <Button
                                title="Crypto"
                                onPress={() => setIsStock(false)}
                                buttonStyle={[styles.switchButton , !isStock && styles.activeButton]}
                                textStyle={[!isStock && styles.activeText, isStock && styles.inactiveText]}
                            /> 

                        </View>
                    </View>
                    



                    {/* Search resuls */}
                    {/* Display Error/Results/No results text */}
                    {error ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Connection Error</Text>
                        </View>
                    ) : (
                        <FlatList 
                            data={result}
                            keyExtractor={(item) => item["1. symbol"]}
                            renderItem={renderItem}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>{query ? "No results found" : ""}</Text>
                                </View>
                            }
                            contentContainerStyle={styles.resultsContainer}
                        />
                    )}
                     
                </View>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    ) 

    
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingHorizontal: wp(5), 
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

    topContainer:{
        // backgroundColor: "red",
        gap: wp(5),
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        // justifyContent: "center",
    },
    
    inputContainer:{
        height: hp(5), 
        
    },

    emptyContainer:{
        // backgroundColor: "red",
        height: hp(20),
        alignItems: "center",
        justifyContent: "center",
    },

    emptyText:{
        textAlign: "center",
        fontSize: hp(2.5),
        // fontColor: "red",
        color: theme.colors.textLight,
    },

    resultItem:{
        flex:1,
        // backgroundColor: "red",
        marginTop: hp(2),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

    },

    tickerSymbol:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
        
    },

    tickerLeft:{
        flex: 1,
        // width: wp(78),
        flexDirection: "column",
        // backgroundColor: "blue",
    },

    tickerName: {
        fontSize: hp(1.8),
        color: theme.colors.textLight,

    },

    tickerExchange: {
        fontSize: hp(1.5),
        color: theme.colors.textLight,
        // backgroundColor: "red",
        textAlign: "right",


    },

    switchContainer:{
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        marginVertical: hp(2),
    },

    switchButton:{
        flex: 1,
        marginHorizontal: wp(1),
        height: hp(3),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
        backgroundColor: "transparent",
    },

    

    activeText:{
        color: theme.colors.secondary,
        fontSize: hp(1.9),
        fontWeight: "500",
        // textDecorationLine: "underline",
    },

    inactiveText:{
        color: theme.colors.textLight,
        fontSize: hp(1.9),
        fontWeight: "500",
    },

});


export default AddAsset;

