<p align="center">
  <img alt="Learning Platform Logo" src="./artifact/forreadme/logo_learnova.png" height=70 style="margin-bottom: 10px;"/>
</p>

<h1 align="center">Learnova – Collaborative E-Learning System</h1>

<p align="center">
  <img alt="Learning Platform Cover" src="./artifact/forreadme/cover-learnova.jpg" width="100%" style="max-width: 800px; border-radius: 8px; margin: 20px 0;"/>
</p>

<p align="center">
  <b>Backend, Frontend & Databases</b>
</p>

<p align="center">
  <a href="/">
    <img alt="Node" src="https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="Spring Boot" src="https://www.vectorlogo.zone/logos/springio/springio-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="TypeScript" src="https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="gRPC" src="https://www.vectorlogo.zone/logos/grpcio/grpcio-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="React" src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="Tailwind CSS" src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="MySQL" src="https://www.vectorlogo.zone/logos/mysql/mysql-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="MongoDB" src="https://www.vectorlogo.zone/logos/mongodb/mongodb-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="Redis" src="https://www.vectorlogo.zone/logos/redis/redis-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
</p>

<p align="center">
  <b>Infrastructure & Cloud Services</b>
</p>

<p align="center">
  <a href="/">
    <img alt="Docker" src="https://www.vectorlogo.zone/logos/docker/docker-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="RabbitMQ" src="https://www.vectorlogo.zone/logos/rabbitmq/rabbitmq-icon.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="AWS S3" src="https://cdn.worldvectorlogo.com/logos/amazon-s3-simple-storage-service.svg" height=50 width=50 style="margin: 0 8px;"/>
  </a>
  <a href="/">
    <img alt="Cloudfront" src="https://images.seeklogo.com/logo-png/43/1/aws-cloudfront-logo-png_seeklogo-430937.png" height=50 width=50 style="margin: 0 8px;"/>
  </a>
</p>

<br>

A comprehensive full-stack e-learning platform designed to empower users to create, manage, and participate in online courses. Learning Platform provides a seamless experience for instructors to develop educational content and for learners to engage in interactive learning communities.

---

## 📋 Project Overview

**Learning Platform** is a modern, scalable web application that bridges the gap between educators and learners. The platform enables instructors to create rich, multimedia-enhanced courses, manage student progress, and facilitate discussions. Learners can enroll in courses, track their learning journey, and engage with peers through integrated social features and real-time communication.

**Project Start**: January 2025  
**Video demo**: https://www.youtube.com/watch?v=N56jemgKceE  
**Office website**: updating...

---

## 🧬 System Architecture

The platform follows a **Microservices Architecture** pattern with the following key components:

### Architecture Overview

![System Architecture Diagram](./artifact/forreadme/system-architecture.png)

### Architecture Components

#### **1. Client Layer (Frontend)**
- **React Web Application** - Main user interface built with React, TypeScript, and Vite
- **Real-time Communication** - Socket.IO connection for live notifications and chat

#### **2. API Gateway (Entry Point)**
- **Spring Cloud Gateway** - Central entry point for all client requests
- **Request Routing** - Intelligently routes requests to appropriate microservices
- **Authentication** - JWT token validation and OAuth2 integration
- **Load Balancing** - Distributes traffic across services
- **CORS & Security** - Cross-origin request handling and security policies

#### **3. Core Microservices**

##### **User Service (Spring Boot)**
- User registration and authentication
- Profile management and role assignment
- User verification (email OTP)
- OAuth2 provider integration (Google)

##### **Course Service (Spring Boot)**
- Course creation and management
- Lesson organization and tracking
- Course enrollment and progress monitoring
- Course metadata and analytics

##### **Sale Service (Node.js + Prisma)**
- Shopping cart management
- Order processing and payment handling
- Discount and coupon application
- Invoice and transaction history
- Refund and compensation logic (Saga)

##### **Notification Service (Node.js)**
- Real-time notification delivery via Socket.IO
- Message queue processing
- Email and push notification sending
- Notification history tracking

#### **4. Communication Layer**
- **gRPC** - High-performance inter-service communication for synchronous calls
- **HTTP/REST** - Traditional RESTful API communication
- **Socket.IO** - WebSocket-based real-time communication for live updates
- **Message Queue** - Asynchronous event processing (RabbitMQ/Kafka compatible)

#### **5. Data Layer**

##### **MySQL Database**
- **Users Table** - User accounts, credentials, roles, profiles
- **Courses Table** - Course information, pricing, metadata
- **Enrollments Table** - User-course relationships and progress
- **Orders Table** - Order history, payment status, tracking
- **Lessons Table** - Course content, video links, materials

##### **MongoDB Database**
- **Conversations** - User-to-user and group chat messages
- **AI Conversations** - AI chatbot interaction history
- **Messages** - Message content, attachments, metadata
- **Blogs** - Instructor blog posts and articles
- **Feedbacks** - Course reviews, ratings, and comments

