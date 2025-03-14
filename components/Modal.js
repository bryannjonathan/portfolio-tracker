import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from './Button';
import { hp,wp } from '../helpers/common';
import { theme } from '../asset/theme';


const Modal = ({ isVisible, onClose, title, content, onConfirm, onCancel }) => {

    return (
        <Modal
            visible={isVisible} 
            onRequestClose={onCancel}
            transparent={true}
            animation={fade}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.container}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <View style={styles.modalContent}>{content}</View>
                    <View style={styles.buttonContainer}>
                        <Button title="Confirm" textStyle={styles.modalText} buttonStyle={[styles.modalButton, styles.cancelButton]} onPress={onConfirm} />
                        <Button title="Cancel" textStyle={styles.modalText} buttonStyle={styles.modalButton} onPress={onCancel} />
                    </View>
                </View>
            </View>
        </Modal>
    )
};

export default Modal;

const styles = StyleSheet.create({
    modalOverlay:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
    },
    
    container:{
        width: wp(80),
        padding: 20,
        backgroundColor: theme.colors.secondaryBg,
        borderRadius: 10,
        gap: hp(1.25),
    },

    modalContent:{},

    modalTitle:{
        fontSize: hp(2.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.primary,
    },

    buttonContainer:{
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        gap: wp(3),
    },

    modalText:{
        color: theme.colors.primary,
        fontWeight: theme.fonts.medium,
    },

    modalButton:{
        flex: 1,
        height: hp(5),
    },

    cancelButton:{
        backgroundColor: 'transparent',
        borderColor: theme.colors.secondary,
        borderWidth: 1,
    },
})