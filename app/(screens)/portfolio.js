import { Dimensions, View, Text, StyleSheet, RefreshControl, FlatList, ScrollView } from 'react-native';
import { theme } from '../../asset/theme';
import { wp, hp } from '../../helpers/common';
import Button from '../../components/Button';
import AntDesign from '@expo/vector-icons/AntDesign';
import ScreenWrapper from '../../components/ScreenWrapper';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';

import BackButton from '../../components/BackButton';


const PortfolioDetail = () => {
    const router = useRouter();


    const { portfolioId, name, baseInvestment, currentValuation, profitLoss, percentChange } = useLocalSearchParams();

    return(
        <ScreenWrapper bg={theme.colors.background}>
            <BackButton 
                router={router}
            />

            <Button 
                onPress={() => router.push({
                    pathname: '/addAsset',
                    params: {
                        portfolioId: portfolioId,
                    }
                })} 
                title={"Add Asset"}
            />

            

            <Text>Hello</Text>
            <Text>{portfolioId}</Text>
            <Text>{name}</Text>
            <Text>{baseInvestment}</Text>
            <Text>{currentValuation}</Text>
            <Text>{profitLoss}</Text>
            <Text>{percentChange}</Text>
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
        color: theme.sentimentColor.positive,
        fontSize: hp(2),
        fontWeight: theme.fonts.medium,
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
    },

    portfolioValue: {
        // backgroundColor: "blue",
        alignSelf: "center",
        color: theme.colors.textLight,
    },
    
    portfolioChange: {
        // backgroundColor: "green",
        alignSelf: "flex-start",
    },

    portfolioOptions:{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: wp(5),
    },

    positiveChange:{
        color: theme.sentimentColor.positive,
    },

    negativeChange:{
        color: theme.sentimentColor.negative,
    },
    
    neutralChange:{
        color: theme.sentimentColor.neutral,
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


export default PortfolioDetail;

