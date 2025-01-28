import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { theme } from '../asset/theme'
import { hp,wp } from '../helpers/common'

const Input = (props) => {
  return (
    <View style={[styles.container, props.containerStyles && props.containerStyles]}>
        { props.icon && props.icon }
        <TextInput 
            style={[styles.input, props.inputStyles && props.inputStyles]}
            placeholderTextColor={theme.colors.textLight}
            ref={props.inputRef && props.inputRef}
            { ...props }
        />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        // height: hp(7),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: theme.colors.inputBg,

        // width: "100%",
    },

    input: {
        flex: 1,
        // height: hp(7),
        paddingHorizontal: wp(3),
        color: theme.colors.textLight,
        fontSize: hp(1.92),
        // backgroundColor: "red",
    }
})
