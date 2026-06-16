export type AgentMessageType = 'text_stream' | 'tool_call' | 'tool_result' | 'system_status' | 'error';

export interface AgentMessage {
  id?: string;
  type: AgentMessageType;
  content?: string;
  toolName?: string;
  toolStatus?: 'pending' | 'success' | 'failed';
  timestamp?: number;
}