import React, { useState, useEffect } from 'react'
import { View, Text, Image, SafeAreaView, TouchableOpacity, StyleSheet, FlatList, ScrollView, Linking, RefreshControl} from 'react-native'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'expo-router'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../asset/theme'
import Input from '../../components/Input'
import { AntDesign } from '@expo/vector-icons'
import { hp, wp } from '../../helpers/common'
import { useInfiniteQuery } from '@tanstack/react-query'
// import Loading from './Loading'
import axios from 'axios'
import Button from '../../components/Button'
import Loading from '../../components/Loading'
import FakeInput from '../../components/FakeInput'
import { API_URL } from '../config'


const Home = () => {
    
    const { user, setAuth } = useAuth();
  const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    

  const handleLogout = () => {
    setAuth(null);  // Clear the auth state
    router.replace('/(screens)/welcome');  // Redirect to login
  }

    const handleSearchPress = () => {
        router.push("/(screens)/search")
    }

    console.log(`auth = ${user}`)
    

    const fetchNews = async ({ pageParam = 1 }) => {
        console.log(`Fetch news for page ${pageParam}`)
        const limit = 10;
        const res = await axios.get(`${API_URL}/api/news?page=${pageParam}&limit=${limit}`);

        // console.log(`API Response:`, res.data);

        return res.data.data;
    } 

    // useEffect( () => {
    //     fetchNews();
    // }, []);

    // React query for news fetching
    const {
        data: newsData,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["news"],
        queryFn: fetchNews,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || lastPage.length == 0){
                return undefined;
            } 

            return allPages.length + 1;


        },
        staleTime: 1000 * 60 * 1, // 5 minutes
        retry: 2,
        onError: (err) => console.error("Failed to fetch news:", err)   
    });

    // Refresh method 
    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }


    // loading
    // TODO: Modify this more
    if (isLoading){
        return(
            <ScreenWrapper bg={theme.colors.background}>
                <View style={styles.errorContainer}>
                    <Loading />
                </View>
            </ScreenWrapper>        
        )
    }

    // error
    if (isError){
            
        return(
            <ScreenWrapper bg={theme.colors.background}>
                <View style={styles.errorContainer}>
                    <Image 
                        source = {require("../../asset/images/503Error.png")}
                        style = {styles.errorImage}
                    />

                    {/*<Text style={styles.errorHeader}>Failed to fetch news</Text> */} 
                    <Text style={styles.errorText}>Failed to fetch news. Please check your connection.</Text>

                    <Button 
                        title="Retry"
                        onPress={() => refetch()}
                        buttonStyle={styles.retryButton}
                        textStyle={styles.retryButtonText}
                    />
                </View>
            </ScreenWrapper>
        )
    }

    // for (let i = 0; i < 10; i++){
    //     console.log(newsData[i].ticker_sentiment)
    // }

    // Render each ticket sentiment
    const renderTicker = (tick) => { 

        if (!tick){
            // console.log("no ticker")
            return null
        }
        
        // console.log(tick.ticker_sentiment_label);
        let backgroundColor = theme.sentimentColor.neutral;

        if (tick.sentiment == "positive"){
            backgroundColor = theme.sentimentColor.positive;
        } else if (tick.sentiment == "negative"){
            backgroundColor = theme.sentimentColor.negative;
        }

        return(
            <View style={[ styles.ticker, {backgroundColor} ]}>
                <Text style={styles.tickerText}>{tick.ticker}</Text>
            </View>
        )
    }


    // Render each news item
    const renderItem = ({ item }) => {

        const tickerSent = item.insights || [];

        // nsole.log("tickerSent: ",tickerSent);
        
        const handlePress = () => {
            if (item.url){
                Linking.openURL(item.article_url).catch((err) => console.error("Failed to open link:", err));
            }
        }
        
        return(
            <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                <View style={styles.newsContainer}>
                    <View style={styles.newsHeading}>
                        <Text style={styles.newsTitle}>{item.title}</Text>
                        <Text style={styles.newsAuthor}>{item.publisher.name}</Text>

                        <View style={styles.tickerContainer}> 
                            {tickerSent.map((tick) => renderTicker(tick))}
                        </View> 
                    </View>
                    <Image
                        source={ { uri:item.image_url } }
                        style={styles.newsImg}
                        resizeMode="cover"
                    />
                </View>
            </TouchableOpacity>
        )
    }

    // console.log("Updated newsData:");
    // console.log(newsData);
    //
    // for(let i = 0; i < 10; i++){
    //     console.log(newsData[i].title)
    // }
    


    // Render load more button
    const RenderFooter = () => {
        if (isFetchingNextPage) {
            return <Loading/>
        } 
        
        if (hasNextPage){
            return(
                <View style={styles.loadMoreContainer}>
                    <Button 
                        title="Load More"
                        onPress={() => fetchNextPage()}
                        buttonStyle={styles.loadMoreButton}
                        textStyle={styles.loadMoreText}
                    />
                </View>
            )
        }
    }

    // Successful fetch news, main screen display
     return (
        <ScreenWrapper bg={theme.colors.background}>
            
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.secondary]}
                    />
                }
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerGreeting}>hello,</Text>
                        <Text style={styles.headerUsername}>{user.username}</Text>
                    </View>

                    {/* Search bar */}
                    <FakeInput 
                        text="Enter the ticker you want to search"
                        icon={<AntDesign name="search1" size={24} color={theme.colors.textLight}/>}
                        height={hp(5)}
                        onPress={() => router.push("/search")}
                    />

                    {/* News part */}
                    <FlatList  
                        data={newsData?.pages.flat() || []}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        style={styles.tickerList}
                        ListFooterComponent={RenderFooter}
                    />

                </View>
            </ScrollView>
        </ScreenWrapper>
    ); 
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: wp(5),
        gap: 10,
    },

    header: {
        gap: 0,
    },

    headerGreeting:{
        color: theme.colors.primary,
        fontSize: hp(3),
        // backgroundColor: "red", 
    },

    headerUsername:{
        color: theme.colors.primary,
        fontSize: hp(4.5),
        fontWeight: theme.fonts.extrabold, 
        // backgroundColor/: "blue",
    },
    
    searchButton:{
        flexDirection: "row",
        height: hp(5),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: theme.colors.inputBg,
    },

    searchText:{
        flex: 1,
        fontSize: hp(1.9), 
        paddingHorizontal: 20,
        color: theme.colors.textLight,
        fontStyle: theme.fonts.extrabold,
    },


    newsContainer:{
        // backgroundColor: theme.colors.inputBg,
        // padding: wp(2),
        marginVertical: wp(2),
        flex: 1,
        flexDirection: "row",

    },

    newsHeading:{
        flex: 1,
        width: wp(10), 
        marginRight: wp(3),
        gap: 2,
    },
    
    newsTitle:{
        color: theme.colors.primary,

    },

    newsAuthor:{
        color: theme.colors.textLight,
        fontSize: hp(1.5),

    },

    newsImg:{
        height: hp(10),
        width: wp(30),
        borderRadius: 8,
        // width: "100%",
          
    },

    ticker:{
        borderRadius: 3,
        paddingVertical: wp(0.8),
        paddingHorizontal: wp(1.4),
        marginRight: wp(2),
        marginVertical: hp(0.5),
        backgroundColor: "red",
        color: "white",
        fontSize: hp(1.5),
    },

    tickerContainer:{
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: hp(0.5),
    },

    tickerText:{
        color: "white",
        fontSize: hp(1.5),
    },

    retryButton:{
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: wp(4),
        height: hp(5),
        // width: wp(20),
        width: wp(75),
        borderRadius: 12,
    },

    retryButtonText: {
        color: "white",
        fontSize: hp(2),
        fontWeight: theme.fonts.bold,
    },

    errorContainer:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: wp(5),

    },

    errorHeader:{
        fontStyle: theme.fonts.semibold,
        fontSize: hp(3),
        textAlign:"center",
        color: theme.colors.primary,
        
    },

    errorText:{
        color: theme.colors.textLight,
        fontSize: hp(2),
        textAlign:"center",
        width: wp(70),
        marginBottom: hp(2),
    },   

    errorImage: {
        width: hp(50),
        height: hp(50),
    },

    loadMoreContainer:{
        // backgroundColor: "red",   
        // alignItems: "center",
        paddingVertical: hp(3),
    },

    loadMoreButton:{
        backgroundColor: theme.colors.inputBg,
        height: hp(5),
        // width: wp(30),
    },

    loadMoreText:{
        fontSize: hp(1.7),
        color: theme.colors.textLight,
    },


})

