import { StyleSheet, Text, Image, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../asset/theme";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { hp, wp } from "../../helpers/common";

export default function Page() {
    const { user, setAuth } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        setAuth(null)
        router.replace("/welcome")

    };
    
    return(
        <ScreenWrapper bg={theme.colors.background}>
            <View style={styles.container}>
                <Text style={styles.myAccount}>My Account</Text>

                <View style={styles.heading}> 
                    <Image 
                        source={require("../../asset/images/user.jpg")}
                        style={styles.userImage}
                    />

                    <View style={styles.headingUser}>
                        <Text style={styles.username}>{user.username}</Text>
                        <Text style={styles.email}>{user.email}</Text>
                    </View>
                </View>

                <View style={styles.logoutContainer}>
                    <Button 
                        title="Logout"
                        textStyle={styles.logoutText}
                        buttonStyle={styles.logoutButton}
                        onPress={() => {handleLogout()}}
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
        // backgroundColor: "white",
    },

    myAccount:{
        fontSize: hp(4.5),
        color: theme.colors.primary,
        fontWeight: theme.fonts.extrabold,
    },

    heading:{
        // backgroundColor: "red",
        // flex: 1,
        marginVertical: hp(2),
        flexDirection: "row",
    },

    headingUser:{
        // backgroundColor: "blue",
        justifyContent: "center",
        marginHorizontal: wp(3),
        //
    },
    
    userImage:{
        height: hp(10),
        width: hp(10),
        borderRadius: hp(1.5),
    },

    username:{
        fontSize: hp(3),
        color: theme.colors.primary,
        fontWeight: theme.fonts.bold,
    },

    email:{
        fontSize: hp(2),
        color: theme.colors.textLight,
    },

    logoutContainer:{
        // backgroundColor: "red",
        // justifyContent: "center",
        alignItems: "center",
    },

    logoutText:{
        color: theme.sentimentColor.negative,
    },

    logoutButton:{
        backgroundColor: "transparent",
        width: wp(30),
    },

  
});
