/*
 * components/optionsButton.js
 * Three dots and when pressed, appears a drop down menu
 * Takes in options prop in <OptionsButton options={}/>
 * options = [{ title:"Menu title", onPress: ()=>{}]
*/

import React, {useState} from "react";   
import {Menu, Divider, IconButton} from 'react-native-paper';
import { StyleSheet, View, Text } from "react-native";
import { wp, hp } from "../helpers/common";
import { theme } from "../asset/theme";


const OptionsButton = ({options}) => {
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return(
        <View style={styles.container}>
            <Menu
                visible={visible} 
                onDismiss={closeMenu}
                anchor={
                    <IconButton 
                        icon="dots-vertical"
                        size={hp(2.5)}
                        onPress={openMenu}
                        style={styles.button}
                        iconColor={theme.colors.primary}
                    />
                }
            >
                {options && options.map((option, index) => {
                    return(
                        <React.Fragment key={index}>
                            <Menu.Item 
                                onPress={() => {
                                    closeMenu();
                                    option.onPress();
                                }} 
                                title={option.title}
                            />
                            // Add divided except for the last item
                            {index < options.length - 1 && <Divider />} 
                        </React.Fragment>
                    )
                })}
            </Menu>
        </View>
    )

}

export default OptionsButton;

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // width: wp(5),
        // backgroundColor: 'blue',
    },

    button: {
        padding: 0,
        margin: 0,
        // backgroundColor: 'red',
    }
})
