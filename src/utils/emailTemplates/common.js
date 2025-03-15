const commonStyles = () => `
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #141e30;
        color: #ffffff;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
    }
    .header {
        background-color: #1e2a38;
        color: #ffffff;
        text-align: center;
        padding: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px 8px 0 0;
    }
    .content {
        background-color: #1e2a38;
        padding: 30px;
        border: 1px solid #e0e0e0;
        border-radius: 0 0 8px 8px;
        color: #ffffff;
    }
    .otp-box {
        background-color: #2a374e;
        border: 2px dashed #8B4513;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
        border-radius: 8px;
    }
    .otp-code {
        font-size: 32px;
        font-weight: bold;
        color: #ffffff;
        letter-spacing: 4px;
    }
    .footer {
        text-align: center;
        margin-top: 20px;
        color: #cccccc;
        font-size: 12px;
    }
    .warning {
        color: #dc3545;
        font-size: 14px;
        margin-top: 20px;
    }
`;

const footerTemplate = () => `
    <div class="footer">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} Jewlyfy. All rights reserved.</p>
        <p>Questions? Contact our support team</p>
    </div>
`;

module.exports = {
    commonStyles,
    footerTemplate
}; 