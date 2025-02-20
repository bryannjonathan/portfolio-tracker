import { Alert, View, Text, StyleSheet, TextInput, FlatList, ScrollView, Modal } from 'react-native';
import { theme } from '../../asset/theme';
import { wp, hp } from '../../helpers/common';
import Button from '../../components/Button';
import ScreenWrapper from '../../components/ScreenWrapper';
import Entypo from '@expo/vector-icons/Entypo';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Loading from '../../components/Loading';
import BackButton from '../../components/BackButton';
import { PieChart } from 'react-native-chart-kit'; 
import OptionButton from '../../components/OptionButton';
import { Provider } from 'react-native-paper';
import Input from '../../components/Input';

const Portfolio = () => {
    const router = useRouter();
    const { portfolioId, name, baseInvestment, currentValuation, profitLoss, percentChange } = useLocalSearchParams();

    const [isError, setIsError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPortfolioName, setNewPortfolioName] = useState(name);
    const [portfolioName, setPortfolioName] = useState(name);
    const [modalLoading, setModalLoading] = useState(false);

    // Fetch the assets
    const url = `http://10.0.2.2:3000/api/assets`
    const fetchAssets = async () => {
        try{
            console.log(`LOG: Fetching assets for portfolio ${portfolioId}`)
            const response = await axios.get(url, { params : { portfolioId: portfolioId}})
            console.log("LOG: response.data:", response.data)
            return response.data
        } catch (error){
            // Todo: differentiate empty asset and error fetching
            console.log('Error fetching data:', error)
            setIsError(true);
            console.log('empty asset')
            return {
                'success': false,
                'data':[],
                'message': 'Error fetching portfolio',
            } 
            
        }
    }

    // React query
    const {
        data: assetRes,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ["assets", portfolioId],
        queryFn: fetchAssets,    
        refetchOnMount: true,
    })

    const assets = assetRes?.data || [];
    console.log('LOG: assets: ', assets)


    // Refetch assets list when flag is true
    // Used after user adds an asset to the portfolio
    useEffect(() => {
        if(router.params?.refetchFlag){
            refetch();
        }
    }, [router.params?.refetchFlag])

    console.log('LOG: assets: ', assets)



    // Aggregate values by sector
    // When finished fetching data
    const sectorDistribution = assets.reduce((acc, asset) => {
        const amount = parseFloat(asset.amount);
        const currentPrice = parseFloat(asset.current_price);

        if(!isNaN(amount) && !isNaN(currentPrice)){
            console.log(asset.sector)
            acc[asset.sector] = (acc[asset.sector] || 0) + (amount * currentPrice)
        }

        return acc;

    }, {});

    const tickerDistribution = assets.reduce((acc, asset) => {
        const amount = parseFloat(asset.amount);
        const currentPrice = parseFloat(asset.current_price);

        if(!isNaN(amount) && !isNaN(currentPrice)){
            console.log(asset.symbol)
            acc[asset.symbol] = (acc[asset.symbol] || 0) + (amount * currentPrice)
        }

        return acc;
    }, {});

    console.log('LOG: final acc', tickerDistribution)

    // Assing colors to sectors based on their order
    const tickerColorMap = {};
    const pieChartColors = theme.pieChart;
    assets.forEach((asset, index) => {
        if (!tickerColorMap[asset.symbol]){
            const colorKey = (index % Object.keys(pieChartColors).length) + 1;
            tickerColorMap[asset.symbol] = pieChartColors[colorKey];
        }
    });



    // Transform arrays into the chart
    const sectorData = {
        labels: Object.keys(tickerDistribution),
        datasets: [
            {
                data: Object.values(tickerDistribution),
            }
        ]
    }

    const tickerData = Object.keys(tickerDistribution).map((key) => ({
        name: key,
        population: tickerDistribution[key],
        color: tickerColorMap[key],
        legendFontColor: theme.colors.primary,
        legendFontSize: hp(1.5),
    }))

    console.log('LOG: tickerData: ',tickerData)
    

    // Handle delete portfolio
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
                            await axios.delete(`http://10.0.2.2:3000/api/portfolios/${portfolioId}`)
                            console.log('SUCCESS')

                            router.replace({
                                pathname: '/assets',
                                params: { refetchFlag: true }
                            })
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

    // Handle rename portfolio
    const handleRenameButton = () => {
        setModalVisible(true);
    }

    const handleRenameConfirm = async(newName) => {
        console.log(`LOG: Trying to rename ${portfolioId} to ${newName}`)

        if(newName.trim()){
            try{
                setModalLoading(true);
                const respond = await axios.patch(`http://10.0.2.2:3000/api/portfolios/${portfolioId}`,{ newName: newName })                
            
                setPortfolioName(newName);
                setModalLoading(false)
                setModalVisible(false);

                Alert.alert('Success', 'Portfolio renamed successfully')

            } catch (error) {
                console.log('LOG: Error renaming portfolio', error)
                setModalLoading(false);
                setModalVisible(false);
                Alert.alert('Error', 'Failed to rename portfolio. Please try again.')

            }

        } else {
            Alert.alert('Error', 'Please enter a valid portfolio name')
        }

        setNewPortfolioName(portfolioName);
    }

    const handleRenameCancel = () => {
        setModalLoading(false);
        setModalVisible(false);
        setNewPortfolioName(portfolioName);
    }

    // Functiosn to format/style numbers
    // Format number to $1,000,000.00 format
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

    const renderAsset = ({item}) => {
        const totalValue = parseFloat(item.amount) * parseFloat(item.current_price);
        // console.log(item.percent_change);
        const profitLoss = totalValue - (parseFloat(item.average_buy_price) * parseFloat(item.amount));
        const percentChange = ( profitLoss / parseFloat(item.average_buy_price)) * 100;
        // console.log(percentChange)
        return(
            <View style={styles.asset}>
                <View style={styles.topAsset}>
                    <View style={styles.row}>
                        <Text style={styles.assetSymbol}>{item.symbol}</Text>
                        <Text style={styles.currentAssetPrice}>{item.sector}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.subHeadingAsset}>Amount</Text>
                        <Text style={styles.assetValue}>{item.amount}</Text>
                    </View>
                </View>

                {/* Evaluation */}
                <View style={styles.row}>
                    <Text style={styles.subHeadingAsset}>Evaluation</Text>
                    <Text style={styles.assetValue}>${formatNumber(totalValue)}</Text>
                </View>

                {/* Last Price */}
                <View style={styles.row}>
                    <Text style={styles.subHeadingAsset}>Last Price</Text>
                    <Text style={styles.assetValue}>${formatNumber(item.current_price)}</Text>
                </View>
                
                {/* Average Buy Price */}
                <View style={styles.row}>
                    <Text style={styles.subHeadingAsset}>Avg Price</Text>
                    <Text style={styles.assetValue}>${formatNumber(item.average_buy_price)}</Text>
                </View>

                {/* Profit/loss and $ */}
                <View style={styles.row}>
                    <Text style={styles.subHeadingAsset}>Profit/Loss</Text>
                    <Text style={styles.assetValue}>{formatChange(profitLoss, false)}</Text>
                    <Text style={styles.assetValue}>({formatChange(percentChange, false)}%)</Text>
                </View>

                <Button 
                    title="SELL" 
                    onPress={() => {}}
                    buttonStyle={styles.sellButton}
                    textStyle={styles.sellButtonText}
                />

            </View>
        )
    }

    const emptyData = [
        {
            name: 'No data',
            population: 1,
            color: theme.colors.inputBg,
            legendFontColor: theme.colors.primary,
            legendFontSize: hp(1.5),
        }
    ]

    if (isLoading || isFetching){
        <ScreenWrapper>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <View style={styles.backButtonContainer}>
                        <BackButton 
                            router={router}
                        />
                    </View>
                    <Text style={styles.titleHeading}>{name}</Text>
                </View>
                <Loading />
            </View>
        </ScreenWrapper>
    }

    // For the menu options button (three dots)
    const options = [
        {
            title: 'Rename Portfolio',
            onPress: () => {handleRenameButton()}
        },
        {
            title: 'Delete Portfolio',
            onPress: () => {handleDeleteButton(portfolioId)}
        }
    ]

    // TODO: if assets not long enough, asset container doesn't grow until bottom.
    return(
        <Provider>
            <ScreenWrapper bg={theme.colors.background}>
                <ScrollView
                    // contentContainerStyle={ { flexGrow : 1 } }
                >
                <View style={styles.container}>
                    <View style={styles.heading}>
                        <View style={styles.headingLeft}>
                            <View style={styles.backButtonContainer}>
                                <BackButton 
                                    router={router}
                                />
                            </View>
                            <Text style={styles.titleHeading}>{portfolioName}</Text>
                        </View>
                        <OptionButton options={options}/>
                    </View>
                    <View style={styles.subHeading}>
                        <View style={styles.valueContainer}>
                            <Text style={styles.portfolioValue}>${formatNumber(currentValuation)}</Text>
                            <View style={styles.valueBottom}>
                                <Text style={[styles.portfolioChange, getStyle(profitLoss)]}>{formatChange(profitLoss)}</Text>
                                <Text style={[styles.portfolioChange, getStyle(profitLoss)]}>({formatChange(percentChange, true)}%)</Text>
                            </View>
                        </View>
                        
                    </View>

                    {/* Ticker Pie Chart section */}
                    <View style={styles.pieChartContainer}>
                        {assets.length === 0 ? (
                            // Empty Pie Chart
                            <PieChart 
                                data={emptyData} 
                                width={wp(90)}
                                height={hp(30)}
                                chartConfig={{
                                    backgroundColor: 'blue',
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(26, 255, 146 ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                        backgroundColor: 'blue',
                                        alignItems: 'center',
                                    },
                                    strokeWidth: 3,
                                }}
                                accessor='population'
                                paddingLeft={6.5}
                                backgroundColor='transparent'
                                hasLegend={false}
                            />
                        ): (
                            <PieChart 
                                data={tickerData} 
                                width={wp(90)}
                                height={hp(30)}
                                chartConfig={{
                                    backgroundColor: 'blue',
                                    decimalPlaces: 2,
                                    color: (opacity = 1) => `rgba(26, 255, 146 ${opacity})`,
                                    style: {
                                        borderRadius: 16,
                                        backgroundColor: 'blue',
                                        alignItems: 'center',
                                    },
                                    strokeWidth: 3,
                                }}
                                accessor='population'
                                paddingLeft={6.5}
                                backgroundColor='transparent'
                            />
                        )}
                    </View>

                    {/* Modal for Renaming Portfolio */}
                    <Modal
                        visible={modalVisible}
                        onRequestClose={handleRenameCancel}
                        transparent={true}
                        animationType="fade"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Rename Your Portfolio</Text>

                                {/* Text input for new portfolio name */}
                                {/* <TextInput 
                                    style={styles.modalInput}
                                    placeholder={"Enter new portfolio name"}
                                    value={newPortfolioName}
                                    onChangeText={(text) => setNewPortfolioName(text)}
                                /> */}
                                <Input 
                                    placeholder={"Enter new portfolio name"}
                                    value={newPortfolioName}
                                    onChangeText={(text) => setNewPortfolioName(text)}
                                    containerStyles={styles.modalInput}  
                                />

                                {/* Buttons to confirm or cancel */}
                                <View style={styles.modalButtonContainer}>
                                    <Button title={"Cancel"} textStyle={styles.modalText} buttonStyle={[styles.modalButton, styles.cancelButton]} onPress={handleRenameCancel}/>
                                    <Button title={"Rename"} textStyle={styles.modalText} buttonStyle={styles.modalButton} onPress={() => handleRenameConfirm(newPortfolioName)} loading={modalLoading}/>
                                </View>


                            </View>
                        </View>
                    </Modal>



                    {/* Asset list */}
                    <View style={styles.assetListContainer}>
                        {/* Title and Button */}
                        <View style={styles.assetsSectionHeading}>
                            <Text style={styles.assetsTitle}>Assets</Text>
                            <Button 
                                icon={<Entypo name="plus" size={hp(2.5)} color={theme.colors.primary} />}
                                onPress={() => router.push({
                                    pathname: '/addAsset',
                                    params: {
                                        portfolioId: portfolioId,
                                    }
                                })} 
                                buttonStyle={styles.addButton}
                            />
                        </View>
                        <FlatList
                            data={assets}
                            renderItem={renderAsset}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.assetList}
                            scrollEnabled={false}
                        />
                    </View>
                </View>
                </ScrollView>
            </ScreenWrapper>
        </Provider>

    )
    
}
export default Portfolio; 

