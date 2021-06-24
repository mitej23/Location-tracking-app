import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TextInput, View, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";

import io from "socket.io-client";
//Don't usee localhost while testing on phone
var socket = io("http://localhost:3000/", {
  transports: ["websocket"],
  jsonp: false,
});

const OrdersList = ({ orders, name }) => {
  const takeOrder = (id, name) => {
    console.log("order taken in comp");
    socket.emit("order-taken", id, name);
  };
  console.log(orders);
  return (
    <View style={{ width: 200, backgroundColor: "#e9d5ff", padding: 10 }}>
      {orders.map((ord) => {
        return (
          <View style={{ marginBottom: 10, backgroundColor: "#c93de2" }}>
            <Text>
              {ord.name} {ord.orderId}
            </Text>
            {ord.taken ? (
              <Button title="Taken" />
            ) : (
              <Button
                title="Available"
                onPress={() => takeOrder(ord.orderId, ord.name)}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function App() {
  let [name, setName] = useState("");
  let [userType, setUserType] = useState("");
  let [id, setId] = useState("");
  let [isSubmitted, setSubmitted] = useState(false);
  let [orderId, setOrderId] = useState(1234);
  let [orders, setOrders] = useState([]);
  const ordersRef = useRef(orders);

  useEffect(() => {
    ordersRef.current = orders;
  });

  useEffect(() => {
    setOrderId(Math.floor(1000 + Math.random() * 9000));

    socket.on("connect", () => {
      setId(socket.id);
    });

    socket.on("order", (data) => {
      console.log("order placed ", data.name, data.orderId);
      orderhandler(ordersRef.current, setOrders, data);
    });

    socket.on("orders-changed", (id, name) => {
      console.log("order taken : " + id + name);
      let insert = { name: name, orderId: id, taken: true };
      console.log(insert);
      console.log(ordersRef.current);
      takenHandler(ordersRef.current, setOrders, insert, id);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    console.log(orders);
  }, [orders]);

  const orderhandler = (orders, setOrders, { name, orderId, userId }) => {
    console.log(orders);
    setOrders((orders) => [...orders, { name, orderId, taken: false }]);
  };

  const takenHandler = (orders, setOrders, insert, id) => {
    setOrders(
      orders.map((item) => {
        return item.orderId === id ? insert : item;
      })
    );
  };

  const submit = (e) => {
    e.preventDefault();
    if (name == "" || userType == "") {
      alert("fields are empty!! Fill them");
      return;
    }
    setSubmitted(true);
  };
  const becomeDriver = () => {
    console.log(socket);
    socket.emit("join-driver", name);
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
          {userType == "user" ? (
            <>
              <Text>Order ID: {orderId}</Text>
              <Button title="Press me" onPress={placeOrder} />
            </>
          ) : (
            <>
              <Button title="Join us" onPress={becomeDriver} />
              <Text>Orders:</Text>
              <OrdersList orders={orders} />
            </>
          )}
        </>
      ) : (
        <>
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
            <Picker.Item label="driver" value="driver" />
          </Picker>
          <Text>{userType}</Text>
          <Button title="Press me" onPress={submit} />
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
