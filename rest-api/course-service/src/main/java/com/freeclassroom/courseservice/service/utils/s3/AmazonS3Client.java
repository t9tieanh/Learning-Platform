package com.freeclassroom.courseservice.service.utils.s3;

import com.freeclassroom.courseservice.dto.utils.MultipartUploadSession;
import com.freeclassroom.courseservice.dto.utils.PresignedPart;
import com.freeclassroom.courseservice.dto.utils.UploadProgressEvent;
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
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import software.amazon.awssdk.core.async.AsyncRequestBody;
import software.amazon.awssdk.services.s3.S3AsyncClient;
import software.amazon.awssdk.services.s3.model.AbortMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedUploadPartRequest;
import software.amazon.awssdk.services.s3.presigner.model.UploadPartPresignRequest;
import software.amazon.awssdk.transfer.s3.S3TransferManager;
import software.amazon.awssdk.transfer.s3.model.FileUpload;
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest;
import software.amazon.awssdk.transfer.s3.progress.LoggingTransferListener;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class AmazonS3Client {
    S3AsyncClient s3client;
    S3Presigner s3Presigner;
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
        return generateFileName(multiPart.getOriginalFilename());
    }

    private String generateFileName(String originalFileName) {
        return new Date().getTime() + "-" + fileUtils.toAsciiFileName(originalFileName);
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

    private String buildFileUrl(String key) {
        String fileName = key.contains("/") ? key.substring(key.lastIndexOf('/') + 1) : key;
        return backendUri + "/" + fileName;
    }

    public MultipartUploadSession initMultipartUpload(String originalFileName, String contentType) {
        try {
            String fileName = generateFileName(originalFileName);
            String key = keyStore + "/" + fileName;
            CreateMultipartUploadResponse response = s3client.createMultipartUpload(CreateMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build()).join();

            return MultipartUploadSession.builder()
                    .uploadId(response.uploadId())
                    .objectKey(key)
                    .fileUrl(buildFileUrl(key))
                    .fileName(fileName)
                    .build();
        } catch (Exception exception) {
            log.error("Init multipart upload failed", exception);
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        }
    }

    public List<PresignedPart> generatePresignedUrls(String objectKey, String uploadId, List<Integer> partNumbers, long expirySeconds) {
        try {
            Instant expiresAt = Instant.now().plus(expirySeconds, ChronoUnit.SECONDS);
            return partNumbers.stream()
                    .map(partNumber -> {
                        UploadPartRequest uploadPartRequest = UploadPartRequest.builder()
                                .bucket(bucketName)
                                .key(objectKey)
                                .partNumber(partNumber)
                                .uploadId(uploadId)
                                .build();

                        UploadPartPresignRequest presignRequest = UploadPartPresignRequest.builder()
                                .signatureDuration(java.time.Duration.ofSeconds(expirySeconds))
                                .uploadPartRequest(uploadPartRequest)
                                .build();

                        PresignedUploadPartRequest presignedRequest = s3Presigner.presignUploadPart(presignRequest);

                        return PresignedPart.builder()
                                .partNumber(partNumber)
                                .url(presignedRequest.url().toExternalForm())
                                .expiresAt(expiresAt.toEpochMilli())
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception exception) {
            log.error("Generate presigned urls failed", exception);
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        }
    }

    public String completeMultipartUpload(String objectKey, String uploadId, List<CompletedPart> parts) {
        try {
            CompletedMultipartUpload completedMultipartUpload = CompletedMultipartUpload.builder()
                    .parts(parts)
                    .build();

            s3client.completeMultipartUpload(CompleteMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .multipartUpload(completedMultipartUpload)
                    .build()).join();

            return buildFileUrl(objectKey);
        } catch (Exception exception) {
            log.error("Complete multipart upload failed", exception);
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        }
    }

    public void abortMultipartUpload(String objectKey, String uploadId) {
        try {
            s3client.abortMultipartUpload(AbortMultipartUploadRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .uploadId(uploadId)
                    .build()).join();
        } catch (Exception exception) {
            log.error("Abort multipart upload failed", exception);
            throw new CustomExeption(ErrorCode.UPLOAD_NOT_COMPLETED);
        }
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

    public Flux<UploadProgressEvent> uploadFileWithProgress(MultipartFile multipartFile) throws IOException {
        Sinks.Many<UploadProgressEvent> sink = Sinks.many().unicast().onBackpressureBuffer();

        File file = fileUtils.convertMultiPartToFile(multipartFile);
        String fileName = generateFileName(multipartFile);
        String key = keyStore + "/" + fileName;

        TransferListenerS3 listener = new TransferListenerS3(sink, backendUri + "/" + fileName);

        CompletableFuture.runAsync(() -> {
            try (S3TransferManager tm = S3TransferManager.builder()
                    .s3Client(s3client)
                    .build()) {

                UploadFileRequest req = UploadFileRequest.builder()
                        .putObjectRequest(b -> b.bucket(bucketName).key(key))
                        .addTransferListener(listener)
                        .source(file.toPath())
                        .build();

                tm.uploadFile(req).completionFuture().join();

                // Báo complete khi upload xong
                sink.tryEmitNext(new UploadProgressEvent(100.0,backendUri + "/" + fileName));
                sink.tryEmitComplete();

            } catch (Exception e) {
                log.error("Upload failed", e);
                sink.tryEmitError(e);
            } finally {
                file.delete();
            }
        });

        return sink.asFlux();
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