const styles = StyleSheet.create({
    container:{
        flex: 1,
        paddingHorizontal: wp(5),
        mingHeight: '100%',
    },

    heading:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // backgroundColor: 'red',
        gap: wp(5),

    },

    headingLeft:{
        gap: wp(5),
        flexDirection: 'row',
        alignItems: 'center',
    },

    titleHeading: {
        fontSize: hp(3.1),
        color: theme.colors.primary,
        fontWeight: theme.fonts.bold,
    },

    backButtonContainer: {
        // center the back button
        justifyContent: 'center',
        alignItems: 'center',
    },

    subHeading:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: hp(2),
    },

    // edit button style
    editButton:{
        // padding: hp(1),
        backgroundColor: "transparent",
        height: hp(4.5),
    },

    valueContainer:{

    },

    valueBottom:{
        flexDirection: 'row',
        gap: wp(1.5),
    },

    addButton:{
        height: hp(4.5),
        backgroundColor: 'transparent',
    },

    portfolioValue:{
        fontSize: hp(4),
        color: theme.colors.primary,
        fontWeight: theme.fonts.bold,
    },

    portfolioChange:{
        fontSize: hp(2),
        fontWeight: theme.fonts.medium,
    },

    pieChartContainer:{
        flex: 1,
        // backgroundColor: 'red',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Assets list section
    assetListContainer:{
        backgroundColor: theme.colors.secondaryBg,
        paddingVertical: hp(1),
        marginHorizontal: wp(-5),
        padding: wp(3.5),
        gap: hp(1.2),
        flex: 1,
        flexGrow: 1,
    },

    assetsSectionHeading:{
        // justifyContent: "flex-end",
        flexDirection: "row",
        // alignItems: "center",
        paddingVertical: hp(1),
        paddingHorizontal: hp(1.5),

        // backgroundColor : 'red'
    },

    assetsTitle:{
        fontSize: hp(3),
        fontWeight: theme.fonts.medium,
        color: theme.colors.primary,
        flex: 1,
        fontWeight: theme.fonts.medium,
    },

    // Asset list section
    assetList: {
        gap: hp(1),
    },


    asset:{
        // alignItems: 'center',
        padding: hp(2.5),
        backgroundColor: theme.colors.background,
        borderRadius: hp(2),
    },

    topAsset:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hp(0.5),
    },

    row: {
        flexDirection: 'row',
        gap: wp(1.5),
        alignItems: 'center',
    },

    assetSymbol: {
        fontWeight: theme.fonts.medium,
        fontSize: hp(2.25),
        color: theme.colors.primary,
    },

    currentAssetPrice: {
        fontSize: hp(1.5),
        color: theme.colors.textLight,
    },
    
    subHeadingAsset: {
        color: theme.colors.textLight,
        fontSize: hp(1.5),
    },

    assetValue: {
        color: theme.colors.primary,
        fontSize: hp(1.5),
    },

    rowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },

    sellButton:{
        backgroundColor: theme.sentimentColor.negative,
        height: hp(4),
        paddingVertical: hp(1),
        paddingHorizontal: wp(3),
        position: 'absolute',

        bottom: hp(2.5),
        right: hp(2.5),
    },

    sellButtonText:{
        color: theme.colors.primary,
        fontSize: hp(1.5),
        fontWeight: theme.fonts.medium,
    },

    // Modal Styles
    modalOverlay:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: theme.colors.background
        //semi transparent background:
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
    },

    modalContent:{
        width: wp(80),
        padding: 20,
        backgroundColor: theme.colors.secondaryBg,
        borderRadius: 10,
        gap: hp(1.25),

        // borderColor: theme.colors.secondary,
        // borderWidth: 1,
    },

    modalTitle:{
        fontSize: hp(2.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.primary,
        // marginBottom: hp(1),
    },

    modalInput:{
        // height: hp(5),
        // borderColor: theme.colors.secondary,
        // borderWidth: 1,
        // marginBottom: 15,
        // paddingLeft: 8,
    },

    modalButtonContainer:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: wp(3),
    },

    modalButton:{
        flex: 1,
        height: hp(5),
        // width: '100%',
    },
    
    modalText:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
    },

    cancelButton:{
        backgroundColor: 'transparent',
        borderColor: theme.colors.secondary,
        borderWidth: 1,
    },
});