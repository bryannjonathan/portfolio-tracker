import { Dimensions } from "react-native";

const { width: deviceWidth, height:deviceHeight } = Dimensions.get("window");

export const hp = (percentage) => {
    const value = (percentage * deviceHeight) / 100;
    return value;
};
    
export const wp = (percentage) => {
    const value = (percentage * deviceWidth) / 100;
    return value;
};