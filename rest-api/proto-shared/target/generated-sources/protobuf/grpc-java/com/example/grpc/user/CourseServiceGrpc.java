package com.example.grpc.user;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.64.0)",
    comments = "Source: courseService.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class CourseServiceGrpc {

  private CourseServiceGrpc() {}

  public static final java.lang.String SERVICE_NAME = "CourseService";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.GetCourseRequest,
      com.example.grpc.course.CourseResponse> getGetCourseMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getCourse",
      requestType = com.example.grpc.course.GetCourseRequest.class,
      responseType = com.example.grpc.course.CourseResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.GetCourseRequest,
      com.example.grpc.course.CourseResponse> getGetCourseMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.GetCourseRequest, com.example.grpc.course.CourseResponse> getGetCourseMethod;
    if ((getGetCourseMethod = CourseServiceGrpc.getGetCourseMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getGetCourseMethod = CourseServiceGrpc.getGetCourseMethod) == null) {
          CourseServiceGrpc.getGetCourseMethod = getGetCourseMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.GetCourseRequest, com.example.grpc.course.CourseResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getCourse"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCourseRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.CourseResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("getCourse"))
              .build();
        }
      }
    }
    return getGetCourseMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.GetCoursesRequest,
      com.example.grpc.course.GetCoursesResponse> getGetBulkCoursesMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getBulkCourses",
      requestType = com.example.grpc.course.GetCoursesRequest.class,
      responseType = com.example.grpc.course.GetCoursesResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.GetCoursesRequest,
      com.example.grpc.course.GetCoursesResponse> getGetBulkCoursesMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.GetCoursesRequest, com.example.grpc.course.GetCoursesResponse> getGetBulkCoursesMethod;
    if ((getGetBulkCoursesMethod = CourseServiceGrpc.getGetBulkCoursesMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getGetBulkCoursesMethod = CourseServiceGrpc.getGetBulkCoursesMethod) == null) {
          CourseServiceGrpc.getGetBulkCoursesMethod = getGetBulkCoursesMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.GetCoursesRequest, com.example.grpc.course.GetCoursesResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getBulkCourses"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCoursesRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCoursesResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("getBulkCourses"))
              .build();
        }
      }
    }
    return getGetBulkCoursesMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.EnrolledCoursesRequest,
      com.example.grpc.course.GetCoursesResponse> getListEnrolledCoursesMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "listEnrolledCourses",
      requestType = com.example.grpc.course.EnrolledCoursesRequest.class,
      responseType = com.example.grpc.course.GetCoursesResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.EnrolledCoursesRequest,
      com.example.grpc.course.GetCoursesResponse> getListEnrolledCoursesMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.EnrolledCoursesRequest, com.example.grpc.course.GetCoursesResponse> getListEnrolledCoursesMethod;
    if ((getListEnrolledCoursesMethod = CourseServiceGrpc.getListEnrolledCoursesMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getListEnrolledCoursesMethod = CourseServiceGrpc.getListEnrolledCoursesMethod) == null) {
          CourseServiceGrpc.getListEnrolledCoursesMethod = getListEnrolledCoursesMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.EnrolledCoursesRequest, com.example.grpc.course.GetCoursesResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "listEnrolledCourses"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.EnrolledCoursesRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCoursesResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("listEnrolledCourses"))
              .build();
        }
      }
    }
    return getListEnrolledCoursesMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.google.protobuf.Empty,
      com.example.grpc.course.GetCourseAdminDataResponse> getGetCourseAdminDataMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getCourseAdminData",
      requestType = com.google.protobuf.Empty.class,
      responseType = com.example.grpc.course.GetCourseAdminDataResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.google.protobuf.Empty,
      com.example.grpc.course.GetCourseAdminDataResponse> getGetCourseAdminDataMethod() {
    io.grpc.MethodDescriptor<com.google.protobuf.Empty, com.example.grpc.course.GetCourseAdminDataResponse> getGetCourseAdminDataMethod;
    if ((getGetCourseAdminDataMethod = CourseServiceGrpc.getGetCourseAdminDataMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getGetCourseAdminDataMethod = CourseServiceGrpc.getGetCourseAdminDataMethod) == null) {
          CourseServiceGrpc.getGetCourseAdminDataMethod = getGetCourseAdminDataMethod =
              io.grpc.MethodDescriptor.<com.google.protobuf.Empty, com.example.grpc.course.GetCourseAdminDataResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getCourseAdminData"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.google.protobuf.Empty.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCourseAdminDataResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("getCourseAdminData"))
              .build();
        }
      }
    }
    return getGetCourseAdminDataMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest,
      com.example.grpc.course.GetCourseAndStudentResponse> getGetTotalCoursesAndStudentMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getTotalCoursesAndStudent",
      requestType = com.example.grpc.user.GetUserRequest.class,
      responseType = com.example.grpc.course.GetCourseAndStudentResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest,
      com.example.grpc.course.GetCourseAndStudentResponse> getGetTotalCoursesAndStudentMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.user.GetUserRequest, com.example.grpc.course.GetCourseAndStudentResponse> getGetTotalCoursesAndStudentMethod;
    if ((getGetTotalCoursesAndStudentMethod = CourseServiceGrpc.getGetTotalCoursesAndStudentMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getGetTotalCoursesAndStudentMethod = CourseServiceGrpc.getGetTotalCoursesAndStudentMethod) == null) {
          CourseServiceGrpc.getGetTotalCoursesAndStudentMethod = getGetTotalCoursesAndStudentMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.user.GetUserRequest, com.example.grpc.course.GetCourseAndStudentResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getTotalCoursesAndStudent"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.user.GetUserRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetCourseAndStudentResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("getTotalCoursesAndStudent"))
              .build();
        }
      }
    }
    return getGetTotalCoursesAndStudentMethod;
  }

  private static volatile io.grpc.MethodDescriptor<com.example.grpc.course.GetChartDataRequest,
      com.example.grpc.course.GetChartDataResponse> getGetChartDataMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "getChartData",
      requestType = com.example.grpc.course.GetChartDataRequest.class,
      responseType = com.example.grpc.course.GetChartDataResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.example.grpc.course.GetChartDataRequest,
      com.example.grpc.course.GetChartDataResponse> getGetChartDataMethod() {
    io.grpc.MethodDescriptor<com.example.grpc.course.GetChartDataRequest, com.example.grpc.course.GetChartDataResponse> getGetChartDataMethod;
    if ((getGetChartDataMethod = CourseServiceGrpc.getGetChartDataMethod) == null) {
      synchronized (CourseServiceGrpc.class) {
        if ((getGetChartDataMethod = CourseServiceGrpc.getGetChartDataMethod) == null) {
          CourseServiceGrpc.getGetChartDataMethod = getGetChartDataMethod =
              io.grpc.MethodDescriptor.<com.example.grpc.course.GetChartDataRequest, com.example.grpc.course.GetChartDataResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "getChartData"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetChartDataRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.example.grpc.course.GetChartDataResponse.getDefaultInstance()))
              .setSchemaDescriptor(new CourseServiceMethodDescriptorSupplier("getChartData"))
              .build();
        }
      }
    }
    return getGetChartDataMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static CourseServiceStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CourseServiceStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CourseServiceStub>() {
        @java.lang.Override
        public CourseServiceStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CourseServiceStub(channel, callOptions);
        }
      };
    return CourseServiceStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static CourseServiceBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CourseServiceBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CourseServiceBlockingStub>() {
        @java.lang.Override
        public CourseServiceBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CourseServiceBlockingStub(channel, callOptions);
        }
      };
    return CourseServiceBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static CourseServiceFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<CourseServiceFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<CourseServiceFutureStub>() {
        @java.lang.Override
        public CourseServiceFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new CourseServiceFutureStub(channel, callOptions);
        }
      };
    return CourseServiceFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void getCourse(com.example.grpc.course.GetCourseRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.CourseResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetCourseMethod(), responseObserver);
    }

    /**
     */
    default void getBulkCourses(com.example.grpc.course.GetCoursesRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetBulkCoursesMethod(), responseObserver);
    }

    /**
     */
    default void listEnrolledCourses(com.example.grpc.course.EnrolledCoursesRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getListEnrolledCoursesMethod(), responseObserver);
    }

    /**
     */
    default void getCourseAdminData(com.google.protobuf.Empty request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAdminDataResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetCourseAdminDataMethod(), responseObserver);
    }

    /**
     */
    default void getTotalCoursesAndStudent(com.example.grpc.user.GetUserRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAndStudentResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetTotalCoursesAndStudentMethod(), responseObserver);
    }

    /**
     */
    default void getChartData(com.example.grpc.course.GetChartDataRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetChartDataResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getGetChartDataMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service CourseService.
   */
  public static abstract class CourseServiceImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return CourseServiceGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service CourseService.
   */
  public static final class CourseServiceStub
      extends io.grpc.stub.AbstractAsyncStub<CourseServiceStub> {
    private CourseServiceStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CourseServiceStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CourseServiceStub(channel, callOptions);
    }

    /**
     */
    public void getCourse(com.example.grpc.course.GetCourseRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.CourseResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetCourseMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getBulkCourses(com.example.grpc.course.GetCoursesRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetBulkCoursesMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void listEnrolledCourses(com.example.grpc.course.EnrolledCoursesRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getListEnrolledCoursesMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getCourseAdminData(com.google.protobuf.Empty request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAdminDataResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetCourseAdminDataMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getTotalCoursesAndStudent(com.example.grpc.user.GetUserRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAndStudentResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetTotalCoursesAndStudentMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void getChartData(com.example.grpc.course.GetChartDataRequest request,
        io.grpc.stub.StreamObserver<com.example.grpc.course.GetChartDataResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getGetChartDataMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service CourseService.
   */
  public static final class CourseServiceBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<CourseServiceBlockingStub> {
    private CourseServiceBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CourseServiceBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CourseServiceBlockingStub(channel, callOptions);
    }

    /**
     */
    public com.example.grpc.course.CourseResponse getCourse(com.example.grpc.course.GetCourseRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetCourseMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetCoursesResponse getBulkCourses(com.example.grpc.course.GetCoursesRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetBulkCoursesMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetCoursesResponse listEnrolledCourses(com.example.grpc.course.EnrolledCoursesRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getListEnrolledCoursesMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetCourseAdminDataResponse getCourseAdminData(com.google.protobuf.Empty request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetCourseAdminDataMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetCourseAndStudentResponse getTotalCoursesAndStudent(com.example.grpc.user.GetUserRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetTotalCoursesAndStudentMethod(), getCallOptions(), request);
    }

    /**
     */
    public com.example.grpc.course.GetChartDataResponse getChartData(com.example.grpc.course.GetChartDataRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getGetChartDataMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service CourseService.
   */
  public static final class CourseServiceFutureStub
      extends io.grpc.stub.AbstractFutureStub<CourseServiceFutureStub> {
    private CourseServiceFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected CourseServiceFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new CourseServiceFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.CourseResponse> getCourse(
        com.example.grpc.course.GetCourseRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetCourseMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetCoursesResponse> getBulkCourses(
        com.example.grpc.course.GetCoursesRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetBulkCoursesMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetCoursesResponse> listEnrolledCourses(
        com.example.grpc.course.EnrolledCoursesRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getListEnrolledCoursesMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetCourseAdminDataResponse> getCourseAdminData(
        com.google.protobuf.Empty request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetCourseAdminDataMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetCourseAndStudentResponse> getTotalCoursesAndStudent(
        com.example.grpc.user.GetUserRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetTotalCoursesAndStudentMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<com.example.grpc.course.GetChartDataResponse> getChartData(
        com.example.grpc.course.GetChartDataRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getGetChartDataMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_GET_COURSE = 0;
  private static final int METHODID_GET_BULK_COURSES = 1;
  private static final int METHODID_LIST_ENROLLED_COURSES = 2;
  private static final int METHODID_GET_COURSE_ADMIN_DATA = 3;
  private static final int METHODID_GET_TOTAL_COURSES_AND_STUDENT = 4;
  private static final int METHODID_GET_CHART_DATA = 5;

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
        case METHODID_GET_COURSE:
          serviceImpl.getCourse((com.example.grpc.course.GetCourseRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.CourseResponse>) responseObserver);
          break;
        case METHODID_GET_BULK_COURSES:
          serviceImpl.getBulkCourses((com.example.grpc.course.GetCoursesRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse>) responseObserver);
          break;
        case METHODID_LIST_ENROLLED_COURSES:
          serviceImpl.listEnrolledCourses((com.example.grpc.course.EnrolledCoursesRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetCoursesResponse>) responseObserver);
          break;
        case METHODID_GET_COURSE_ADMIN_DATA:
          serviceImpl.getCourseAdminData((com.google.protobuf.Empty) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAdminDataResponse>) responseObserver);
          break;
        case METHODID_GET_TOTAL_COURSES_AND_STUDENT:
          serviceImpl.getTotalCoursesAndStudent((com.example.grpc.user.GetUserRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetCourseAndStudentResponse>) responseObserver);
          break;
        case METHODID_GET_CHART_DATA:
          serviceImpl.getChartData((com.example.grpc.course.GetChartDataRequest) request,
              (io.grpc.stub.StreamObserver<com.example.grpc.course.GetChartDataResponse>) responseObserver);
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
          getGetCourseMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.GetCourseRequest,
              com.example.grpc.course.CourseResponse>(
                service, METHODID_GET_COURSE)))
        .addMethod(
          getGetBulkCoursesMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.GetCoursesRequest,
              com.example.grpc.course.GetCoursesResponse>(
                service, METHODID_GET_BULK_COURSES)))
        .addMethod(
          getListEnrolledCoursesMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.EnrolledCoursesRequest,
              com.example.grpc.course.GetCoursesResponse>(
                service, METHODID_LIST_ENROLLED_COURSES)))
        .addMethod(
          getGetCourseAdminDataMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.google.protobuf.Empty,
              com.example.grpc.course.GetCourseAdminDataResponse>(
                service, METHODID_GET_COURSE_ADMIN_DATA)))
        .addMethod(
          getGetTotalCoursesAndStudentMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.user.GetUserRequest,
              com.example.grpc.course.GetCourseAndStudentResponse>(
                service, METHODID_GET_TOTAL_COURSES_AND_STUDENT)))
        .addMethod(
          getGetChartDataMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              com.example.grpc.course.GetChartDataRequest,
              com.example.grpc.course.GetChartDataResponse>(
                service, METHODID_GET_CHART_DATA)))
        .build();
  }

  private static abstract class CourseServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    CourseServiceBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return com.example.grpc.user.CourseServiceProto.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("CourseService");
    }
  }

  private static final class CourseServiceFileDescriptorSupplier
      extends CourseServiceBaseDescriptorSupplier {
    CourseServiceFileDescriptorSupplier() {}
  }

  private static final class CourseServiceMethodDescriptorSupplier
      extends CourseServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    CourseServiceMethodDescriptorSupplier(java.lang.String methodName) {
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
      synchronized (CourseServiceGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new CourseServiceFileDescriptorSupplier())
              .addMethod(getGetCourseMethod())
              .addMethod(getGetBulkCoursesMethod())
              .addMethod(getListEnrolledCoursesMethod())
              .addMethod(getGetCourseAdminDataMethod())
              .addMethod(getGetTotalCoursesAndStudentMethod())
              .addMethod(getGetChartDataMethod())
              .build();
        }
      }
    }
    return result;
  }
}
