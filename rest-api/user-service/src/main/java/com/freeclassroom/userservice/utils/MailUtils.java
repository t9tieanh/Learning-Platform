package com.freeclassroom.userservice.utils;
import org.springframework.stereotype.Component;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import java.util.Properties;


@Component
public class MailUtils {

    // Thiết lập thuộc tính cho kết nối SMTP
    private Properties prop = new Properties();

    public MailUtils() {
        prop.put("mail.smtp.host", "smtp.gmail.com");
        prop.put("mail.smtp.port", "465");
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.starttls.enable", "true");
        prop.put("mail.smtp.starttls.required", "true");
        prop.put("mail.smtp.ssl.protocols", "TLSv1.2");
        prop.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
    }

    public boolean sendEmail(String senderEmail, String receiverEmail, String subjectText, String bodyText) {

        // Xác thực với tên người dùng và mật khẩu của bạn
        Session session = Session.getInstance(prop, new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication("phama9162@gmail.com", "owkqlhmiducelcds"); // Thay bằng email và mật khẩu của bạn
            }
        });

        try {
            // Tạo tin nhắn email
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(senderEmail)); // Địa chỉ gửi
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receiverEmail)); // Người nhận
            message.setSubject(MimeUtility.encodeText(subjectText, "UTF-8", "B"));
            message.setContent(bodyText, "text/plain; charset=UTF-8");

            // Gửi email
            Transport.send(message);

            return true; // Trả về true nếu gửi thành công
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để dễ dàng debug
            return false; // Trả về false nếu gửi thất bại
        }
    }
}

