-- Email template sent to a publisher when their account is suspended by an admin

INSERT INTO email_templates (slug, name, subject, body_html, is_active)
VALUES (
  'affiliate_suspended',
  'Affiliate Account Suspended',
  'Your Account on {{network_name}} Has Been Suspended',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="margin:0 0 8px;color:#374151">Hi {{first_name}},</p><h2 style="margin:0 0 16px;color:#dc2626">Account Suspended</h2><p style="color:#374151;line-height:1.6">Your publisher account on <strong>{{network_name}}</strong> has been temporarily suspended. During this period you will not be able to log in or access your campaigns.</p><p style="color:#374151;line-height:1.6">If you believe this is an error or would like to appeal this decision, please contact your account manager directly.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"><p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">&copy; {{network_name}}</p></div></div>',
  true
)
ON CONFLICT (slug) DO NOTHING;