#### **6. External Services**
- **Cloudinary** - Image and media storage/optimization
- **Email Service** - SMTP for transactional emails
- **Payment Gateway** - Credit card and digital payment processing
- **OAuth2 Providers** - Google authentication integration

#### **7. Infrastructure**
- **Docker & Docker Compose** - Containerization and service orchestration
- **Redis** - Caching layer for performance optimization
- **Load Balancer** - Nginx or HAProxy for traffic distribution

---

## 🔄 Saga Pattern for Distributed Transactions

The platform implements the **Saga Pattern** to handle distributed transactions across microservices, ensuring data consistency without traditional ACID transactions.

### Saga Pattern Explanation

![Saga Pattern Flow Diagram](./artifact/forreadme/saga-pattern.png)

### What is a Saga?

A **Saga** is a distributed transaction consisting of multiple local transactions. Each microservice performs its operation and publishes an event, which triggers the next service in the sequence. If any step fails, compensating transactions are triggered to maintain consistency.

### Types of Sagas

#### **1. Orchestration-based Saga (Centralized)**
- A central orchestrator (usually in the API Gateway or a dedicated saga service) manages the flow
- Each service responds directly to the orchestrator
- The orchestrator decides the next step and issues commands to services
- Better for complex workflows with many conditional branches

#### **2. Choreography-based Saga (Decentralized)**
- Services listen to events published by other services
- Each service reacts to events independently
- More loosely coupled but harder to track overall flow
- Better for simple, linear workflows

### Saga Flow in Learning Platform

**Example: Course Purchase Order Saga**

#### **Step 1: Order Creation**
- User initiates course purchase
- Sale Service creates an order with status `PENDING`
- Publishes `OrderCreated` event

#### **Step 2: Course Reservation**
- Course Service receives `OrderCreated` event
- Checks course availability and inventory
- Reserves the course slot for the user
- Publishes `CourseReserved` event
- If unavailable → publishes `CourseReservationFailed` → Saga rolls back

#### **Step 3: Payment Processing**
- Sale Service receives `CourseReserved` event
- Processes payment through payment gateway
- Updates order status to `PAYMENT_PENDING`
- Publishes `PaymentProcessed` event
- If payment fails → publishes `PaymentFailed` → Compensations triggered

#### **Step 4: Enrollment**
- Course Service receives `PaymentProcessed` event
- Creates enrollment record in database
- Updates student progress tracking
- Publishes `StudentEnrolled` event

#### **Step 5: Notifications**
- Notification Service receives `StudentEnrolled` event
- Sends welcome email to student
- Sends notification to instructor about new enrollment
- Publishes `NotificationSent` event

#### **Step 6: Final Confirmation**
- Sale Service receives `NotificationSent` event
- Updates order status to `COMPLETED`
- Archives order and generates invoice
- Transaction complete

### Compensation Strategy (Rollback)

If any step fails, compensation transactions are executed in reverse order:

| Order | Step | Action | Compensation |
|-------|------|--------|--------------|
| 1 | Create Order | Create with status PENDING | Delete order |
| 2 | Reserve Course | Decrement available slots | Increment available slots |
| 3 | Process Payment | Charge customer | Refund to customer |
| 4 | Enroll Student | Create enrollment record | Delete enrollment record |
| 5 | Send Notification | Send emails/alerts | Log failure notification |

### Example Failure Scenario

```
1. Order Created ✅
2. Course Reserved ✅
3. Payment Processing ✅
4. Enrollment ❌ (Database error)
   → Compensation: Delete enrollment record
5. Refund ✅ (Compensation)
6. Release Course Slot ✅ (Compensation)
7. Cancel Order ✅ (Compensation)
```

### Benefits of Saga Pattern

✅ **Maintains Consistency** - Across multiple services without distributed locks  
✅ **Flexible Transactions** - Handles long-running, multi-step processes  
✅ **Service Independence** - Loosely coupled services can evolve independently  
✅ **Failure Recovery** - Automatic compensation and rollback mechanisms  
✅ **Scalability** - Works well in distributed, microservice architectures  

### Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Complex compensations | Design compensation logic carefully; use idempotency |
| Distributed tracing | Log all saga steps with correlation IDs |
| Timeout handling | Set reasonable timeouts; implement retry mechanisms |
| Order dependency | Use event ordering; ensure idempotent operations |

---

## ✨ Key Features

### 📚 Course Management
- Create, edit, and publish rich multimedia courses
- Organize lessons with video content and attachments
- Track course progress and student enrollment
- Manage course pricing and discounts

### 👥 User Management
- Secure registration and authentication (Email + OAuth2)
- Dual-role system: Instructor and Learner
- User profiles with avatars and personal information
- Account management and verification

### 💬 Social & Communication
- Real-time chat and messaging system
- Discussion forums per course
- Post comments and feedback
- Notifications for course updates and messages
- Live notification bell with unread counter

### 🛒 Shopping & Orders
- Shopping cart system
- Secure payment processing
- Order history and invoice management
- Discount code application
- Sales analytics

