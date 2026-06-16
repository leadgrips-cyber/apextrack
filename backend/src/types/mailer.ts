export interface SmtpSettings {
  id: number;
  host: string;
  port: number;
  username: string;
  password: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  secure: boolean;
  is_enabled: boolean;
  updated_at: string;
}

export interface EmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  is_active: boolean;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  recipient: string;
  template_slug: string | null;
  subject: string | null;
  status: 'sent' | 'failed' | 'pending';
  error: string | null;
  sent_at: string;
}

export interface UpdateSmtpPayload {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  secure?: boolean;
  is_enabled?: boolean;
}

export interface UpdateTemplatePayload {
  subject?: string;
  body_html?: string;
  is_active?: boolean;
}

export interface BulkMailPayload {
  recipient_type: 'publisher' | 'advertiser' | 'manager';
  template_slug?: string;
  subject: string;
  body_html: string;
  extra_variables?: Record<string, string>;
  filters?: {
    status?: string;
    country?: string;
  };
}

export type MailVariables = Record<string, string>;
