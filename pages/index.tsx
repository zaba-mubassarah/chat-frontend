import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface Message {
  id: number;
  content: string;
  sender: string;
  createdAt: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sender, setSender] = useState('Shanitaa');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    axios.get<Message[]>('http://localhost:3000/api/messages').then((res) => {
      setMessages(res.data);
    });

    socketRef.current = new WebSocket('ws://localhost:3000');
    socketRef.current.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      setMessages((prev) => [...prev, newMsg]);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = async () => {
    const newMessage = { content: input, sender };
    await axios.post('http://localhost:3000/api/messages', newMessage);
    socketRef.current?.send(JSON.stringify(newMessage));
    setInput('');
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Chat App</h1>
      <div style={{ maxHeight: 300, overflowY: 'scroll', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id}><strong>{msg.sender}:</strong> {msg.content}</div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
