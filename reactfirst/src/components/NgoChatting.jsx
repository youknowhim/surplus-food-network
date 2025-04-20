import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "../css//NGOChatWithSupplier.css";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const NGOChatWithSupplier = ({ ngoId, supplierId, close }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

  const roomId = `${supplierId}_${ngoId}`;

  useEffect(() => {
    socket.emit("joinRoom", roomId);

    socket.on("loadMessages", (messages) => {
      setChat(messages);
    });

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("loadMessages");
      socket.off("receiveMessage");
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim()) return;


    const newMessage = { text: message, sender: ngoId };

    socket.emit("sendMessage", {
      room: roomId,
      message: newMessage,
    });
    setMessage("");
  };

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h3>Chat with Supplier</h3>
        <button className="close-button" onClick={close}>
          &times;
        </button>
      </div>

      <div className="chat-messages">
        {chat.map((msg, index) => (
          <div 
            className="chat-bubble"
            key={index}
          >
            {msg.sender_id}
            
            {msg.text}
            {msg.textt}
           
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
       

      <div className="chat-input-area">
        <input
          class = "chat"
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default NGOChatWithSupplier;

