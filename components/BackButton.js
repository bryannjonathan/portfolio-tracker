import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { theme } from '../asset/theme'
import { hp, wp } from '../helpers/common'

const BackButton = ({size=26, router}) => {
    // const router = useRouter();
    
    return (
        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
        >
            <FontAwesome5 
                name="chevron-left" 
                size={hp(3)} 
                color={theme.colors.primary}
            />
        </TouchableOpacity>
    )
}

export default BackButton

const styles = StyleSheet.create({ 
    backButton: {
        alignSelf: "flex-start",
        padding: 5,
    }
})
