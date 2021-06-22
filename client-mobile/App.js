import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import io from "socket.io-client";

export default function App() {
  let [name, setName] = useState("");
  let [userType, setUserType] = useState("");
  let [id, setId] = useState("");
  useEffect(() => {
    const socket = io("http://192.168.43.43:3000/", {
      transports: ["websocket"],
      jsonp: false,
    });
    console.log(socket)
    socket.on("connect", () => {
      setId(socket.id);
    });
  },[]);

  useEffect(() => {
    console.log(name);
  }, [name]);

  return (
    <View style={styles.container}>
      <Text>Form:</Text>
      <Text>Name:</Text>
      <TextInput onChangeText={setName} value={name} />
      <Text>User Type:</Text>

      <Picker
        style={{ height: 20, width: 100 }}
        selectedValue={userType}
        onValueChange={(type) => setUserType(type)}
      >
        <Picker.Item label="owner" value="owner" />
        <Picker.Item label="user" value="user" />
        <Picker.Item label="delivery-man" value="del" />
      </Picker>
      <Text>{userType}</Text>
      <Text>WS ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    marginTop: 55,
    marginLeft: 10,
  },
});
