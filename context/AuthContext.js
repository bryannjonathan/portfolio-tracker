import { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false); 
    const [error, setError] = useState(null);

    const setAuth = authUser => {
        setUser(authUser);
        console.log("authUser", authUser);
    }

    const setUserData = (userData) => {
        setUser({...userData});
    }

    return (
        <AuthContext.Provider value={{ user, setAuth, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
