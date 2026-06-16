-- Add email templates for offer application approval and rejection notifications
-- These are sent to publishers when their offer application is reviewed by an admin

INSERT INTO email_templates (slug, name, subject, body_html, is_active)
VALUES
(
  'application_approved',
  'Offer Application Approved',
  'Your Application for {{offer_name}} Has Been Approved',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="margin:0 0 8px;color:#374151">Hi {{first_name}},</p><h2 style="margin:0 0 16px;color:#0891b2">Application Approved!</h2><p style="color:#374151;line-height:1.6">Congratulations! Your application to promote <strong>{{offer_name}}</strong> on <strong>{{network_name}}</strong> has been approved. You can now access your tracking links and start promoting this offer.</p><div style="margin:24px 0;text-align:center"><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">Go to My Dashboard</a></div><p style="color:#6b7280;font-size:14px;line-height:1.6">Log in to access your tracking links and campaign materials. If you have any questions, reach out to your account manager.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"><p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">&copy; {{network_name}}</p></div></div>',
  true
),
(
  'application_rejected',
  'Offer Application Update',
  'Update on Your Application for {{offer_name}}',
  '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;background:#f8fafc"><div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0"><p style="margin:0 0 8px;color:#374151">Hi {{first_name}},</p><h2 style="margin:0 0 16px;color:#374151">Application Update</h2><p style="color:#374151;line-height:1.6">Thank you for your interest in promoting <strong>{{offer_name}}</strong> on <strong>{{network_name}}</strong>. After reviewing your application, we are unable to approve it at this time.</p><p style="color:#374151;line-height:1.6">If you have questions about this decision or would like to apply for other offers, please log in to your publisher portal or contact your account manager.</p><div style="margin:24px 0;text-align:center"><a href="{{login_url}}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px">View Available Offers</a></div><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"><p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">&copy; {{network_name}}</p></div></div>',
  true
)
ON CONFLICT (slug) DO NOTHING;
