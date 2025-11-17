package com.example.grpc.user;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.64.0)",
    comments = "Source: saleService.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class SaleServiceGrpc {

  private SaleServiceGrpc() {}

  public static final java.lang.String SERVICE_NAME = "SaleService";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.example.grpc.user.GetRevenueAndProfitRequest,
      com.example.grpc.user.GetRevenueAndProfitResponse> getGetRevenueAndProfitMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getRevenueAndProfit",
      requestType = com.example.grpc.user.GetRevenueAndProfitRequest.class,
      responseType = com.example.grpc.user.GetRevenueAndProfitResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.user.GetRevenueAndProfitRequest,
      com.example.grpc.user.GetRevenueAndProfitResponse> getGetRevenueAndProfitMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.user.GetRevenueAndProfitRequest, com.example.grpc.user.GetRevenueAndProfitResponse> getGetRevenueAndProfitMethod;
    if ((getGetRevenueAndProfitMethod = SaleServiceGrpc.getGetRevenueAndProfitMethod) == null) {
      synchronized (SaleServiceGrpc.class) {
        if ((getGetRevenueAndProfitMethod = SaleServiceGrpc.getGetRevenueAndProfitMethod) == null) {
          SaleServiceGrpc.getGetRevenueAndProfitMethod = getGetRevenueAndProfitMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.user.GetRevenueAndProfitRequest, com.example.grpc.user.GetRevenueAndProfitResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getRevenueAndProfit"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.user.GetRevenueAndProfitRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.user.GetRevenueAndProfitResponse.getDefaultInstance()))
              .setSchemaDescriptor(new SaleServiceMethodDescriptorSupplier("getRevenueAndProfit"))
              .build();
        }
      }
    }
    return getGetRevenueAndProfitMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static SaleServiceStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<SaleServiceStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<SaleServiceStub>() {
        @java.lang.Override
        public SaleServiceStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new SaleServiceStub(channel, callOptions);
        }
      };
    return SaleServiceStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static SaleServiceBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<SaleServiceBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<SaleServiceBlockingStub>() {
        @java.lang.Override
        public SaleServiceBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new SaleServiceBlockingStub(channel, callOptions);
        }
      };
    return SaleServiceBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static SaleServiceFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<SaleServiceFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<SaleServiceFutureStub>() {
        @java.lang.Override
        public SaleServiceFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new SaleServiceFutureStub(channel, callOptions);
        }
      };
    return SaleServiceFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void getRevenueAndProfit(com.example.grpc.user.GetRevenueAndProfitRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.user.GetRevenueAndProfitResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetRevenueAndProfitMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service SaleService.
   */
  public static abstract class SaleServiceImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return SaleServiceGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service SaleService.
   */
  public static final class SaleServiceStub
      extends io.grpc.stub.AbstractAsyncStub<SaleServiceStub> {
    private SaleServiceStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected SaleServiceStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new SaleServiceStub(channel, callOptions);
    }

    /**
     */
    public void getRevenueAndProfit(com.example.grpc.user.GetRevenueAndProfitRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.user.GetRevenueAndProfitResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetRevenueAndProfitMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service SaleService.
   */
  public static final class SaleServiceBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<SaleServiceBlockingStub> {
    private SaleServiceBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected SaleServiceBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new SaleServiceBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.example.grpc.user.GetRevenueAndProfitResponse getRevenueAndProfit(com.example.grpc.user.GetRevenueAndProfitRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetRevenueAndProfitMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service SaleService.
   */
  public static final class SaleServiceFutureStub
      extends io.grpc.stub.AbstractFutureStub<SaleServiceFutureStub> {
    private SaleServiceFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected SaleServiceFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new SaleServiceFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.user.GetRevenueAndProfitResponse> getRevenueAndProfit(
        com.example.grpc.user.GetRevenueAndProfitRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetRevenueAndProfitMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_GET_REVENUE_AND_PROFIT = 0;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final AsyncService serviceImpl;
    private final int methodId;

    MethodHandlers(AsyncService serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_GET_REVENUE_AND_PROFIT:
          serviceImpl.getRevenueAndProfit((com.example.grpc.user.GetRevenueAndProfitRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.user.GetRevenueAndProfitResponse>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  public static final io.grpc.ServerServiceDefinition bindService(AsyncService service) {
    return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
        .addMethod(
          getGetRevenueAndProfitMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.user.GetRevenueAndProfitRequest,
              com.example.grpc.user.GetRevenueAndProfitResponse>(
                service, METHODID_GET_REVENUE_AND_PROFIT)))
        .build();
  }

  private static abstract class SaleServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    SaleServiceBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.example.grpc.user.SaleServiceProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("SaleService");
    }
  }

  private static final class SaleServiceFileDescriptorSupplier
      extends SaleServiceBaseDescriptorSupplier {
    SaleServiceFileDescriptorSupplier() {}
  }

  private static final class SaleServiceMethodDescriptorSupplier
      extends SaleServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    SaleServiceMethodDescriptorSupplier(java.lang.String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (SaleServiceGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new SaleServiceFileDescriptorSupplier())
              .addMethod(getGetRevenueAndProfitMethod())
              .build();
        }
      }
    }
    return result;
  }
}
