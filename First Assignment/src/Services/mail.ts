import { MailerSend, EmailParams, Recipient, Sender } from "mailersend";
import * as Handlebars from "handlebars";
import * as fs from "fs";

const emailConfig = {
  apiKey: String(process.env.mailkey),
  senderEmail: String(process.env.email),
};

// Load email template
const emailTemplateSource = fs.readFileSync(
  "src/Services/email-template.hbs",
  "utf8"
);
const emailTemplate = Handlebars.compile(emailTemplateSource);

export async function sendEmail(
  recipientEmail: string,
  subject: string,
  super_admin: string,
  message: string,
  link?: string
): Promise<boolean> {
  try {
    // Input validation
    if (!recipientEmail || !subject || !super_admin || !message) {
      throw new Error("Invalid input");
    }

    const mailerSend = new MailerSend({
      apiKey: emailConfig.apiKey,
    });

    const recipient = new Recipient(recipientEmail);
    const sender = new Sender(emailConfig.senderEmail);

    // Render email template
    const emailBody = emailTemplate({
      subject,
      link,
      super_admin,
      message,
    });

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo([recipient])
      .setSubject(subject)
      .setHtml(emailBody);

    await mailerSend.email.send(emailParams);
    console.log("Email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
