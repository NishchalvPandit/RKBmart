const nodemailer = require("nodemailer");
const { getFrontendUrl } = require("./frontendUrl");

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

const createSmtpTransporter = () => {
    const config = {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    if (process.env.SMTP_HOST === "smtp.gmail.com") {
        config.service = "gmail";
    } else {
        config.host = process.env.SMTP_HOST;
        config.port = Number(process.env.SMTP_PORT);
        config.secure = config.port === 465;
    }

    return nodemailer.createTransport(config);
};

const sendPasswordResetEmail = async (toEmail, token) => {
    const missing = getMissingEnv();
    if (missing.length) {
        const err = new Error(`SMTP not configured. Missing: ${missing.join(", ")}`);
        console.error("[sendPasswordResetEmail] Config error:", err.message);
        throw err;
    }

    const frontendUrl = getFrontendUrl();
    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const fromName = process.env.SMTP_FROM_NAME || "Rastriya Khadya Bank Mart";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const appName = "Rastriya Khadya Bank Mart";

    const transporter = createSmtpTransporter();

    try {
        await transporter.verify();
        console.log("[sendPasswordResetEmail] SMTP connection verified ✅");
    } catch (verifyErr) {
        console.error("[sendPasswordResetEmail] SMTP verify failed ❌:", verifyErr.message);
        console.error("  Code:", verifyErr.code);
        console.error("  Response:", verifyErr.response);
        throw verifyErr;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: toEmail,
            subject: "Reset your password – Rastriya Khadya Bank Mart",
            text: `You requested a password reset for ${appName}.\n\nPlease use the button in the HTML version of this email to reset your password.\nThis link is valid for 1 hour.\n\nIf you did not request this, ignore this email.`,
            html: `
                <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;">
                    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <div style="background:#166534;padding:18px 24px;">
                            <h1 style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;">${appName}</h1>
                            <p style="margin:6px 0 0;color:#dcfce7;font-size:13px;">Password Reset Request</p>
                        </div>
                        <div style="padding:24px;">
                            <p style="margin:0 0 12px;color:#111827;font-size:14px;line-height:1.6;">
                                You requested to reset your password.
                            </p>
                            <p style="margin:0 0 18px;color:#374151;font-size:13px;line-height:1.6;">
                                Click the button below to set a new password. This link is valid for 1 hour.
                            </p>
                            <a href="${resetLink}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 16px;border-radius:8px;">
                                Reset Password
                            </a>
                            <p style="margin:18px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
                                If you did not request this, you can safely ignore this email.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("[sendPasswordResetEmail] Email sent ✅ to:", toEmail, "| ID:", info.messageId);
    } catch (sendErr) {
        console.error("[sendPasswordResetEmail] Send failed ❌:", sendErr.message);
        throw sendErr;
    }
};

module.exports = { sendPasswordResetEmail };
