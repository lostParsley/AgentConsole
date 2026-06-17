import { WebSocket } from 'ws';

export function injectChaos(ws: WebSocket) {
  const CHAOS_ACTIVE = true; 
  if (!CHAOS_ACTIVE) return;

  // 1. Intercept send to randomly corrupt JSON frames (5% chance)
  const originalSend = ws.send.bind(ws);
  ws.send = function (data: any, cb?: any) {
    if (Math.random() < 0.05) {
      console.log('😈 [Chaos] Injecting a malformed JSON frame...');
      return originalSend('{"type": "text_stream", "content": "broken_data...', cb);
    }
    return originalSend(data, cb);
  };

  const dropTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⚡ [Chaos] Terminating connection forcefully...');
      ws.terminate(); 
    }
  }, Math.random() * 15000 + 12000); 

  ws.on('close', () => clearInterval(dropTimer));
}