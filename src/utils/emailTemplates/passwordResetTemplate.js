const { commonStyles, footerTemplate } = require('./common');

const passwordResetTemplate = (resetLink, userName = '') => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            ${commonStyles()}
            .reset-button {
                background-color:rgb(8, 8, 8);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
                text-align: center;
            }
            .reset-button:hover {
                background-color:rgb(104, 103, 102);
            }
            .note {
                background-color: #2a374e;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Jewlyfy</h1>
            </div>
            <div class="content">
                <h2>Reset Your Password 🔐</h2>
                ${userName ? `<p>Hello ${userName},</p>` : ''}
                <p>We received a request to reset your password for your Jewlyfy account. Click the button below to set a new password:</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="reset-button">
                        Reset Password
                    </a>
                </div>

                <div class="note">
                    <p>⚠️ For security reasons, this link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
                </div>

                <p>For your security, never share this link with anyone. Our team will never ask for your password or this reset link.</p>
            </div>
            ${footerTemplate()}
        </div>
    </body>
    </html>
`;

module.exports = passwordResetTemplate; 