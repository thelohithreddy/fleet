// Function to generate a 6-digit OTP
const nodemailer = require("nodemailer");
require('dotenv').config();

const getEmailCredentials = () => {
    const user = process.env.EMAIL_USER || process.env.gmail;
    const pass = process.env.EMAIL_PASS || process.env.app_pass;
    return { user, pass };
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
};

async function sendOTP(email, otp) {
    try {
        // Input validation
        if (!email || !otp) {
            throw new Error('Email and OTP are required');
        }

        const { user: gmailUser, pass: gmailPass } = getEmailCredentials();

        if (!gmailUser || !gmailPass) {
            console.error('Missing email configuration:', {
                EMAIL_USER: !!process.env.EMAIL_USER,
                gmail: !!process.env.gmail,
                EMAIL_PASS: !!process.env.EMAIL_PASS,
                app_pass: !!process.env.app_pass,
            });
            throw new Error(
                'Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in Backend/.env and restart the server.'
            );
        }

        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: gmailUser.trim(),
                pass: gmailPass.trim(),
            },
        });

        // Verify transporter configuration
        try {
            await transporter.verify();
        } catch (verifyError) {
            console.error('Transporter verification failed:', verifyError);
            throw new Error('Email service configuration is invalid');
        }

        // Email content
        const mailOptions = {
            from: `"Fleet" <${gmailUser.trim()}>`,
            to: email,
            subject: "Your Fleet Verification Code",
            text: `Your verification code is ${otp}. This code will expire in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Fleet Verification Code</h2>
                    <p>Hello,</p>
                    <p>Your verification code is:</p>
                    <h1 style="color: #4a37be; font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this code, please ignore this email.</p>
                </div>
            `,
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
        return true;
    } catch (error) {
        console.error("Error in sendOTP:", error);

        if (error.code === 'EAUTH') {
            throw new Error('Invalid email credentials. Please check email configuration.');
        }

        if (error.message.includes('configuration')) {
            throw error;
        }

        throw new Error('Failed to send verification code. Please try again later.');
    }
}

module.exports = { generateOTP, sendOTP, getEmailCredentials };
