import nodemailer from 'nodemailer';
import Logger from './logger';

export const sendMail = async (to: string, subject: string, html: string) => {
  // In dev bạn có thể log nhưng tránh lộ secrets
  Logger.info(`sendMail -> to: ${to}`);
  Logger.info(`SMTP_HOST: ${process.env.SMTP_HOST} PORT: ${process.env.SMTP_PORT}`);
  Logger.info(`MAIL_FROM: ${process.env.MAIL_FROM}`);
  Logger.info(`SMTP_USER is set? ${Boolean(process.env.SMTP_USER)}`);

  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 => TLS, 587 => STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    logger: true,   // bật log chi tiết
    debug: true
  });

  // Xác minh kết nối SMTP trước khi gửi
  try {
    await transporter.verify();
    Logger.info('SMTP connection verified ✅');
  } catch (err) {
    Logger.error(`SMTP verify error ❌ ${err}`);
    throw err; // cho controller bắt và trả về lỗi dễ hiểu
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
      to,
      subject,
      html
    });
    Logger.info(`Message sent ✔ ${info.messageId}`);
    return info;
  } catch (err) {
    Logger.error(`sendMail error ❌ ${err}`);
    throw err;
  }
};
