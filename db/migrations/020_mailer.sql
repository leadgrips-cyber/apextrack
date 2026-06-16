-- Migration 020: Mailer system — SMTP settings, email templates, email logs

-- SMTP configuration (single row)
CREATE TABLE IF NOT EXISTS smtp_settings (
  id         SERIAL PRIMARY KEY,
  host       VARCHAR(255) NOT NULL DEFAULT '',
  port       INTEGER      NOT NULL DEFAULT 587,
  username   VARCHAR(255) NOT NULL DEFAULT '',
  password   VARCHAR(255) NOT NULL DEFAULT '',
  from_name  VARCHAR(255) NOT NULL DEFAULT '',
  from_email VARCHAR(255) NOT NULL DEFAULT '',
  reply_to   VARCHAR(255) NOT NULL DEFAULT '',
  secure     BOOLEAN      NOT NULL DEFAULT false,
  is_enabled BOOLEAN      NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO smtp_settings DEFAULT VALUES;

-- Email templates (one row per slug)
CREATE TABLE IF NOT EXISTS email_templates (
  id         SERIAL PRIMARY KEY,
  slug       VARCHAR(100) NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  subject    VARCHAR(500) NOT NULL DEFAULT '',
  body_html  TEXT         NOT NULL DEFAULT '',
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Affiliate Signup
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'affiliate_signup',
  'Affiliate Signup',
  'Welcome to {{network_name}} — Application Received',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Application Received</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Thank you for applying to join <strong>{{network_name}}</strong> as an affiliate publisher. Your application has been received and is currently under review by our team.</p><p style="color:#334155;line-height:1.7;margin:0 0 24px">We will notify you within 1 to 2 business days regarding the outcome of your application.</p><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Check Application Status</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}. If you did not apply for an account, you can safely ignore this email.</p></div></div>'
);

-- Affiliate Approved
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'affiliate_approved',
  'Affiliate Approved',
  'Your Affiliate Account Has Been Approved',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Account Approved</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Great news! Your affiliate account on <strong>{{network_name}}</strong> has been approved. You can now log in and start accessing our offer catalog.</p><a href="{{login_url}}" style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Log In Now</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Affiliate Rejected
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'affiliate_rejected',
  'Affiliate Rejected',
  'Update on Your Affiliate Application',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Application Update</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Thank you for your interest in <strong>{{network_name}}</strong>. After reviewing your application, we are unable to approve your account at this time.</p><p style="color:#334155;line-height:1.7;margin:0 0 24px">If you believe this decision was made in error or would like to provide additional information, please contact our support team.</p><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Advertiser Signup
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'advertiser_signup',
  'Advertiser Signup',
  'Welcome to {{network_name}} — Advertiser Application Received',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Advertiser Application Received</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Thank you for applying to advertise on <strong>{{network_name}}</strong>. Your application is under review and our team will be in touch shortly.</p><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Check Application Status</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Advertiser Approved
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'advertiser_approved',
  'Advertiser Approved',
  'Your Advertiser Account Has Been Activated',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Advertiser Account Activated</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Your advertiser account on <strong>{{network_name}}</strong> is now active. You can log in to your dashboard, submit offers, and start running campaigns with our publisher network.</p><a href="{{login_url}}" style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Go to Dashboard</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Advertiser Rejected
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'advertiser_rejected',
  'Advertiser Rejected',
  'Update on Your Advertiser Application',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Advertiser Application Update</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Thank you for your interest in advertising on <strong>{{network_name}}</strong>. After careful review, we are unable to approve your advertiser account at this time.</p><p style="color:#334155;line-height:1.7;margin:0 0 24px">Please contact our support team if you have questions or would like to reapply in the future.</p><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Email Verification
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'email_verification',
  'Email Verification',
  'Verify Your Email Address — {{network_name}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Verify Your Email Address</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Please verify your email address by clicking the button below. This link will expire in 24 hours.</p><a href="{{verification_link}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Verify Email Address</a><p style="color:#334155;line-height:1.7;margin-top:20px;font-size:13px">If the button does not work, copy and paste this link into your browser:<br><span style="color:#0891b2;word-break:break-all">{{verification_link}}</span></p><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">If you did not create an account, please ignore this email.</p></div></div>'
);

-- Password Reset
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'password_reset',
  'Password Reset',
  'Reset Your Password — {{network_name}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Password Reset Request</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">We received a request to reset the password for your <strong>{{network_name}}</strong> account. Click the button below to choose a new password. This link will expire in 1 hour.</p><a href="{{reset_link}}" style="display:inline-block;background:#f59e0b;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Reset Password</a><p style="color:#334155;line-height:1.7;margin-top:20px;font-size:13px">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Offer Approved
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'offer_approved',
  'Offer Approved',
  'Your Offer Has Been Approved — {{offer_name}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Offer Approved</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Your offer <strong>{{offer_name}}</strong> has been reviewed and approved. It is now live and available to our publisher network.</p><a href="{{login_url}}" style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View Offer Dashboard</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Offer Rejected
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'offer_rejected',
  'Offer Rejected',
  'Your Offer Was Not Approved — {{offer_name}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Offer Not Approved</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">After review, your offer <strong>{{offer_name}}</strong> was not approved at this time. Please log in to your account to review any feedback and make the necessary changes before resubmitting.</p><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Go to Dashboard</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Invoice Generated
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'invoice_generated',
  'Invoice Generated',
  'Invoice #{{invoice_number}} Generated — {{amount}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Invoice Generated</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Invoice <strong>#{{invoice_number}}</strong> for the amount of <strong>{{amount}}</strong> has been generated on your <strong>{{network_name}}</strong> account. You can review and download it from your dashboard.</p><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View Invoice</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Withdrawal Approved
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'withdrawal_approved',
  'Withdrawal Approved',
  'Your Withdrawal Has Been Approved — {{amount}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Withdrawal Approved</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Your withdrawal request for <strong>{{amount}}</strong> has been approved and is being processed. Funds will be transferred to your payment method on record.</p><a href="{{login_url}}" style="display:inline-block;background:#10b981;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View Wallet</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}.</p></div></div>'
);

-- Withdrawal Rejected
INSERT INTO email_templates (slug, name, subject, body_html) VALUES (
  'withdrawal_rejected',
  'Withdrawal Rejected',
  'Your Withdrawal Request Was Not Approved',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="color:#0891b2;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px">{{network_name}}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px"><h2 style="color:#0f172a;font-size:20px;margin:0 0 16px">Withdrawal Not Approved</h2><p style="color:#334155;line-height:1.7;margin:0 0 12px">Hi {{first_name}},</p><p style="color:#334155;line-height:1.7;margin:0 0 16px">Your withdrawal request for <strong>{{amount}}</strong> was not approved at this time. This may be due to insufficient balance, pending review, or account status. Please log in to review your account details.</p><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View Account</a><p style="color:#94a3b8;font-size:12px;margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0">This email was sent by {{network_name}}. Please contact support if you have questions.</p></div></div>'
);

-- Email delivery log
CREATE TABLE IF NOT EXISTS email_logs (
  id            SERIAL PRIMARY KEY,
  recipient     VARCHAR(255) NOT NULL,
  template_slug VARCHAR(100),
  subject       VARCHAR(500),
  status        VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error         TEXT,
  sent_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status   ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at  ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