### 📊 Analytics & Feedback
- Course analytics and performance metrics
- Student feedback and reviews
- Progress tracking
- Certification upon completion

### ⚡ Real-Time Features
- Live notifications using Socket.IO
- Real-time chat messaging
- Instant updates on course activities
- Online status indicators

### 🔐 Security & Authorization
- JWT-based authentication
- OAuth2 Google integration
- Role-based access control (RBAC)
- Secure password hashing
- Email verification system

---



## 📂 Project Structure

```
Learning-Platform/
├── rest-api/                          # Backend Services
│   ├── api-gateway/                   # Express.js API Gateway
│   │   └── src/main/...
│   ├── user-service/                  # User Management Service (Spring Boot)
│   │   └── src/...
│   ├── course-service/                # Course Management Service (Spring Boot)
│   │   └── src/...
│   ├── sale-service/                  # E-Commerce Service (Node.js + Prisma)
│   │   ├── src/...
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   ├── notification-service/          # Real-time Notifications (Node.js)
│   │   └── src/...
│   └── proto-shared/                  # gRPC Protobuf Definitions
│       └── src/main/proto/
│
├── web/                               # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/                # React Components
│   │   │   ├── Auth/
│   │   │   ├── Course/
│   │   │   ├── Chat/
│   │   │   ├── Profile/
│   │   │   └── ...
│   │   ├── pages/                     # Page Components
│   │   ├── services/                  # API Service Clients
│   │   ├── stores/                    # Redux Store
│   │   ├── hooks/                     # Custom React Hooks
│   │   ├── utils/                     # Utility Functions
│   │   └── types/                     # TypeScript Type Definitions
│   └── package.json
│
├── socket-server/                     # Socket.IO Server (Optional)
│   └── src/...
│
├── docker-compose.yml                 # Docker Compose Configuration
├── Makefile                           # Build Automation
├── package.json                       # Root Package Configuration
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn** (recommend yarn 4.11.0+)
- **Docker** & **Docker Compose** (optional, for containerized setup)
- **Java** 11+ (for Spring Boot services)
- **MySQL** 8.0+ 
- **MongoDB** (optional, for document storage)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Learning-Platform.git
cd Learning-Platform
```

#### 2. Set Up Environment Variables

Create `.env` files for each service:

**For API Gateway** (`rest-api/api-gateway/.env`):
```env
PORT=3001
JWT_SECRET=your_jwt_secret_key
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=learning_platform
```

**For Sale Service** (`rest-api/sale-service/.env`):
```env
DATABASE_URL=mysql://user:password@localhost:3306/sale_service
JWT_SECRET=your_jwt_secret_key
```

**For Web Frontend** (`web/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:8080
```

#### 3. Install Dependencies

```bash
# Install root dependencies
yarn install

# Install backend dependencies
cd rest-api
mvn clean install         # For Java services
cd ../api-gateway
yarn install             # For Node.js services

# Install frontend dependencies
cd ../../web
yarn install
```

#### 4. Database Setup

```bash
# Create MySQL databases
mysql -u root -p < init.sql

# Run Prisma migrations for sale-service
cd rest-api/sale-service
npx prisma migrate dev
```

---

## 🎯 Running the Application

### Option 1: Local Development (Without Docker)

#### Terminal 1: Start API Gateway
```bash
cd rest-api/api-gateway
yarn dev
# Runs on http://localhost:3001
```

#### Terminal 2: Start Notification Service
```bash
cd rest-api/notification-service
yarn dev
# Runs on http://localhost:3002
```

#### Terminal 3: Start Frontend
```bash
cd web
yarn dev
# Runs on http://localhost:5173
```

#### Terminal 4: Start Java Services (Optional)
```bash
# User Service
cd rest-api/user-service
mvn spring-boot:run

# Course Service
cd rest-api/course-service
mvn spring-boot:run
```

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 📊 Use Cases

### For Instructors
- **UC1**: Create and publish online courses
- **UC2**: Manage course content and lessons
- **UC3**: Monitor student progress and engagement
- **UC4**: Respond to student inquiries and feedback
- **UC5**: View course analytics and performance metrics

### For Learners
- **UC6**: Browse and search courses
- **UC7**: Enroll in courses
- **UC8**: View course content and complete lessons
- **UC9**: Participate in discussions and forums
- **UC10**: Track personal learning progress
- **UC11**: Purchase courses and manage orders
- **UC12**: Leave reviews and feedback
- **UC13**: Communicate with instructors and peers in real-time

### For Administrators
- **UC14**: Manage user accounts and roles
- **UC15**: Monitor platform activity
- **UC16**: Review course content compliance
- **UC17**: Generate platform analytics reports

### Use Case Diagram

![Use Case Diagram](./artifact/forreadme/usecase.png)

---

## 📧 Support & Contact

For questions or issues:
- 📧 Email: phama9162@gmail.com

---

## 📚 Additional Resources

- [Document](https://drive.google.com/drive/folders/172pZVeM3PwyoySuJ4OXigCTXL5qPJeBq)

---

**Made with ❤️ by the Learnova Team**
