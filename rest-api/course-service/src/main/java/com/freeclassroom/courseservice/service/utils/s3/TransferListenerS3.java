package com.freeclassroom.courseservice.service.utils.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Sinks;
import software.amazon.awssdk.transfer.s3.model.TransferObjectRequest;
import software.amazon.awssdk.transfer.s3.progress.TransferListener;
import software.amazon.awssdk.transfer.s3.progress.TransferProgressSnapshot;

@Slf4j
@RequiredArgsConstructor
public class TransferListenerS3 implements TransferListener {

    private final Sinks.Many<Double> sink;

    @Override
    public void transferInitiated(Context.TransferInitiated context) {
        TransferObjectRequest request = context.request();
        log.info("Upload started for object: {}", request);
    }

    @Override
    public void bytesTransferred(Context.BytesTransferred context) {
        TransferProgressSnapshot snapshot = context.progressSnapshot();

        long transferred = snapshot.transferredBytes();
        long total = snapshot.totalBytes().orElse(0L);

        if (total > 0) {
            double pct = (double) transferred / total * 100.0;
            sink.tryEmitNext(pct);
        }
    }

    @Override
    public void transferComplete(Context.TransferComplete context) {
        sink.tryEmitNext(100.0);
        sink.tryEmitComplete();
        log.info("Upload completed successfully");
    }

    @Override
    public void transferFailed(Context.TransferFailed context) {
        sink.tryEmitError(context.exception());
        log.error("Upload failed", context.exception());
    }
}
