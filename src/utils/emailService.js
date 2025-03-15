const nodemailer = require('nodemailer');
const verificationTemplate = require('./emailTemplates/verificationTemplate');
const passwordResetTemplate = require('./emailTemplates/passwordResetTemplate');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
service: 'gmail', // or your email service
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
}
});

class EmailService {
    static async sendEmail(to, subject, template) {
        try {
            const mailOptions = {
                from: `"Jewlyfy" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: template
            };

            const info = await transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }

    static async sendOTPEmail(email, otp) {
        return this.sendEmail(
            email,
            'Verify Your Email - Jewlyfy',
            verificationTemplate(otp)
        );
    }

    static async sendPasswordResetEmail(email, resetLink, userName = '') {
        return this.sendEmail(
            email,
            'Reset Your Password - Jewlyfy',
            passwordResetTemplate(resetLink, userName)
        );
    }
}

module.exports = EmailService; 