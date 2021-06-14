import React from "react";
import { ActivityIndicator, View } from "react-native";
import Colors from "../config/Colors";

const Loading = () => {
  return (
    <View>
      <ActivityIndicator size="large" color={Colors.Primary}></ActivityIndicator>
    </View>
  );
};

export default Loading;
