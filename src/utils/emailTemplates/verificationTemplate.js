const verificationTemplate = (otp) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            ${commonStyles()}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Jewlyfy</h1>
            </div>
            <div class="content">
                <h2>Welcome to Jewlyfy! 👋</h2>
                <p>Thank you for choosing Jewlyfy. To ensure the security of your account, please verify your email address using the OTP below:</p>
                
                <div class="otp-box">
                    <p>Your Verification Code</p>
                    <div class="otp-code">${otp}</div>
                    <p style="font-size: 14px; margin-top: 10px;">This code will expire in 10 minutes</p>
                </div>

                <p>If you didn't create an account with Jewlyfy, please ignore this email or contact our support team if you have concerns.</p>
                
                <div class="warning">
                    ⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.
                </div>
            </div>
            ${footerTemplate()}
        </div>
    </body>
    </html>
`;

module.exports = verificationTemplate; 