package com.example.grpc.user;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.64.0)",
    comments = "Source: blogService.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class BlogServiceGrpc {

  private BlogServiceGrpc() {}

  public static final java.lang.String SERVICE_NAME = "blog.BlogService";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.google.protobuf.Empty,
      com.example.grpc.course.TotalBlogResponse> getGetTotalBlogMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getTotalBlog",
      requestType = com.google.protobuf.Empty.class,
      responseType = com.example.grpc.course.TotalBlogResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.google.protobuf.Empty,
      com.example.grpc.course.TotalBlogResponse> getGetTotalBlogMethod() {
    io.grpc.MethodDescriptor<com.google.protobuf.Empty, com.example.grpc.course.TotalBlogResponse> getGetTotalBlogMethod;
    if ((getGetTotalBlogMethod = BlogServiceGrpc.getGetTotalBlogMethod) == null) {
      synchronized (BlogServiceGrpc.class) {
        if ((getGetTotalBlogMethod = BlogServiceGrpc.getGetTotalBlogMethod) == null) {
          BlogServiceGrpc.getGetTotalBlogMethod = getGetTotalBlogMethod =
              io.grpc.MethodDescriptor.<com.google.protobuf.Empty, com.example.grpc.course.TotalBlogResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getTotalBlog"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.google.protobuf.Empty.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.TotalBlogResponse.getDefaultInstance()))
              .setSchemaDescriptor(new BlogServiceMethodDescriptorSupplier("getTotalBlog"))
              .build();
        }
      }
    }
    return getGetTotalBlogMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest,
      com.example.grpc.course.TotalBlogResponse> getGetTotalInstructorBlogMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getTotalInstructorBlog",
      requestType = com.example.grpc.user.GetUserRequest.class,
      responseType = com.example.grpc.course.TotalBlogResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest,
      com.example.grpc.course.TotalBlogResponse> getGetTotalInstructorBlogMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest, com.example.grpc.course.TotalBlogResponse> getGetTotalInstructorBlogMethod;
    if ((getGetTotalInstructorBlogMethod = BlogServiceGrpc.getGetTotalInstructorBlogMethod) == null) {
      synchronized (BlogServiceGrpc.class) {
        if ((getGetTotalInstructorBlogMethod = BlogServiceGrpc.getGetTotalInstructorBlogMethod) == null) {
          BlogServiceGrpc.getGetTotalInstructorBlogMethod = getGetTotalInstructorBlogMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.user.GetUserRequest, com.example.grpc.course.TotalBlogResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getTotalInstructorBlog"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.user.GetUserRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.TotalBlogResponse.getDefaultInstance()))
              .setSchemaDescriptor(new BlogServiceMethodDescriptorSupplier("getTotalInstructorBlog"))
              .build();
        }
      }
    }
    return getGetTotalInstructorBlogMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.PushSupabaseRequest,
      com.example.grpc.course.PushSupabaseResponse> getPushCourseSupabaseMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "pushCourseSupabase",
      requestType = com.example.grpc.course.PushSupabaseRequest.class,
      responseType = com.example.grpc.course.PushSupabaseResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.PushSupabaseRequest,
      com.example.grpc.course.PushSupabaseResponse> getPushCourseSupabaseMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.PushSupabaseRequest, com.example.grpc.course.PushSupabaseResponse> getPushCourseSupabaseMethod;
    if ((getPushCourseSupabaseMethod = BlogServiceGrpc.getPushCourseSupabaseMethod) == null) {
      synchronized (BlogServiceGrpc.class) {
        if ((getPushCourseSupabaseMethod = BlogServiceGrpc.getPushCourseSupabaseMethod) == null) {
          BlogServiceGrpc.getPushCourseSupabaseMethod = getPushCourseSupabaseMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.PushSupabaseRequest, com.example.grpc.course.PushSupabaseResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "pushCourseSupabase"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.PushSupabaseRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.PushSupabaseResponse.getDefaultInstance()))
              .setSchemaDescriptor(new BlogServiceMethodDescriptorSupplier("pushCourseSupabase"))
              .build();
        }
      }
    }
    return getPushCourseSupabaseMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.CreateConversationAIRequest,
      com.example.grpc.course.CreateConversationAIResponse> getCreateConversationAIMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "createConversationAI",
      requestType = com.example.grpc.course.CreateConversationAIRequest.class,
      responseType = com.example.grpc.course.CreateConversationAIResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.CreateConversationAIRequest,
      com.example.grpc.course.CreateConversationAIResponse> getCreateConversationAIMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.CreateConversationAIRequest, com.example.grpc.course.CreateConversationAIResponse> getCreateConversationAIMethod;
    if ((getCreateConversationAIMethod = BlogServiceGrpc.getCreateConversationAIMethod) == null) {
      synchronized (BlogServiceGrpc.class) {
        if ((getCreateConversationAIMethod = BlogServiceGrpc.getCreateConversationAIMethod) == null) {
          BlogServiceGrpc.getCreateConversationAIMethod = getCreateConversationAIMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.CreateConversationAIRequest, com.example.grpc.course.CreateConversationAIResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "createConversationAI"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.CreateConversationAIRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.CreateConversationAIResponse.getDefaultInstance()))
              .setSchemaDescriptor(new BlogServiceMethodDescriptorSupplier("createConversationAI"))
              .build();
        }
      }
    }
    return getCreateConversationAIMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.GetFeedbackByCourseIdRequest,
      com.example.grpc.course.GetFeedbackByCourseIdResponse> getGetFeedbackByCourseIdMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getFeedbackByCourseId",
      requestType = com.example.grpc.course.GetFeedbackByCourseIdRequest.class,
      responseType = com.example.grpc.course.GetFeedbackByCourseIdResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.GetFeedbackByCourseIdRequest,
      com.example.grpc.course.GetFeedbackByCourseIdResponse> getGetFeedbackByCourseIdMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.GetFeedbackByCourseIdRequest, com.example.grpc.course.GetFeedbackByCourseIdResponse> getGetFeedbackByCourseIdMethod;
    if ((getGetFeedbackByCourseIdMethod = BlogServiceGrpc.getGetFeedbackByCourseIdMethod) == null) {
      synchronized (BlogServiceGrpc.class) {
        if ((getGetFeedbackByCourseIdMethod = BlogServiceGrpc.getGetFeedbackByCourseIdMethod) == null) {
          BlogServiceGrpc.getGetFeedbackByCourseIdMethod = getGetFeedbackByCourseIdMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.GetFeedbackByCourseIdRequest, com.example.grpc.course.GetFeedbackByCourseIdResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getFeedbackByCourseId"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetFeedbackByCourseIdRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetFeedbackByCourseIdResponse.getDefaultInstance()))
              .setSchemaDescriptor(new BlogServiceMethodDescriptorSupplier("getFeedbackByCourseId"))
              .build();
        }
      }
    }
    return getGetFeedbackByCourseIdMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static BlogServiceStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<BlogServiceStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<BlogServiceStub>() {
        @java.lang.Override
        public BlogServiceStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new BlogServiceStub(channel, callOptions);
        }
      };
    return BlogServiceStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static BlogServiceBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<BlogServiceBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<BlogServiceBlockingStub>() {
        @java.lang.Override
        public BlogServiceBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new BlogServiceBlockingStub(channel, callOptions);
        }
      };
    return BlogServiceBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static BlogServiceFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<BlogServiceFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<BlogServiceFutureStub>() {
        @java.lang.Override
        public BlogServiceFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new BlogServiceFutureStub(channel, callOptions);
        }
      };
    return BlogServiceFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void getTotalBlog(com.google.protobuf.Empty request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetTotalBlogMethod(), responseObserver);
    }

    /**
     */
    default void getTotalInstructorBlog(com.example.grpc.user.GetUserRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetTotalInstructorBlogMethod(), responseObserver);
    }

    /**
     */
    default void pushCourseSupabase(com.example.grpc.course.PushSupabaseRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.PushSupabaseResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getPushCourseSupabaseMethod(), responseObserver);
    }

    /**
     */
    default void createConversationAI(com.example.grpc.course.CreateConversationAIRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.CreateConversationAIResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getCreateConversationAIMethod(), responseObserver);
    }

    /**
     */
    default void getFeedbackByCourseId(com.example.grpc.course.GetFeedbackByCourseIdRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetFeedbackByCourseIdResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetFeedbackByCourseIdMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service BlogService.
   */
  public static abstract class BlogServiceImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return BlogServiceGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service BlogService.
   */
  public static final class BlogServiceStub
      extends io.grpc.stub.AbstractAsyncStub<BlogServiceStub> {
    private BlogServiceStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected BlogServiceStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new BlogServiceStub(channel, callOptions);
    }

    /**
     */
    public void getTotalBlog(com.google.protobuf.Empty request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetTotalBlogMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getTotalInstructorBlog(com.example.grpc.user.GetUserRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetTotalInstructorBlogMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void pushCourseSupabase(com.example.grpc.course.PushSupabaseRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.PushSupabaseResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getPushCourseSupabaseMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void createConversationAI(com.example.grpc.course.CreateConversationAIRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.CreateConversationAIResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getCreateConversationAIMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getFeedbackByCourseId(com.example.grpc.course.GetFeedbackByCourseIdRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetFeedbackByCourseIdResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetFeedbackByCourseIdMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service BlogService.
   */
  public static final class BlogServiceBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<BlogServiceBlockingStub> {
    private BlogServiceBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected BlogServiceBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new BlogServiceBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.example.grpc.course.TotalBlogResponse getTotalBlog(com.google.protobuf.Empty request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetTotalBlogMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.TotalBlogResponse getTotalInstructorBlog(com.example.grpc.user.GetUserRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetTotalInstructorBlogMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.PushSupabaseResponse pushCourseSupabase(com.example.grpc.course.PushSupabaseRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getPushCourseSupabaseMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.CreateConversationAIResponse createConversationAI(com.example.grpc.course.CreateConversationAIRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getCreateConversationAIMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetFeedbackByCourseIdResponse getFeedbackByCourseId(com.example.grpc.course.GetFeedbackByCourseIdRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetFeedbackByCourseIdMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service BlogService.
   */
  public static final class BlogServiceFutureStub
      extends io.grpc.stub.AbstractFutureStub<BlogServiceFutureStub> {
    private BlogServiceFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected BlogServiceFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new BlogServiceFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.TotalBlogResponse> getTotalBlog(
        com.google.protobuf.Empty request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetTotalBlogMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.TotalBlogResponse> getTotalInstructorBlog(
        com.example.grpc.user.GetUserRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetTotalInstructorBlogMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.PushSupabaseResponse> pushCourseSupabase(
        com.example.grpc.course.PushSupabaseRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getPushCourseSupabaseMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.CreateConversationAIResponse> createConversationAI(
        com.example.grpc.course.CreateConversationAIRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getCreateConversationAIMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetFeedbackByCourseIdResponse> getFeedbackByCourseId(
        com.example.grpc.course.GetFeedbackByCourseIdRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetFeedbackByCourseIdMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_GET_TOTAL_BLOG = 0;
  private static final int METHODID_GET_TOTAL_INSTRUCTOR_BLOG = 1;
  private static final int METHODID_PUSH_COURSE_SUPABASE = 2;
  private static final int METHODID_CREATE_CONVERSATION_AI = 3;
  private static final int METHODID_GET_FEEDBACK_BY_COURSE_ID = 4;

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
        case METHODID_GET_TOTAL_BLOG:
          serviceImpl.getTotalBlog((com.google.protobuf.Empty) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse>) responseObserver);
          break;
        case METHODID_GET_TOTAL_INSTRUCTOR_BLOG:
          serviceImpl.getTotalInstructorBlog((com.example.grpc.user.GetUserRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.TotalBlogResponse>) responseObserver);
          break;
        case METHODID_PUSH_COURSE_SUPABASE:
          serviceImpl.pushCourseSupabase((com.example.grpc.course.PushSupabaseRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.PushSupabaseResponse>) responseObserver);
          break;
        case METHODID_CREATE_CONVERSATION_AI:
          serviceImpl.createConversationAI((com.example.grpc.course.CreateConversationAIRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.CreateConversationAIResponse>) responseObserver);
          break;
        case METHODID_GET_FEEDBACK_BY_COURSE_ID:
          serviceImpl.getFeedbackByCourseId((com.example.grpc.course.GetFeedbackByCourseIdRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetFeedbackByCourseIdResponse>) responseObserver);
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
          getGetTotalBlogMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.google.protobuf.Empty,
              com.example.grpc.course.TotalBlogResponse>(
                service, METHODID_GET_TOTAL_BLOG)))
        .addMethod(
          getGetTotalInstructorBlogMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.user.GetUserRequest,
              com.example.grpc.course.TotalBlogResponse>(
                service, METHODID_GET_TOTAL_INSTRUCTOR_BLOG)))
        .addMethod(
          getPushCourseSupabaseMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.PushSupabaseRequest,
              com.example.grpc.course.PushSupabaseResponse>(
                service, METHODID_PUSH_COURSE_SUPABASE)))
        .addMethod(
          getCreateConversationAIMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.CreateConversationAIRequest,
              com.example.grpc.course.CreateConversationAIResponse>(
                service, METHODID_CREATE_CONVERSATION_AI)))
        .addMethod(
          getGetFeedbackByCourseIdMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.GetFeedbackByCourseIdRequest,
              com.example.grpc.course.GetFeedbackByCourseIdResponse>(
                service, METHODID_GET_FEEDBACK_BY_COURSE_ID)))
        .build();
  }

  private static abstract class BlogServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    BlogServiceBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.example.grpc.user.BlogServiceProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("BlogService");
    }
  }

  private static final class BlogServiceFileDescriptorSupplier
      extends BlogServiceBaseDescriptorSupplier {
    BlogServiceFileDescriptorSupplier() {}
  }

  private static final class BlogServiceMethodDescriptorSupplier
      extends BlogServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    BlogServiceMethodDescriptorSupplier(java.lang.String methodName) {
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
      synchronized (BlogServiceGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new BlogServiceFileDescriptorSupplier())
              .addMethod(getGetTotalBlogMethod())
              .addMethod(getGetTotalInstructorBlogMethod())
              .addMethod(getPushCourseSupabaseMethod())
              .addMethod(getCreateConversationAIMethod())
              .addMethod(getGetFeedbackByCourseIdMethod())
              .build();
        }
      }
    }
    return result;
  }
}
