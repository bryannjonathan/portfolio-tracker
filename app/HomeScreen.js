import { StyleSheet, Text, View, Button } from "react-native";
import { useState } from "react";
import { TextInput } from "react-native";
import { hp } from "../helpers/common";

export default function Page() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayText, setDisplayText] = useState("");

  const handlePress = () => {
    setDisplayText(`${username} and ${password}`);
  }
  

  return (
    <View style={styles.container}>
        <Text style={styles.main}>Hello</Text>
        <Text>Username</Text>
        <TextInput 
            style={styles.inputBox}
            onChangeText={setUsername}
            value={username}
        />      
        <Text>Password</Text>
        <TextInput 
            style={styles.inputBox}
            onChangeText={setPassword} 
            value={password}
        />

        <Button
            title="Login"
            onPress={handlePress} 
            buttonStyle={styles.buttonStyle}
        />

        <Text>Inputted username and password</Text>
        <Text>{displayText}</Text>
    </View>  
    
  );
}

const styles = StyleSheet.create({
  inputBox:{
    // flex: 1,
    height: 40,
    width: 100,
    margin: 12,
    borderWidth: 2,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fffff"
  },
  main: {
    // flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  }, subtitle: {
    fontSize: 12,
    color: "#fffff",
  },
  tests:{
    fontSize: 23,
    color: "red",

  },
    buttonStyle:{
        height: hp(6.7),
    }
});
