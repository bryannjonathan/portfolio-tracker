import { Pressable, StyleSheet, Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native'
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
import { FontAwesome5Brands } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

const Login = () => {
    const router = useRouter();
    const { setAuth } = useAuth();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loading, setLoading] = useState(false);

    const onSubmit = async() => {
        console.log(emailRef.current, passwordRef.current);
        // check for emptiness
        if(!emailRef.current || !passwordRef.current){
            Alert.alert(
                "Error",  
                "Please fill all the fields"  
            );
            return;
        };
        
        let email = emailRef.current;
        let password = passwordRef.current;

        try {
            setLoading(true);

            // or use 10.0.2.2
            const response = await fetch("http://10.0.2.2:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                })
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (!response.ok){
                console.log("Login failed:", data.error);
                throw new Error(data.error);  
            }

            console.log("Login successful");
            console.log("User data:", data.user);
            // Store user data in auth context
            setAuth(data.user);
            // Navigate to home screen
            router.replace('/(screens)/home');
            
        } catch (error) {
            console.log("Error caught:", error.message);
            Alert.alert(
                "Error",
                error.message
            );
        } finally {
            setLoading(false);
            console.log("finally");
        }
       
    }
    
    return (
        <ScreenWrapper bg={theme.colors.background} showNav={false}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <BackButton router={router}/>

                    {/* Welcome Message */}
                    <View>
                        <Text style={styles.welcome}>Hey,</Text>
                        <Text style={styles.welcome}>Welcome Back</Text>
                    </View>

                    {/* Form */}
                    <View style={{gap:25}}>
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
                        <Text style={styles.forgotPass}>
                            Forgot Password?
                        </Text>
                        <Button 
                            title="Login"
                            onPress={() => onSubmit()} 
                            loading={loading}
                            buttonStyle={styles.buttonStyle}
                        />
                        
                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={{color: theme.colors.primary}}>
                                Don't have an account?
                            </Text>
                            <Pressable onPress={() => router.push("/(screens)/signup")}> 
                                <Text style={{fontWeight: theme.fonts.extrabold, color: theme.colors.secondary}}>Register Now</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenWrapper>
    )
}

export default Login

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
