import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "../css/SupplierChatWithNGO.css";

// Initialize socket once
const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const SupplierChatWithNGO = ({ ngoId,Supplier_id, close }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const messagesEndRef = useRef(null);

  const roomId = `${Supplier_id}_${ngoId}`;

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

    const newMessage = { text: message, sender: Supplier_id};

    socket.emit("sendMessage", {
      room: roomId,
      message: newMessage,
    });
    setMessage("");
  };

  return (
    <div className="chat-popup">
      <div className="chat-header">
        <h3>Chat with NGO</h3>
        <button className="close-button" onClick={close}>
          &times;
        </button>
      </div>

      <div className="chat-messages">
        
        {chat.map((msg, index) => (
        
          <div
            key={index}
            className={`chat-bubble ${
              msg.sender === Supplier_id? "outgoing" : "incoming"
            }`}
          >

            {msg.sender_id}--
            {msg.text}
            {msg.textt}
            -({msg.timestamp})
            
            
          </div>
          
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <input
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

export default SupplierChatWithNGO;


