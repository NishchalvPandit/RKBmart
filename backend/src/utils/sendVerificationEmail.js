const nodemailer = require("nodemailer");

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

const getMissingEnv = () => requiredEnv.filter((key) => !process.env[key]);

const createSmtpTransporter = () => {
    const config = {
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    // If using Gmail, use the built-in service config
    if (process.env.SMTP_HOST === "smtp.gmail.com") {
        config.service = "gmail";
    } else {
        config.host = process.env.SMTP_HOST;
        config.port = Number(process.env.SMTP_PORT);
        config.secure = config.port === 465;
    }

    return nodemailer.createTransport(config);
};

const sendVerificationEmail = async (toEmail, token) => {
    const missing = getMissingEnv();
    if (missing.length) {
        const err = new Error(`SMTP not configured. Missing: ${missing.join(", ")}`);
        console.error("[sendVerificationEmail] Config error:", err.message);
        throw err;
    }

    // POINT DIRECTLY TO THE FRONTEND
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const verificationLink =
        `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const fromName = process.env.SMTP_FROM_NAME || "Rastriya Khadya Bank Mart";
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
    const appName = "Rastriya Khadya Bank Mart";

    const transporter = createSmtpTransporter();

    try {
        await transporter.verify();
        console.log("[sendVerificationEmail] SMTP connection verified ✅");
    } catch (verifyErr) {
        console.error("[sendVerificationEmail] SMTP verify failed ❌:", verifyErr.message);
        console.error("  Code:", verifyErr.code);
        console.error("  Response:", verifyErr.response);
        throw verifyErr;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: toEmail,
            subject: "Verify your email – Rastriya Khadya Bank Mart",
            text: `Welcome to ${appName}!\nPlease verify your email by clicking this link (valid for 15 minutes):\n${verificationLink}\n\nयदि तपाईंले खाता बनाउनुभएको छैन भने, कृपया यो इमेल बेवास्ता गर्नुहोस्।\nकृपया आफ्नो इमेल प्रमाणित गर्न यो लिङ्क क्लिक गर्नुहोस्: \n ${verificationLink}`,
            html: `
                <div style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,sans-serif;">
                    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                        <!-- Green Header -->
                        <div style="background:#166534;padding:18px 24px;">
                            <h1 style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;">${appName}</h1>
                            <p style="margin:6px 0 0;color:#dcfce7;font-size:13px;">Email Verification / इमेल प्रमाणीकरण</p>
                        </div>

                        <!-- Content Section -->
                        <div style="padding:24px;">
                            <!-- English Section -->
                            <div style="margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px;">
                                <p style="margin:0 0 12px;color:#111827;font-size:14px;line-height:1.6;">
                                    Welcome! Please verify your email address to activate your account.
                                </p>
                                <p style="margin:0 0 18px;color:#374151;font-size:13px;line-height:1.6;">
                                    This link is valid for 15 minutes.
                                </p>
                                <a href="${verificationLink}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:10px 16px;border-radius:8px;">
                                    Verify Email
                                </a>
                            </div>

                            <!-- Nepali Section -->
                            <div>
                                <p style="margin:0 0 12px;color:#111827;font-size:15px;line-height:1.6; font-weight: 500;">
                                    स्वागत छ! आफ्नो खाता सक्रिय गर्न कृपया आफ्नो इमेल प्रमाणित गर्नुहोस्।
                                </p>
                                <p style="margin:0 0 18px;color:#374151;font-size:14px;line-height:1.6;">
                                    यो लिङ्क १५ मिनेटको लागि मात्र मान्य छ।
                                </p>
                                <a href="${verificationLink}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:10px 16px;border-radius:8px;">
                                    इमेल प्रमाणित गर्नुहोस्
                                </a>
                            </div>

                            <!-- Footer Links -->
                            <div style="margin-top:24px; padding-top:20px; border-top: 1px solid #f3f4f6;">
                                <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;word-break:break-all;">
                                    If the button does not work, copy this link:<br/>
                                    यदि बटनले काम गरेन भने, यो लिङ्क कपी गर्नुहोस्:<br/>
                                    <a href="${verificationLink}" style="color:#16a34a;">${verificationLink}</a>
                                </p>
                                <p style="margin:14px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">
                                    If you did not create an account, you can safely ignore this email.<br/>
                                    यदि तपाईंले खाता बनाउनुभएको छैन भने, कृपया यो इमेल बेवास्ता गर्नुहोस्।
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        });
        console.log("[sendVerificationEmail] Email sent ✅ to:", toEmail, "| ID:", info.messageId);
    } catch (sendErr) {
        console.error("[sendVerificationEmail] Send failed ❌:", sendErr.message);
        throw sendErr;
    }
};

module.exports = { sendVerificationEmail };
