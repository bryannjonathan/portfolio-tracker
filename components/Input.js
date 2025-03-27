import { StyleSheet, Text, View, TextInput, Platform } from 'react-native'
import React from 'react'
import { theme } from '../asset/theme'
import { hp,wp } from '../helpers/common'

const Input = (props) => {
    const {
        icon,
        inputStyles,
        containerStyles,
        inputRef,
        inputType = "default",
        onChangeText,
        value,
        ...rest
    } = props;

    let keyboardType;
    if (inputType === "number"){
        keyboardType = Platform.OS === "ios" ? "decimal-pad" : "numeric";
    }

    // console.log(`keyboardType = ${keyboardType}`)
    
    const handleTextChange = (text) => {
        if (keyboardType === "number"){
            let cleaned = text.replace(/[^0-9.]/g, '');
            const dotCount = (cleaned.match(/\./g) || []).length;

            if (dotCount > 1){
                cleaned = cleaned.slice(0, cleaned.lastIndexOf('.'));
            }

            if (onChangeText){
                onChangeText(cleaned)
            }
        } else {
            if (onChangeText){
                onChangeText(text)
            }
        }
    }


  return (
    <View style={[styles.container, containerStyles]}>
        { icon }
        <TextInput 
            style={[styles.input, inputStyles]}
            placeholderTextColor={theme.colors.textLight}
            ref={inputRef}
            keyboardType={keyboardType}  
            value={value}
            onChangeText={handleTextChange}
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
