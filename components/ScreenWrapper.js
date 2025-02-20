// / SCREEN WRAPPER SO THE SCREEN DOES NOT COLLIDE WITH THE TOP AREA
import { Text, View, ScrollView, StyleSheet} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { wp, hp } from "../helpers/common";
import BottomNav from "./BottomNav";

const ScreenWrapper = ({ children, bg, showNav = true }) => {
    const insets = useSafeAreaInsets();
    const paddingTop = insets.top > 0 ? insets.top + 5: 30;
    
    return (
        <View
            style={{
                flex: 1,
                minHeight: hp(90), // Added to handle navbar pushed up when keyboard is opened
                backgroundColor: bg,
                paddingTop: paddingTop,
                // paddingBottom: showNav ? 0 : insets.bottom,
            }}
        >
            {children}
            {showNav && (
                <View style={styles.bottomNavContainer}>
                    <BottomNav />
                </View>
            )}
        </View>       
    );
};

const styles = StyleSheet.create({
    bottomNavContainer:{
        // position: 'absolute',
        // bottom: 0,
        // left: 0,
        // right: 0,
        // zIndex: 10,
    },
})

export default ScreenWrapper;
