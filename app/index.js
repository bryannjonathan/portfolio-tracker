import React from "react";
// import { AuthContext } from "../context/AuthContext";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";
// import { QueryClient, QueryClientProvider, ReactQueryDevTools } from "@tanstack/react-query"

// const queryClient = new QueryClient();

function App(){
  // const [user, setUser] = useState(null);
  const router = useRouter();


  return(
    // <AuthContext.Provider value={{ user, setUser }}>
    //   <HomeScreen />
    // </AuthContext.Provider>
    <ScreenWrapper>
      <Text>Index.js</Text>
      <Button
        title="Welcome"
        onPress={() => router.push("/(screens)/welcome")}  
      />
    </ScreenWrapper>
    
  )

}

export default App

