import twilio from "twilio";
import { Resend } from "resend";

import { generateInvoicePDFBuffer } from "./pdf";

export async function sendBookingConfirmationNotifications(
  clientEmail: string,
  clientName: string,
  clientPhone: string,
  serviceTitle: string,
  providerName: string,
  price: number,
  date: Date,
  appointmentId: string
) {
  const message = `ServiceHub: Your appointment for ${serviceTitle} with ${providerName} is confirmed for ${date.toLocaleString()}.`;

  console.log("\n=========================================");
  console.log("NOTIFICATIONS DISPATCH");
  console.log("-----------------------------------------");

  // Twilio Integration
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: clientPhone
      });
      console.log(`[SMS - Twilio] Sent successfully to: ${clientPhone}`);
    } catch (error) {
      console.error(`[SMS - Twilio] Error sending to ${clientPhone}:`, error);
    }
  } else {
    console.log(`[SMS - Twilio MOCK] To: ${clientPhone}`);
    console.log(`[SMS - Twilio MOCK] Body: ${message}`);
  }

  console.log("-----------------------------------------");

  // Resend Integration
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const invoiceBuffer = generateInvoicePDFBuffer(
         appointmentId,
         clientName,
         clientEmail,
         providerName,
         serviceTitle,
         price,
         date
      );

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: clientEmail,
        subject: `Booking Confirmed - ${serviceTitle}`,
        text: message,
        html: `<p><strong>ServiceHub</strong></p><p>Your appointment for <strong>${serviceTitle}</strong> with <strong>${providerName}</strong> is confirmed for ${date.toLocaleString()}.</p>`,
        attachments: [
           {
              filename: `Invoice-SH-${appointmentId.slice(-8).toUpperCase()}.pdf`,
              content: invoiceBuffer
           }
        ]
      });
      console.log(`[EMAIL - Resend] Sent successfully with PDF invoice to: ${clientEmail}`);
    } catch (error) {
       console.error(`[EMAIL - Resend] Error sending to ${clientEmail}:`, error);
    }
  } else {
    console.log(`[EMAIL - Resend MOCK] To: ${clientEmail}`);
    console.log(`[EMAIL - Resend MOCK] Subject: Booking Confirmed - ${serviceTitle}`);
    console.log(`[EMAIL - Resend MOCK] Body: ${message}`);
    console.log(`[EMAIL - Resend MOCK] Attachment: Invoice-SH-${appointmentId.slice(-8).toUpperCase()}.pdf generated.`);
  }

  console.log("=========================================\n");

  return true;
}
