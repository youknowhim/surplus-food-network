import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const NGOChatWithSupplier = ({ supplierId, ngoId }) => {
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
  }, [supplierId, ngoId]);

  const sendMessage = () => {
    const data = { text: message, sender: ngoId };
    socket.emit("sendMessage", {
      room: `${supplierId}_${ngoId}`,
      message: data,
    });
    setChat((prev) => [...prev, data]);
    setMessage("");
  };
  return (
    <div>
      <h3>Chat with NGO</h3>
      <div>
        {chat.map((msg, idx) => (
          <p key={idx} style={{ textAlign: msg.sender === supplierId ? "right" : "left" }}>
            {msg.text}
          </p>
        ))}
      </div>
      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default SupplierChatWithNGO;
