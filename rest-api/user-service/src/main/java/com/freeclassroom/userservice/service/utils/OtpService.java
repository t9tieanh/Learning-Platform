package com.freeclassroom.userservice.service.utils;

import com.freeclassroom.userservice.constant.SendOTPConstant;
import com.freeclassroom.userservice.exception.CustomExeption;
import com.freeclassroom.userservice.exception.ErrorCode;
import com.freeclassroom.userservice.utils.MailUtils;
import com.freeclassroom.userservice.utils.OTP;
import jakarta.servlet.http.HttpSession;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpService {

    HttpSession session;
    MailUtils mailUtils;

    public void createOTP (String email) {
        OTP otp = new OTP();

        if (sendOTP(otp,email)) {
            session.setAttribute(SendOTPConstant.OTP, otp);
            System.out.println(otp.getOtp());
        }
        else throw new CustomExeption(ErrorCode.OTP_SEND);
    }

    boolean sendOTP (OTP otp,String email) {
        String subject = "Your OTP";
        String body = "Hi,\n\nYour OTP is: " + otp.getOtp() + "\nPlease use this code to authenticate.";

        return mailUtils.sendEmail("phama9162@gmail.com", email, subject, body);
    }

    public boolean validateOtp(String inputOtp) {
        OTP storedOtp = (OTP) session.getAttribute(SendOTPConstant.OTP);

        if (storedOtp == null) {
            return false;
        }

        return storedOtp.getOtp().equals(inputOtp);
    }

}
