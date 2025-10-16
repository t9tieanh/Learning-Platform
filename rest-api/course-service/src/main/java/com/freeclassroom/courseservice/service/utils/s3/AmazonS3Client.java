package com.freeclassroom.courseservice.service.utils.s3;

import com.freeclassroom.courseservice.exception.CustomExeption;
import com.freeclassroom.courseservice.exception.ErrorCode;
import com.freeclassroom.courseservice.service.utils.other.FileUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.FileUpload;
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest;
import software.amazon.awssdk.transfer.s3.progress.LoggingTransferListener;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.concurrent.CompletableFuture;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class AmazonS3Client {
    S3AsyncClient s3client;
    FileUtils fileUtils;

    @Value("${aws.bucketName}")
    @NonFinal
    private String bucketName;

    @Value("${aws.key-store}")
    @NonFinal
    String keyStore;

    @Value("${server.backendUri}")
    @NonFinal
    String backendUri;

    private String generateFileName(MultipartFile multiPart) {
        return new Date().getTime() + "-" + multiPart.getOriginalFilename().replace(" ", "_");
    }

    private CompletableFuture<PutObjectResponse> uploadFileTos3bucket(String key, File file) {
        PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        CompletableFuture<PutObjectResponse> response =
                s3client.putObject(objectRequest, AsyncRequestBody.fromFile(file.toPath()));

        return response.whenComplete((resp, ex) -> {
            if (ex != null) {
                System.err.println("Upload thất bại: " + ex.toString());
                throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
            } else {
                System.out.println("Upload thành công. ETag = " + resp.eTag());
            }
        });
    }

    public void uploadWithProgress(String key, File file) {
        try (S3TransferManager tm = S3TransferManager.builder()
                .s3Client(s3client)
                .build()) {

            UploadFileRequest req = UploadFileRequest.builder()
                    .putObjectRequest(b -> b.bucket(bucketName).key(key))
                    .source(file)
                    .addTransferListener(LoggingTransferListener.create()) // log progress
                    .build();

            FileUpload upload = tm.uploadFile(req);

            upload.completionFuture().join();
        }
    }

    public String uploadFile(MultipartFile multipartFile) throws IOException {

        String fileUrl = "";
        String fileUrlReturn = "";
        File file = fileUtils.convertMultiPartToFile(multipartFile);
        try {
            String fileName = generateFileName(multipartFile);
            fileUrl = keyStore + "/" + fileName;
            fileUrlReturn = backendUri + "/" + fileName;
            uploadWithProgress(fileUrl, fileUtils.convertMultiPartToFile(multipartFile));
        } catch (Exception e) {
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        } finally {
            file.delete();
        }
        return fileUrlReturn;
    }
}
