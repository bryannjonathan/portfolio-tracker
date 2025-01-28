import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { wp, hp } from '../../helpers/common'
import { theme } from '../../asset/theme'
import Button from '../../components/Button'
import { useRouter } from 'expo-router'
import Logo from '../../asset/Icons/logo'


// console.log("theme", theme)

const Welcome = () => {
    const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.background} showNav={false}>
        <View style={styles.container}>
            {/* Welcome Image */}
            <View style={styles.header}>
                {/* Welcome Image */}
                <Logo width={wp(50)} height={hp(30)} />

                {/* Title */}
                <View>
                    <Text style={styles.title}>Investory</Text>
                    <Text style={styles.subtitle}>Grow Your Own Story</Text>
                </View>
            </View>
            
            
            {/* Footer Area */}
            {/* Butto to go to login page */}
            <View style={styles.footer}>
                <Button 
                    title="Get Started"
                    buttonStyle={styles.buttonStyle}
                    onPress={() => router.push("/(screens)/signup")}
                />

                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text> 
                    <Pressable onPress={() => router.push("/(screens)/login")}>
                        <Text style={{color: theme.colors.secondary, fontWeight: theme.fonts.extrabold}}>Login</Text>
                    </Pressable>
                </View>
            </View>

        </View>
    </ScreenWrapper>
  )
}

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        marginHorizontal: wp(5), // percentages
        paddingVertical: hp(8),

    },

    header: {
        flex: 1,
        marginTop: hp(10),
        alignItems: 'center',
        // backgroundColor: "red", 
    },
    
    welcomeImage: {
        width: wp(100),
        height: hp(35),
    },

    title:{
        color:theme.colors.primary,
        fontSize: hp(5.5),
        textAlign: 'center',
        fontWeight: theme.fonts.extrabold,
    },

    subtitle:{
        color:theme.colors.primary,
        fontSize: hp(2.5),
        textAlign: 'center',
        fontWeight: theme.fonts.medium,
    },

    footer:{
        gap: 20,
        width: '100%'
    },
    
    loginContainer:{
        // flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    loginText:{
        color: theme.colors.primary,
        fontSize: hp(2),

    },
    buttonStyle:{
        height: hp(6.7),
    },

})
