import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // replace with your backend URL

const SupplierChatWithNGO = ({ ngoId, supplierId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("joinRoom", `${supplierId}_${ngoId}`);

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [ngoId, supplierId]);

  const sendMessage = () => {
    const data = { text: message, sender: supplierId };
    socket.emit("sendMessage", {
      room: `${supplierId}_${ngoId}`,
      message: data,
    });
    setChat((prev) => [...prev, data]);
    setMessage("");
  };
}