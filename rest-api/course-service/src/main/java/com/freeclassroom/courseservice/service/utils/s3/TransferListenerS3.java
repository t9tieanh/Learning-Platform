package com.freeclassroom.courseservice.service.utils.s3;

import com.freeclassroom.courseservice.dto.utils.UploadProgressEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Sinks;
import software.amazon.awssdk.transfer.s3.progress.TransferListener;
import software.amazon.awssdk.transfer.s3.progress.TransferProgressSnapshot;

@Slf4j
@RequiredArgsConstructor
public class TransferListenerS3 implements TransferListener {

    private final Sinks.Many<UploadProgressEvent> sink;
    private final String fileUri;

    @Override
    public void transferInitiated(Context.TransferInitiated context) {
        log.info("Upload started for object: {}", context.request());
        sink.tryEmitNext(UploadProgressEvent.builder()
                .progress(0.0)
                .build());
    }

    @Override
    public void bytesTransferred(Context.BytesTransferred context) {
        TransferProgressSnapshot snapshot = context.progressSnapshot();

        long transferred = snapshot.transferredBytes();
        long total = snapshot.totalBytes().orElse(0L);

        if (total > 0) {
            double pct = (double) transferred / total;
            sink.tryEmitNext(UploadProgressEvent.builder()
                    .progress(pct)
                    .build());
        }
    }

    @Override
    public void transferComplete(Context.TransferComplete context) {
        sink.tryEmitNext(UploadProgressEvent.builder()
                .progress(1.0)
                .fileUrl(fileUri)
                .build());
        sink.tryEmitComplete();

        log.info("Upload completed successfully for {}", fileUri);
    }

    @Override
    public void transferFailed(Context.TransferFailed context) {
        sink.tryEmitError(context.exception());
        log.error("Upload failed for {}: {}", fileUri, context.exception().getMessage());
    }
}

