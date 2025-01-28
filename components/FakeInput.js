import { StyleSheet, Text, Pressable, View, TextInput } from 'react-native'
import React from 'react'
import { theme } from '../asset/theme'
import { hp, wp } from '../helpers/common'


const FakeInput = (props) => {
  return (
    <Pressable style={[styles.container, props.containerStyles && props.containerStyles]} onPress={props.onPress}>
        { props.icon && props.icon }
        <Text 
            style={[styles.input, props.inputStyles && props.inputStyles]}
            color={theme.colors.textLight}
            // ref={props.inputRef && props.inputRef}
            { ...props }
        >{props.text && props.text}</Text>
    </Pressable>
  )
}

export default FakeInput

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        // height: hp(7),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 18,
        borderRadius: 12,
        backgroundColor: theme.colors.inputBg,
    },

    input: {
        flex: 1,
        // height: hp(7),
        paddingHorizontal: wp(3),
        color: theme.colors.textLight,
        fontSize: hp(1.92),
        textAlignVertical: "center",
        includeFontPadding: false,
        // backgroundColor: "red",
    }
})

