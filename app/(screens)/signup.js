import { Pressable, StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'
import React from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../asset/theme'
import { Feather } from '@expo/vector-icons'
import BackButton from '../../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../../helpers/common'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useState, useRef } from 'react'
import { API_URL } from '../config'


const Signup = () => {
    const router = useRouter();
    const usernameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        console.log(usernameRef.current, emailRef.current, passwordRef.current);
        // check for emptiness
        if(!usernameRef.current || !emailRef.current || !passwordRef.current){
            Alert.alert(
                "Error",  
                "Please fill all the fields"  
            );
            return;
        };

        // Check for spaces
        // Check for spaces
        if (usernameRef.current.includes(' ')) {
            Alert.alert(
                "Error",  
                "Username cannot contain spaces"
            );
            return;
        }
        if (emailRef.current.includes(' ')) {
            Alert.alert(
                "Error",  
                "Email cannot contain spaces"
            );
            return;
        }
        if (passwordRef.current.includes(' ')) {
            Alert.alert(
                "Error",  
                "Password cannot contain spaces"
            );
            return;
        }
        
        let username = usernameRef.current;
        let email = emailRef.current;
        let password = passwordRef.current;

        // validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(
                "Error",  
                "Please enter a valid email address"
            );
            return;
        }

        // validate password length
        if (password.length < 6){
            Alert.alert(
                "Error",  
                "Password must be at least 6 characters long"
            );
            return;
        }

        try {
            setLoading(true);

            // const response = await fetch(endpoints.register, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify({
            //         username,
            //         email,
            //         password,
            //     })
            // });
            const response = await fetch("${API_URL}/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                })
            });

            const data = await response.json();
            console.log(`LOG: Response: ${JSON.stringify(response)}`)
            console.log(`LOG: Data: ${JSON.stringify(data)}`)

            if (!response.ok){
                throw new Error(data.error);
            }

            Alert.alert(
                "Success",
                "Account created successfully",
                [
                    { text: "OK", onPress: () => router.push("/(screens)/login") }
                ]
            );
            
        } catch (error) {
            Alert.alert(
                "Error",
                error.message,
            )
        } finally {
            setLoading(false);
        }
    }

    
  return (
    <ScreenWrapper bg={theme.colors.background} showNav={false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <BackButton router={router}/>

                {/* Welcome Message */}
                <View>
                    <Text style={styles.welcome}>Let's</Text>
                    <Text style={styles.welcome}>Get Started</Text>
                </View>

                {/* Form */}
                <View style={{gap:25}}>
                    <Input
                        icon={<Feather name="user" size={24} color={theme.colors.textLight} />} 
                        placeholder="Enter your username"                
                        onChangeText={value => usernameRef.current = value}
                        height={hp(7)}
                    />

                    <Input 
                        icon={<Feather name="mail" size={24} color={theme.colors.textLight} />}
                        placeholder="Enter your email"
                        onChangeText={value => emailRef.current = value}
                        height={hp(7)}
                    />
                    <Input
                        icon={<Feather name="lock" size={24} color={theme.colors.textLight} />} 
                        placeholder="Enter your password" 
                        secureTextEntry={true} 
                        onChangeText={value => passwordRef.current = value}
                        height={hp(7)}
                    />
                    <Button 
                        title="Register"
                        onPress={() => onSubmit()} 
                        loading={loading}
                        buttonStyle={styles.buttonStyle}
                    />
                    
                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={{color: theme.colors.primary}}>
                            Already have an account? 
                        </Text>
                        <Pressable onPress={() => router.push("/(screens)/login")}> 
                            <Text style={{fontWeight: theme.fonts.extrabold, color: theme.colors.secondary}}>Login Now</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </ScreenWrapper>
  )
}

export default Signup

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    }, 
    
    welcome: {
        fontSize: hp(4.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.primary,
    },
    
    formText: {
        fontSize: hp(2),
        color: theme.colors.primary,
    },
    
    forgotPass: {
        alignSelf: "flex-end",
        fontSize: hp(2),
        color: theme.colors.primary,
    }, 
    
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        // marginTop: hp(1),
    },

    buttonStyle:{
        height: hp(6.7),
    },
})
