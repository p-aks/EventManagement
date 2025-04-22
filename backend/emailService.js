// emailService.js
const nodemailer = require('nodemailer');

// Create a transport using your email service credentials (e.g., Gmail, SMTP server)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use your SMTP server
  auth: {
    user: 'pakshayaprasanna@gmail.com', // Your email address
    pass: 'akshaya@275',   // Your email password (consider using environment variables)
  },
});

const sendEmailReminder = async (toEmail, subject, message) => {
  const mailOptions = {
    from: 'pakshayaprasanna@gmail.com', // Your email address
    to: toEmail,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmailReminder;
