const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173"
}));

app.get('/', (req, res) => {
    res.send('Email Spam Report Backend Running');
});

// Example test inboxes with Gmail refresh tokens
const testInboxes = [
    {
        email: "test1@gmail.com",
        refreshToken: "abcde"
    },
    {
        email: "test2@gmail.com",
        refreshToken: "abcde"
    },
    {
        email: "test3@gmail.com",
        refreshToken: "abcde"
    },
    {
        email: "test4@gmail.com",
        refreshToken: "abcde"
    },
    {
        email: "test5@gmail.com",
        refreshToken: "abcde"
    },
];

// Simulate checking emails for test code
async function checkGmail(inbox, testCode) {
    // Replace this with actual Gmail checking logic if needed
    // Here we just simulate random results for demo
    const folders = ["Inbox", "Spam", "Promotions", "Not Received"];
    const folder = folders[Math.floor(Math.random() * folders.length)];
    return folder;
}

// Send email report via Gmail SMTP using Nodemailer
async function sendReportEmail(toEmail, report) {
    try {
        const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,           
    secure: false,      
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_APP_PASS  
    },
    tls: {
        rejectUnauthorized: false
    }
});


        const htmlContent = `
            <h2>Email Test Report</h2>
            <p>Test Code: <b>${report.testCode}</b></p>
            <p>Timestamp: ${report.timestamp}</p>
            <table border="1" cellpadding="5" cellspacing="0">
                <tr>
                    <th>Inbox</th>
                    <th>Folder</th>
                </tr>
                ${report.results.map(r => `<tr><td>${r.email}</td><td>${r.folder}</td></tr>`).join('')}
            </table>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: toEmail,
            subject: `Email Test Report: ${report.testCode}`,
            html: htmlContent
        });

        console.log("Report email sent successfully!");
    } catch (err) {
        console.error("Error sending report email:", err.message);
    }
}

// API route to check emails and send report
app.get("/api/check-email", async (req, res) => {
    const { testCode, userEmail } = req.query;

    if (!testCode) return res.status(400).json({ error: "Missing testCode" });
    if (!userEmail) return res.status(400).json({ error: "Missing userEmail" });

    try {
        const results = await Promise.all(
            testInboxes.map(async (inbox) => {
                const folder = await checkGmail(inbox, testCode);
                return { email: inbox.email, folder };
            })
        );

        const report = {
            testCode,
            timestamp: new Date().toLocaleString(),
            results
        };

        // Send email report to user
        await sendReportEmail(userEmail, report);

        res.json({ report });
    } catch (err) {
        console.error("Error checking emails:", err);
        res.status(500).json({ error: "Error checking emails" });
    }
});

// Route to get list of test inboxes
app.get("/api/inboxes", (req, res) => {
    const inboxEmails = testInboxes.map(inbox => inbox.email);
    res.json({ inboxes: inboxEmails });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});