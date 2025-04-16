import { Dimensions, View, Text, StyleSheet, RefreshControl, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React from 'react';
import { theme } from '../../asset/theme';
import { wp, hp } from '../../helpers/common';
import Button from '../../components/Button';
import AntDesign from '@expo/vector-icons/AntDesign';
import ScreenWrapper from '../../components/ScreenWrapper';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { API_URL } from '../config';

const Portfolio = () => {
    const { user } = useAuth();
    const userId = user.user_id;

    const [isEdit, setIsEdit] = useState(false);
    const [refreshing, setRefreshing] = useState(false)

    const router = useRouter()

    const url = `${API_URL}/api/portfolios`

    // Fetch portfolios
    const fetchPortfolios = async () => {
        // console.log(`userId: ${userId}`)
        
        // const response = await axios.get(`http://10.0.2.2:3000/api/portfolios`, { userId })
        const response = await axios.get(`${url}/${userId}`);
        return response.data
    }

    // Refetch when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            refetch()
        }, [])
    )

    // React query
    const {
        data: portfolioData,
        isLoading,
        isFetching,
        refetch,
    } = useQuery(   {
        queryKey: ["portfolios", userId],
        queryFn: fetchPortfolios,
    })

    // Refetch portfolios when refetchFlag is true
    // Used after modifying portfolios
    useEffect(() => {
        if (router.params?.refetchFlag){
            refetch()
        }
    }, [router.params])
    

    // console.log('portfolioData:', portfolioData);

    // Get culmulative data
    const [totalBaseValue, setTotalBaseValue] = useState(0)
    const [totalCurrValue, setTotalCurrValue] = useState(0) 
    const [change, setChange] = useState(0)
    const [percentChange, setPercentChange] = useState(0)

    useEffect(() => {
        // console.log('LOG: Enter use Effect')
        if (portfolioData &&!isLoading && !isFetching){
            // console.log('LOG: Enter useEffect if statement')

            // console.log(`LOG: portfolioData.total: ${portfolioData.total}`)

            let totalBaseValue = 0;
            let totalCurrValue = 0;

            for (let i = 0; i < portfolioData.total; i++){

                // console.log(`LOG: current portfolio: ${portfolioData.data[i].name}; base investment: ${portfolioData.data[i].base_investment}, total current value: ${portfolioData.data[i].current_valuation}`)

                totalBaseValue += parseFloat(portfolioData.data[i].base_investment);
                totalCurrValue += parseFloat(portfolioData.data[i].current_valuation);
            }

            let percentChange = 0;
            let change = 0;

            // console.log(`Final base value: ${totalBaseValue}`)
            // console.log(`Final current valuation: ${totalCurrValue}`)

            if (totalBaseValue > 0) {
                change = totalCurrValue - totalBaseValue
                percentChange = (((change)/totalBaseValue)*100)
            }

            setTotalBaseValue(totalBaseValue)
            setTotalCurrValue(totalCurrValue)
            setPercentChange(percentChange)
            setChange(change)

        }

    }, [portfolioData, isLoading, isFetching])



    // format a number to $1,000,000.00 format
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    // For changes. Adds + or % or $
    const formatChange = (number, isPercent = false) => {
        const absNum = Math.abs(number)
        const formattedNum = formatNumber(absNum)
        // const prefix = number > 0 ? '+' : '';
        
        
        let prefix = '';
        // positive number
        if (number > 0) {
            prefix = '+'
        } else if (number < 0){
            prefix = '-'
        } 
        
        //                      percentage                      $ value
        return isPercent ? `${prefix}${formattedNum}` : `${prefix}$${formattedNum}`
            


    }

    const getStyle = (change, isPercent = false) => {
        
        let color = theme.sentimentColor.neutral
        let backgroundColor = 'transparent'

        if (change > 0){
            color = theme.sentimentColor.positive;
        } else if (change < 0 ){    
            color = theme.sentimentColor.negative;
        }


        if (isPercent){
            color = theme.colors.primary;
            if (change > 0){
                backgroundColor = theme.sentimentColor.positiveBg;
            } else if (change < 0 ){    
                backgroundColor = theme.sentimentColor.negativeBg;
            } else {
                backgroundColor = theme.sentimentColor.neutralBg;
            }
        }

        // console.log(`LOG: for ${change}, isPercent:${isPercent} j --> color: ${color} backgroundColor: ${backgroundColor}`)
        
        return({
            color: color,
            backgroundColor: backgroundColor,
        })

    }

    const onRefresh = () => {
        setRefreshing(true);
        refetch();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }

    const handleDeleteButton = async(portfolioId) => {
        console.log('Trying to delete portfolio', portfolioId)

        Alert.alert(
            'Confirm Deletion',
            'Are you sure you want to delete this portfolio?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('LOG: Delete portfolio cancelled'),
                    style: 'cancel',
                }, 
                {
                    text: 'OK',
                    onPress: async () => {
                        try{
                            await axios.delete(`${url}/${portfolioId}`)
                            console.log('SUCCESS')
                            setIsEdit(false)
                            refetch();
                        } catch (error){
                            // console.error('Error deleting portfoio', error);
                            console.log('Error deleting portfolio:', error)
                            alert('Failed to delete portfolio. Please try again.')
                        }
                    }

                }
            ],
            { cancelable: false }
        )

    }


    // Render component to render each portfolio
    const renderItem = ( { item } ) => {
        return(
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/portfolio',
                    params: { 
                        portfolioId: item.portfolio_id,
                        name: item.name,
                        baseInvestment: item.base_investment,
                        currentValuation: item.current_valuation,
                        profitLoss: item.profit_loss,
                        percentChange: item.percentage_change,

                    }
                })}
            >
                <View style={styles.portfolio}>
                    <View style={styles.portfolioLeft}>
                        <Text style={styles.portfolioName}>{item.name}</Text>
                        <View style={styles.portfolioBottom}>
                            <Text style={styles.portfolioValue}>${formatNumber(item.current_valuation)}</Text>
                            <Text style={[styles.portfolioChange, getStyle(item.percentage_change, true)]}>{formatChange(item.percentage_change, true)}%</Text>
                        </View>
                    </View>

                    <View style={styles.portfolioOptions}>
                        {isEdit && (
                            <Button 
                                // title={"delete"}
                                icon={<AntDesign name="delete" size={hp(2.5)} color={theme.colors.primary}/>}
                                buttonStyle={styles.deleteButton}
                                textStyle={styles.deleteText}
                                onPress={() => {handleDeleteButton(item.portfolio_id)}}
                            />
                        )}

                    </View>


                </View>

            </TouchableOpacity>
        ) 
    };


    if (isLoading || isFetching){
        return(
            <ScreenWrapper bg={theme.colors.background}>
                <View style={styles.container}>
                    {/* Heading */}
                    <View style={styles.heading}>
                        <Text style={styles.headingText}>My Assets</Text>
                    </View>
                    <Loading />
                </View>
            </ScreenWrapper>
        )
    }

    return(
        <ScreenWrapper bg={theme.colors.background}> 
            <ScrollView 
                contentContainerStyle={{flexGrow: 1}}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.secondary]}
                    />
                }
            >
                <View style={styles.container}>
                    {/* Heading */}
                    <View style={styles.heading}>
                        <Text style={styles.headingText}>My Assets</Text>
                    </View>

                    {/* Value of the whole portfolio*/}
                    <View style={styles.valueHeading}>
                        <View style={styles.valueHeadingTop}>
                            <Text style={styles.allAccounts}>All Accounts</Text>
                            <Text style={styles.totalAsset}>total asset</Text>
                        </View>
                        <Text style={styles.values}>${formatNumber(totalCurrValue)}</Text>
                        <View style={styles.valueHeadingTop}>
                            { /*<Text style={styles.valueProfitLoss}>Profit/Loss</Text> */}
                            <View style={styles.valueHeadingTop}>
                                {/*<Text style={[styles.valueChange, getStyle(change)]}>{formatChange(change)}</Text>
                                <Text style={[styles.valueChange, getStyle(change)]}>{formatChange(percentChange)}%</Text>*/}
                                {change !== 0 && (
                                    <Feather 
                                        name= {change > 0 ? "trending-up" : 'trending-down'}
                                        size={hp(2.5)} 
                                        color= {change > 0 ? theme.sentimentColor.positive : theme.sentimentColor.negative}
                                    />
                            
                                )}
                                <Text style={[styles.valueChange, getStyle(change)]}>{formatChange(change)} ({formatChange(percentChange)}%)</Text>

                            </View>
                        </View>
                    </View>

                    {/* Container for each Portfolios*/}
                    <View style={styles.portfolioContainer}>

                        {/* Title and Add Button*/}
                        <View style={styles.portfolioHeading}>
                            <Text style={styles.portfolioText}>Portfolios</Text>
                            {isEdit ? (
                                <View style={styles.portfolioHeadingOptions}>
                                    <Button 
                                        title="Done"
                                        onPress={() => {setIsEdit(false)}}
                                        textStyle={styles.saveText}
                                        buttonStyle={styles.saveButton}
                                    />
                                </View>
                            ): (
                                <View style={styles.portfolioHeadingOptions}>
                                    <Button 
                                        icon={<Feather name="edit" size={hp(2.2)} color={theme.colors.textLight} />}
                                        buttonStyle={styles.editButton}
                                        textStyle={styles.editText}
                                        onPress={() => {setIsEdit(true)}}
                                    />
                                    <Button 
                                        icon={<Entypo name="plus" size={hp(3)} color={theme.colors.textLight}/>}
                                        buttonStyle={styles.addButton}
                                        textStyle={styles.addText}
                                        onPress={() => {router.push("/addPortfolio")}}
                                    />
                                </View>
                            )}
                        </View>

                        {/* List of each portfolio */}
                        <FlatList 
                            data={portfolioData.data}
                            keyExtractor={(item) => item["portfolio_id"]}
                            renderItem={renderItem}
                            contentContainerStyle={styles.portfolioList}
                            scrollEnabled={false}
                        />

                    </View>

                </View>
            </ScrollView>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: wp(5),
    },

    heading:{
        flexDirection: "row",
        // backgroundColor: "green",
        alignItems: "center",
    },

    headingText:{
        fontSize: hp(4.5),
        color: theme.colors.primary,
        fontWeight: theme.fonts.bold,
        flex: 1,
    },

    valueHeading: {
        paddingVertical: hp(2), 
    },

    valueHeadingTop:{
        flexDirection: 'row',
        gap: wp(1.5),
        alignItems: 'center',
    },

    allAccounts:{
        color: theme.colors.primary,
        fontWeight: theme.colors.bold,
    },

    totalAsset:{
        color: theme.colors.textLight,
        
    },

    valueProfitLoss:{
        color: theme.colors.textLight,
    },

    values: {
        color: theme.colors.primary,
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
    },

    valueChange: {
        // color: theme.sentimentColor.positive,
        fontSize: hp(2),
        fontWeight: theme.fonts.medium,
    },

    valueChangePercent: {
        fontSize: hp(2),
        paddingHorizontal: wp(0.8),
        paddingVertical: wp(1.2),
        borderRadius: 3,
        
    },

    portfolioContainer:{
        backgroundColor: "#1a1a1a",
        paddingVertical: hp(1),
        marginHorizontal: wp(-5),
        padding: wp(3.5),
        gap: hp(1.2),
        flex: 1,
    },

    portfolioHeading: {
        // width: "100%",
        // flex: 1,
        justifyContent: "flex-end",
        // backgroundColor: "red",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hp(1),
        paddingHorizontal: hp(1.5),
        // backgroundColor: "red",
    },

    portfolioText:{
        // backgroundColor: "green",
        fontSize: hp(3),
        fontWeight: theme.fonts.medium,
        color: theme.colors.primary,
        flex: 1,
        fontWeight: theme.fonts.medium,
    },

    portfolioHeadingOptions:{
        flexDirection: "row",
        gap: wp(3),
    },


    addButton:{
        // padding: hp(1),
        backgroundColor: "transparent",
        height: hp(4.5),
    },

    addText:{
        color: theme.colors.textLight,
        fontWeight: theme.fonts.normal,
    },

    editButton:{
        // padding: hp(1),
        backgroundColor: "transparent",
        height: hp(4.5),
    },

    editText:{
        color: theme.colors.textLight,
        fontWeight: theme.fonts.normal,
    }, 

    portfolioList:{
        // backgroundColor: "red",
        gap: hp(1),
    },

    portfolio:{
        // backgroundColor: "blue",
        // fontWeight: theme.fonfts.medium, 
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: hp(2.5),
        backgroundColor: theme.colors.background,
        borderRadius: hp(2),
        
    },

    portfolioLeft:{
        // flexDirection: "row",
        flex: 1,
        // alignItems: "center",
        // justifyContent: "center",
    },

    portfolioName: {
        fontWeight: theme.fonts.medium,
        fontSize: hp(2.25),
        color: theme.colors.primary,
    },

    portfolioBottom: {
        flexDirection: "row",
        gap: wp(2),
        marginTop: hp(0.8),
    },

    portfolioValue: {
        // backgroundColor: "blue",
        alignSelf: "center",
        color: theme.colors.textLight,
    },
    
    portfolioChange: {
        alignSelf: "flex-start",
        paddingHorizontal: wp(1.4),
        paddingVertical: wp(0.8),
        borderRadius: 3,

    },

    portfolioOptions:{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: wp(5),
    },

    

    renameButton:{
        backgroundColor: "transparent",
        height: hp(4),
    },
    
    deleteButton:{
        height: hp(4),
        backgroundColor: "transparent",

    },
    
    saveButton:{
        backgroundColor: theme.colors.primary,
        height: hp(4.5),
        paddingVertical: hp(1),
        paddingHorizontal: hp(2),
        // borderRadius: 50,
    },
    
    saveText:{
        fontWeight: theme.fonts.normal,
        color: theme.colors.inputBg,
        fontSize: hp(1.9),

    },

});


export default Portfolio;

