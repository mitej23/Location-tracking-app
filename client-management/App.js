import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import io from "socket.io-client";
//Don't usee localhost while testing on phone
var socket = io("http://localhost:3000/", {
  transports: ["websocket"],
  jsonp: false,
});

export default function App() {
  let [name, setName] = useState("");
  let [userType, setUserType] = useState("");
  let [id, setId] = useState("");
  let [isSubmitted, setSubmitted] = useState(false);
  let [orderId, setOrderId] = useState(1234);
  

  useEffect(() => {
    setOrderId(Math.floor(1000 + Math.random() * 9000));

    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("order", (data) => {
      console.log("order placed ", data.name, data.orderId);
      orderhandler(ordersRef.current, setOrders, data);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);


  const orderhandler = (orders, setOrders, { name, orderId, userId }) => {
    console.log(orders);
    setOrders((orders) => [...orders, { name, orderId, taken: false, userId }]);
  };

  

  const submit = (e) => {
    e.preventDefault();
    if (name == "") {
      alert("fields are empty!! Fill them");
      return;
    }
    setUserType("user");
    setSubmitted(true);
  };

  const placeOrder = () => {
    //broadcast the message in group room
    console.log("order placed", name, orderId);
    socket.emit("order-placed", name, orderId, id);
    setOrderId(Math.floor(1000 + Math.random() * 9000));
  };


  return (
    <View style={styles.container}>
      {isSubmitted ? (
        <>
          <Text>Name: {name}</Text>
          <Text>User Type: {userType}</Text>
          <Text>Socket Id:{id}</Text>

          <>
            <Text>Order ID: {orderId}</Text>
            <Button title="Press me" onPress={placeOrder} />
          </>
        </>
      ) : (
        <>
          <Text>Form:</Text>
          <Text>Name:</Text>
          <TextInput onChangeText={setName} value={name} />

          <Button style={{ marginTop: 20 }} title="Press e" onPress={submit} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    marginTop: 55,
    marginLeft: 10,
  },
});
