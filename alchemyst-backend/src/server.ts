import { WebSocketServer, WebSocket } from 'ws';
import { processPrompt } from './agent';
import { injectChaos } from './chaos';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('✅ Client connected.');
  
  injectChaos(ws);

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      
      if (parsed.type === 'USER_MESSAGE' || parsed.action === 'prompt') {
        const text = parsed.text || parsed.payload || '';
        // Call processPrompt without the .catch() chain
        processPrompt(ws, text);
      }
      
      if (parsed.type === 'TOOL_ACK') {
        console.log(`✅ Frontend acknowledged tool call: ${parsed.call_id}`);
      }
      
      if (parsed.type === 'RESUME') {
        console.log(`🔄 Frontend reconnected. Resuming from seq: ${parsed.last_seq}`);
      }

    } catch (err) {
      console.error('Invalid message format received from client', err);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected.');
  });
});

console.log('🚀 Mock Agent Server running on ws://localhost:8080');
console.log('😈 Chaos Mode initialized.');