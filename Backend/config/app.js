module.exports = {
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "gaddampallylohithreddy7@gmail.com",
    SUPPORT_PHONE: process.env.SUPPORT_PHONE || "+918341143272",
    SUPPORT_PHONE_DISPLAY: process.env.SUPPORT_PHONE_DISPLAY || "+91 8341143272",
    OTP_RESEND_COOLDOWN_SEC: Number(process.env.OTP_RESEND_COOLDOWN_SEC) || 60,
};
