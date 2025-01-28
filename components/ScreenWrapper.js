// SCREEN WRAPPER SO THE SCREEN DOES NOT COLLIDE WITH THE TOP AREA
import { Text, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { wp } from "../helpers/common";
import BottomNav from "./BottomNav";

const ScreenWrapper = ({ children, bg, showNav = true }) => {
    const insets = useSafeAreaInsets();
    const paddingTop = insets.top > 0 ? insets.top + 5: 30;
    
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: bg,
                paddingTop: paddingTop,
                paddingBottom: showNav ? 0 : insets.bottom,
            }}
        >
            {children}
            {showNav && <BottomNav />}
        </View>
    );
};

export default ScreenWrapper;