import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { theme } from '../asset/theme'
import { hp, wp } from '../helpers/common'
import Loading from './Loading'


const Button = ({icon, buttonStyle, textStyle, title="", onPress=()=>{}, loading=false}) => {
    

    if(loading){
        return (
            <View style={[styles.button, buttonStyle]}>
                <Loading />
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={[styles.button, buttonStyle,]}>
            <View style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                {title  && (
                    <Text style={[styles.text, textStyle]}>
                        {title}
                    </Text>
                )}
            </View>
        </Pressable>
    )
}

export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.secondary,
        height: hp(6.7),
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        

    },

    text: {
        color: theme.colors.background,
        fontSize: hp(2),
        fontWeight: theme.fonts.bold,
    },

    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: wp(2)
    },

    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    }
})
