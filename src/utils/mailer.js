const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT, // 587
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email notification for a new repository submission
 * @param {string} to - Recipient email addresses (comma separated)
 * @param {object} repo - Repository object containing title, author, etc.
 */
const sendNewSubmissionEmail = async (to, repo) => {
  try {
    const mailOptions = {
      from: `"Repository Akademik" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `Pengajuan Repository Baru: ${repo.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #ed8936;">Pengajuan Repository Baru</h2>
          <p>Halo Admin,</p>
          <p>Seorang mahasiswa baru saja mengunggah repository baru yang membutuhkan persetujuan Anda:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc; width: 30%;">Judul</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${repo.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Penulis Utama</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${repo.author}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">NPM/NIDN</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${repo.npm_nidn || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; background-color: #f8fafc;">Status</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><span style="color: #2b6cb0; font-weight: bold;">Pending Review</span></td>
            </tr>
          </table>

          <p>Silakan masuk ke <a href="http://localhost:3000/dashboard/approvals" style="color: #ed8936; text-decoration: none;">Dashboard Admin</a> untuk melihat detail dan memberikan persetujuan (Approve/Reject).</p>
          
          <br>
          <p style="font-size: 12px; color: #718096;">Email ini dibuat secara otomatis oleh sistem Repository Digital STIKes Bogor Husada. Harap tidak membalas email ini.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Notification email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  transporter,
  sendNewSubmissionEmail
};
