import { Resend } from 'resend';
import Twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
  const r = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject,
    html,
    text,
  });
  return r;
};

export const sendSMS = async ({ to, body }) => {
  if (!process.env.TWILIO_SID) throw new Error('TWILIO creds missing');
  const msg = await twilioClient.messages.create({
    body,
    from: process.env.TWILIO_FROM,
    to,
  });
  return msg;
};


// backend/utils/notify.js
// import fetch from 'node-fetch';
// import twilio from 'twilio';
// import sgMail from '@sendgrid/mail';

// const TWILIO_SID = process.env.TWILIO_SID;
// const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
// const TWILIO_FROM = process.env.TWILIO_FROM;

// const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
// if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

// // Optional: FCM push support - stub (you can plug firebase-admin later)
// export const sendNotification = async ({ toPhone, toEmail, message, metadata = {} }) => {
//   // Try SMS (Twilio)
//   if (TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM && toPhone) {
//     try {
//       const client = twilio(TWILIO_SID, TWILIO_TOKEN);
//       await client.messages.create({
//         body: `${message.title}\n\n${message.body}`,
//         from: TWILIO_FROM,
//         to: toPhone,
//       });
//       console.log('SMS sent via Twilio to', toPhone);
//       return { channel: 'sms' };
//     } catch (err) {
//       console.warn('Twilio SMS failed:', err.message);
//       // fallthrough to email
//     }
//   }

//   // Try email (SendGrid)
//   if (SENDGRID_KEY && toEmail) {
//     try {
//       const msg = {
//         to: toEmail,
//         from: process.env.NOTIFY_FROM_EMAIL || 'no-reply@medisphere.org',
//         subject: message.title,
//         text: message.body,
//         html: `<p>${message.body}</p><p><small>Event: ${metadata.timelineEventId || ''}</small></p>`,
//       };
//       await sgMail.send(msg);
//       console.log('Email sent via SendGrid to', toEmail);
//       return { channel: 'email' };
//     } catch (err) {
//       console.warn('SendGrid email failed:', err.message);
//     }
//   }

//   // Fallback: console log (dev)
//   console.log('Notification fallback (console):', { toPhone, toEmail, message, metadata });
//   return { channel: 'console' };
// };
