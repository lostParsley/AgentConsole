import { WebSocket } from 'ws';

let globalSeq = 1;

export function processPrompt(ws: WebSocket, prompt: string) {
  console.log(`📥 Received prompt: ${prompt}`);
  const streamId = `s_${Date.now()}`;

  // 1. Fire the Context Snapshot (Triggers your Task 3 JSON Inspector)
  ws.send(JSON.stringify({
    type: "CONTEXT_SNAPSHOT",
    seq: globalSeq++,
    context_id: "ctx_network_logs",
    data: {
      report_id: "REP-2025-X",
      status: "critical",
      flags: ["unauthorized_access", "data_exfiltration"],
      nested_data: {
         server: "prod-db-01",
         active_connections: 45
      }
    }
  }));

  // 2. Stream the first part of the text (Triggers Task 1 & 2)
  const intro = "Analyzing network logs based on current context... ";
  let i = 0;
  
  const streamIntro = setInterval(() => {
    if (i < intro.length) {
      ws.send(JSON.stringify({ type: "TOKEN", seq: globalSeq++, stream_id: streamId, text: intro.charAt(i) }));
      i++;
    } else {
      clearInterval(streamIntro);
      
      // 3. Interrupt with a TOOL CALL mid-sentence
      const callId = `tc_${Date.now()}`;
      ws.send(JSON.stringify({
        type: "TOOL_CALL",
        seq: globalSeq++,
        call_id: callId,
        tool_name: "query_vector_db",
        args: { query: prompt },
        stream_id: streamId
      }));

      // 4. Send the TOOL RESULT 2.5 seconds later
      setTimeout(() => {
        ws.send(JSON.stringify({
          type: "TOOL_RESULT",
          seq: globalSeq++,
          call_id: callId,
          result: { threats_found: 3, action: "quarantine" },
          stream_id: streamId
        }));

        // 5. Resume Streaming instantly
        const outro = "Found 3 relevant contextual anomalies. Quarantine protocols initiated. System secure.";
        let j = 0;
        const streamOutro = setInterval(() => {
          if (j < outro.length) {
            ws.send(JSON.stringify({ type: "TOKEN", seq: globalSeq++, stream_id: streamId, text: outro.charAt(j) }));
            j++;
          } else {
            clearInterval(streamOutro);
            ws.send(JSON.stringify({ type: "STREAM_END", seq: globalSeq++, stream_id: streamId }));
          }
        }, 30);

      }, 2500);
    }
  }, 30); // 30ms delay between characters to simulate real AI typing
}