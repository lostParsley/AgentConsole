import { WebSocket } from 'ws';

export function injectChaos(ws: WebSocket) {
  // TOGGLE THIS TO false TO SHOW A PERFECT, ERROR-FREE RUN TO YOUR EVALUATOR
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

  // 2. Intelligent Connection Drops
  // Gives the agent 12-25 seconds to talk before dropping, ensuring streams can finish
  const dropTimer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log('⚡ [Chaos] Terminating connection forcefully...');
      ws.terminate(); 
    }
  }, Math.random() * 15000 + 12000); 

  ws.on('close', () => clearInterval(dropTimer));
}