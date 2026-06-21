export interface SpamTemplate {
  id: number;
  text: string;
  start_hour: number | null;
  end_hour: number | null;
  is_global: boolean;
  rule_id: number | null;
}

export interface SpamRule {
  id: number;
  chat_id: string;
  client_name: string | null;
  reply_sign: string | null;
  frequency_type: string;
  interval_days: number | null;
  send_hours: string;
  spam_endlessly: boolean;
  is_active: boolean;
  last_sent_at: string | null;
  templates: SpamTemplate[];
}

export interface SpamSentMessage {
  id: number;
  rule_id: number;
  text: string;
  sent_at: string;
  chat_id: string;
  add_time: number | null;
}

export interface SpamStats {
  total_rules: number;
  active_rules: number;
  total_sent: number;
  sent_last_24h: number;
}
