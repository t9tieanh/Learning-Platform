-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: course_service
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `course_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `course_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `course_service`;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('1','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Learn how to build modern websites','Web Development'),('10','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','CI/CD pipelines and automation','DevOps'),('11','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Design beautiful and usable interfaces','UI/UX Design'),('12','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Work with large-scale data systems','Big Data'),('13','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Internet of Things applications','IoT'),('14','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Augmented and Virtual Reality','AR/VR'),('15','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Agile, Scrum, Kanban','Project Management'),('16','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','SEO, SEM, Social Media Ads','Digital Marketing'),('17','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','SQL, NoSQL, and optimization','Database Systems'),('18','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Linux, Windows, and system internals','Operating Systems'),('19','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Networking basics and protocols','Computer Networks'),('2','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Build Android and iOS applications','Mobile Apps'),('20','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Learn programming from scratch','Programming Basics'),('3','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Data analysis and machine learning','Data Science'),('4','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','AI concepts and deep learning','Artificial Intelligence'),('5','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','AWS, Azure, GCP fundamentals','Cloud Computing'),('6','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Protect systems and networks','Cyber Security'),('7','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Principles of software development','Software Engineering'),('8','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Learn to create 2D/3D games','Game Development'),('9','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','Cryptocurrency and blockchain basics','Blockchain');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_open` bit(1) DEFAULT NULL,
  `position` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `course_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK6h1m0nrtdwj37570c0sp2tdcs` (`course_id`),
  CONSTRAINT `FK6h1m0nrtdwj37570c0sp2tdcs` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES ('06d8a182-5c38-49a8-9676-1b95e89cde03','2025-12-10 23:33:08.400849',_binary '\0','2025-12-10 23:34:28.901468','',_binary '\0',3,'Học tập hiệu quả trên Learnova','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('0c28786c-60f1-4498-acff-4968b8956d70','2025-12-24 10:10:37.457924',_binary '\0','2025-12-24 10:20:21.940513','',_binary '\0',4,'Workflow Git thực tế & best practices','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('0e4282f9-36fe-41b1-ab03-2319aa86be13','2025-10-25 19:32:26.825592',_binary '\0','2025-10-25 19:32:26.825592',NULL,_binary '\0',1,'Phần mới','d59648c2-6436-4994-8e9e-ab66f34b607d'),('183cdd58-4fbe-417f-9bac-c957d03cf5e1','2025-10-31 16:12:09.292140',_binary '\0','2025-10-31 16:12:09.292140',NULL,_binary '\0',3,'Phần mới','cd753132-e625-45ac-9504-354d260f5a8d'),('1a1e5bf9-b520-433c-a360-2ae751bf873a','2025-10-18 09:48:15.007132',NULL,'2025-10-18 09:48:15.007132',NULL,_binary '\0',4,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('2b5bda1b-118a-4deb-9057-247e2dde90c0','2025-10-24 13:52:49.976542',_binary '\0','2025-10-24 13:52:49.976542',NULL,_binary '\0',7,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('2ccc4895-7949-478e-b89b-f6e8381b3d94','2025-10-19 13:06:47.301488',_binary '\0','2025-10-19 13:06:47.301488',NULL,_binary '\0',4,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8','2025-10-26 11:29:59.759478',_binary '\0','2025-11-08 18:08:34.089038','Làm quen với docker ',_binary '\0',1,'Làm quen với Docker','c62c894b-76a9-48a4-8713-3f74f93a3746'),('36a61432-a7c0-4ee5-9e9f-c056a721587f','2025-10-26 11:30:00.604944',_binary '\0','2025-11-08 18:09:00.222671','Tìm hiểu về Docker file',_binary '\0',2,'Tìm hiểu khái niệm về Docker file','c62c894b-76a9-48a4-8713-3f74f93a3746'),('39cd7c9f-bf01-4322-91ce-c54061e2a843','2025-10-17 17:58:03.863258',_binary '','2025-10-18 10:03:07.016235',NULL,_binary '\0',1,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('3c37b6be-9ee0-44a3-b65d-654fbf5fb1c9','2025-10-25 14:49:37.377587',_binary '\0','2025-10-25 14:49:37.377587',NULL,_binary '\0',2,'Phần mới','cd753132-e625-45ac-9504-354d260f5a8d'),('3c39fe61-b21b-4af3-81a5-6f4d1b341b3d','2025-12-16 23:26:12.962549',_binary '\0','2025-12-23 10:15:25.043303','',_binary '\0',3,'Làm quen với nhánh, PR ','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('41a0b33c-a1fb-407c-85b3-fcb02615f4d4','2025-10-17 17:58:21.545684',_binary '\0','2025-10-18 09:53:52.955101',NULL,_binary '\0',1,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('46f38269-7092-40ee-9c49-fee9303ac774','2025-11-08 17:30:23.691932',_binary '\0','2025-11-08 17:32:17.718649','hello',_binary '\0',1,'Giới thiệu','a6b534e1-6984-4846-b214-d3fe6779aa07'),('4c457a28-678b-44aa-a052-e554bddfdaf9','2025-12-11 18:08:43.819038',_binary '\0','2025-12-23 10:15:10.847851','',_binary '\0',2,'Setup Github creadential, các lệnh cơ bản','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('51616392-29b3-4cd0-b256-56f64284ffae','2025-11-08 19:11:00.167990',_binary '\0','2025-11-08 19:11:33.521129','Cùng nhau tìm hiểu network trong Docker. Hiểu thêm về docker compose, ...',_binary '\0',3,'Network trong Docker ','c62c894b-76a9-48a4-8713-3f74f93a3746'),('54024212-8420-40d8-aae7-c02d1d915235','2025-10-18 09:48:06.469046',NULL,'2025-10-18 09:48:06.469046',NULL,_binary '\0',5,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('545a0111-df09-441e-8d79-ed13ac48d854','2025-10-18 09:48:11.298252',NULL,'2025-10-18 09:48:11.298252',NULL,_binary '\0',6,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('6757507a-e20a-420d-bac3-9e8d104b20d8','2025-12-01 18:47:17.600178',_binary '\0','2025-12-26 02:45:22.910536','',_binary '\0',1,'Chào mừng bạn đến với Learnova','d0639f52-9112-41af-8514-565ea8acdae1'),('6bff3314-952a-46f0-9bcf-3215750a7839','2025-11-08 17:31:22.536944',_binary '\0','2025-11-29 15:10:22.749927','',_binary '\0',2,'Bắt đầu coding nào','a6b534e1-6984-4846-b214-d3fe6779aa07'),('6d5b123c-dbc9-4da0-9dac-5b1a2ea4193b','2025-10-18 21:09:33.650016',_binary '\0','2025-10-18 21:14:04.124277','Quá buồn',_binary '\0',3,'Phần này là phần 2','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('70e15a00-11aa-4089-b312-9c733ea0b1ea','2025-12-10 23:32:58.430104',_binary '\0','2025-12-10 23:34:19.013483','',_binary '\0',2,'Bắt đầu khóa học','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('71d27ce4-2908-4397-a9c0-f194405df880','2025-12-11 18:08:41.057560',_binary '\0','2025-12-23 10:14:43.249737','',_binary '\0',1,'Vì sao lại dùng Git','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('758b0ace-6169-4d75-b1ef-f9a25b24e313','2025-10-18 09:48:07.516925',NULL,'2025-10-18 09:48:07.516925',NULL,_binary '\0',6,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('79b79e4e-938d-40d1-a079-56411274c316','2025-12-08 23:36:33.647201',_binary '','2025-12-26 02:29:47.971494',NULL,_binary '\0',4,'Phần mới','d0639f52-9112-41af-8514-565ea8acdae1'),('80938ea3-1e9c-4438-96a2-328f21c78e8c','2025-12-11 19:07:23.584313',_binary '\0','2025-12-11 19:07:23.584313',NULL,_binary '\0',2,'Phần mới','ebb3b003-ba00-451c-add0-fb9540ae68c9'),('8407b6f7-9184-40a4-86d0-7ba64df50e81','2025-12-10 23:32:48.394333',_binary '\0','2025-12-10 23:33:48.387632','',_binary '\0',1,'Giới thiệu Learnova','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('955697bf-ad3c-4bce-94dd-95e1ddbf940b','2025-10-25 00:35:49.964412',_binary '\0','2025-10-25 00:35:49.964412',NULL,_binary '\0',1,'Phần mới','cd753132-e625-45ac-9504-354d260f5a8d'),('95d1b769-1813-4c29-940b-48c3bcbcf3a1','2025-10-25 19:47:18.700908',_binary '\0','2025-10-25 19:47:18.700908',NULL,_binary '\0',2,'Phần mới','d59648c2-6436-4994-8e9e-ab66f34b607d'),('9ffd95b2-7308-4e7a-b5d7-b2e076430187','2025-10-17 23:48:35.399525',NULL,'2025-10-17 23:48:35.399525',NULL,_binary '\0',4,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('a0de103a-1278-421b-affa-8024c0802b83','2025-12-26 02:45:20.826364',_binary '\0','2025-12-26 02:45:45.392620','',_binary '\0',2,'Làm quen Terminal & Command Line','d0639f52-9112-41af-8514-565ea8acdae1'),('a118d72f-6310-4715-a9bd-337d0006e020','2025-10-19 13:19:47.268396',_binary '\0','2025-10-19 13:20:35.275555','Quá buồn cho một cuộc tình\n',_binary '\0',5,'Tiêu đề của những người già','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('ad939e65-b58e-4092-8674-3026ce502590','2025-10-18 09:48:05.826775',NULL,'2025-10-18 09:48:05.826775',NULL,_binary '\0',4,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('bb6ad511-12c7-4f4a-b128-e45f8dcfdcab','2025-11-05 22:34:36.741192',_binary '\0','2025-11-05 22:34:36.741192',NULL,_binary '\0',3,'Phần mới','d59648c2-6436-4994-8e9e-ab66f34b607d'),('c05552c8-e77e-4789-82e9-9f5f00837c33','2025-10-17 17:59:41.292006',_binary '','2025-10-18 10:02:49.270166',NULL,_binary '\0',1,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('c825fc96-041f-48c9-a7dc-886e2ed6b1ba','2025-10-18 09:48:11.130818',NULL,'2025-10-18 09:48:11.130818',NULL,_binary '\0',5,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('c833db62-390b-485b-9194-b988dd716f34','2025-10-18 09:55:35.841396',NULL,'2025-10-18 09:55:35.841396',NULL,_binary '\0',2,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('d689238f-b756-49bf-a574-2ae319afa8b0','2025-10-18 10:03:46.238877',_binary '\0','2025-10-18 10:03:46.238877',NULL,_binary '\0',2,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('d6c34878-aa58-4e2c-9aa5-de174250ef8d','2025-10-18 09:48:10.935805',NULL,'2025-10-18 09:48:10.935805',NULL,_binary '\0',4,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('df870152-0db0-4331-8195-dfe03b84b65b','2025-12-10 23:33:20.530864',_binary '\0','2025-12-10 23:34:40.225278','',_binary '\0',4,'Hỏi đáp & hỗ trợ','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('ecfaae7a-af46-4efb-90d5-1e4fbbc40ac1','2025-10-24 13:53:25.317967',_binary '\0','2025-10-24 13:53:25.317967',NULL,_binary '\0',8,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('eec72bf4-67b4-4455-afd8-81edd1f731cb','2025-10-23 21:55:33.817635',_binary '\0','2025-10-23 21:55:33.817635',NULL,_binary '\0',6,'Phần mới','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('ef062bc3-e682-4672-872d-d5bb159757ac','2025-11-29 18:15:51.731755',_binary '','2025-12-06 14:47:30.128764',NULL,_binary '\0',6,'Phần mới','c62c894b-76a9-48a4-8713-3f74f93a3746'),('f11729dc-db9e-4859-ab05-3204c20a33f8','2025-11-29 18:19:35.776686',_binary '','2025-12-06 14:47:32.777087',NULL,_binary '\0',7,'Phần mới','c62c894b-76a9-48a4-8713-3f74f93a3746'),('ff43c967-3533-48d7-a2f6-5f51d1088fa9','2025-12-11 19:07:22.807679',_binary '\0','2025-12-11 19:07:22.807679',NULL,_binary '\0',1,'Phần mới','ebb3b003-ba00-451c-add0-fb9540ae68c9');
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_likes`
--

DROP TABLE IF EXISTS `comment_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_likes` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `comment_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_likes`
--

LOCK TABLES `comment_likes` WRITE;
/*!40000 ALTER TABLE `comment_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `lesson_id` varchar(255) DEFAULT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES ('32bcb3ec-5817-4641-a7ba-854598fa3a3b','2025-12-24 21:36:44.548265',_binary '\0','2025-12-24 21:36:44.548265','hello ','604f2b5a-a315-469b-9dc9-a809713c2e8b',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('3d069f9d-1ad1-41cf-b466-33f66e226826','2025-12-16 22:30:34.908931',_binary '\0','2025-12-16 22:30:34.908931','tôi cũng vậy','666ee1cf-1965-4197-acf3-e02171a782d6','6d88b691-58ee-40d9-88de-729ac2d96902','17665735-5597-4583-9e47-121b494bf41f'),('3dd0b2cf-ffda-4d91-96ac-f64592c84253','2025-12-24 17:24:57.842129',_binary '\0','2025-12-24 17:24:57.842129','hello\n','undefined',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('4f623c0e-78e5-4287-b31d-eecbf4799958','2025-12-24 21:36:52.839617',_binary '\0','2025-12-24 21:36:52.839617','tôi thắc mắc phần này ','604f2b5a-a315-469b-9dc9-a809713c2e8b','32bcb3ec-5817-4641-a7ba-854598fa3a3b','6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('5f6c0a7c-8a9d-4e02-a729-ed51b2538776','2025-12-11 01:12:58.900173',_binary '\0','2025-12-11 01:12:58.900173','Xin chào, tôi là người học bài học này đầu tiên','6f07c4f3-536f-4839-8e03-e0ac742b5df0',NULL,'5c6fceef-7fe8-47cf-91d7-6a500362c83c'),('6d88b691-58ee-40d9-88de-729ac2d96902','2025-12-16 22:30:28.135675',_binary '\0','2025-12-16 22:30:28.135675','hello tôi không hiểu\n','666ee1cf-1965-4197-acf3-e02171a782d6',NULL,'17665735-5597-4583-9e47-121b494bf41f'),('91750ab9-b3c6-4879-ac3a-3aa4c71f72df','2025-12-11 19:05:49.518707',_binary '\0','2025-12-11 19:05:49.518707','oki ','d3f4242c-a412-42f9-94fb-f3e8b08d2663','f4001afb-15e7-4128-b381-3c8c86c2496b','6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('96286149-46fa-49a1-883a-ee2d15b89ba7','2025-12-09 21:46:19.865423',_binary '\0','2025-12-09 21:46:19.865423','hello','0315b464-35d9-4ccd-85f8-2246671d8229',NULL,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092'),('a108a684-d0e5-4a96-a0b7-a3c9a9f07d59','2025-12-11 00:23:46.446088',_binary '\0','2025-12-11 00:23:46.446088','test','a302c2e9-95bf-4a53-a8dc-ccdad33a10cb','d113df46-a924-4955-ac09-6330b9157d9e','6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('a8eb7210-15fa-4085-a9d8-20401c557bce','2025-12-09 21:45:58.673838',_binary '\0','2025-12-09 21:45:58.673838','trả lời cho giảng viên nè ','undefined','fa6258b7-8fbd-485b-b52a-867209225944','1387188c-e7b6-49c0-b1fe-8dfb5f3e3092'),('d113df46-a924-4955-ac09-6330b9157d9e','2025-12-11 00:23:38.661908',_binary '\0','2025-12-11 00:23:38.661908','Hello, cho tôi hỏi về bài học này với !','a302c2e9-95bf-4a53-a8dc-ccdad33a10cb',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('ed89d967-46d4-4804-bb06-9fe49856cadf','2025-11-29 12:59:08.245135',_binary '\0','2025-11-29 12:59:08.245135','Bài học cũng hay','0217f08f-618d-4847-b037-101b7c8fffc8',NULL,'2df2ef54-9555-4495-be80-a506910fd5f3'),('f4001afb-15e7-4128-b381-3c8c86c2496b','2025-12-11 19:05:40.403112',_binary '\0','2025-12-11 19:05:40.403112','Hello, khóa học này là gì\n','d3f4242c-a412-42f9-94fb-f3e8b08d2663',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd'),('fa6258b7-8fbd-485b-b52a-867209225944','2025-12-09 21:45:45.574447',_binary '\0','2025-12-09 21:45:45.574447','alo','undefined',NULL,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_outcomes`
--

DROP TABLE IF EXISTS `course_outcomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_outcomes` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `course_id` varchar(255) NOT NULL,
  `outcome` varchar(255) DEFAULT NULL,
  KEY `FKq8u25isnaaswsfiv0yt8sl6p4` (`course_id`),
  CONSTRAINT `FKq8u25isnaaswsfiv0yt8sl6p4` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_outcomes`
--

LOCK TABLES `course_outcomes` WRITE;
/*!40000 ALTER TABLE `course_outcomes` DISABLE KEYS */;
INSERT INTO `course_outcomes` VALUES ('co-1','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Học được những kĩ năng mềm'),('co-2','cd753132-e625-45ac-9504-354d260f5a8d','Học ăn học nói, học gói học mở'),('co-3','cd753132-e625-45ac-9504-354d260f5a8d','Học được nhiều thứ lắm'),('co-4','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Thành thạo sử dụng Java'),('co-5','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Trở thành một developer chuyên nghiệp'),('co-6','c62c894b-76a9-48a4-8713-3f74f93a3746','HIểu về network'),('co-7','c62c894b-76a9-48a4-8713-3f74f93a3746','Kĩ năng Devopps cơ bản'),('co-8','c62c894b-76a9-48a4-8713-3f74f93a3746','Thành thạo Docker'),('co-9','c62c894b-76a9-48a4-8713-3f74f93a3746','Kĩ năng coding cơ bản'),('co-10','f4018410-e6eb-4687-bb94-61ceb1ed4493','Tối ưu hành trình học tập cá nhân để đạt kết quả tốt nhất'),('co-11','f4018410-e6eb-4687-bb94-61ceb1ed4493','Biết cách đăng ký, truy cập và theo dõi tiến độ khóa học'),('co-12','f4018410-e6eb-4687-bb94-61ceb1ed4493','Hiểu và sử dụng thành thạo giao diện Learnova'),('co-13','f4018410-e6eb-4687-bb94-61ceb1ed4493','Thực hiện bài học, quiz và bài kiểm tra một cách hiệu quả'),('co-14','f4018410-e6eb-4687-bb94-61ceb1ed4493','Sử dụng các công cụ học tập như ghi chú, bookmark và lịch học thông minh'),('co-15','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Sử dụng branch, commit, merge và xử lý xung đột trong dự án thực tế.'),('co-16','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Nắm được quy trình làm việc nhóm chuẩn GitHub Flow.'),('co-17','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Làm việc với GitHub: tạo repo, push code, pull request và review code.'),('co-18','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Hiểu rõ cách Git hoạt động và quản lý phiên bản mã nguồn.'),('co-19','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Lưu ý'),('co-20','d0639f52-9112-41af-8514-565ea8acdae1','Hiểu rõ nền tảng Linux và cách hệ điều hành Linux vận hành ở cấp độ hệ thống'),('co-21','d0639f52-9112-41af-8514-565ea8acdae1','Sử dụng thành thạo terminal & command line trong môi trường Linux'),('co-22','d0639f52-9112-41af-8514-565ea8acdae1','Quản lý file system, user, permission và process một cách chuẩn system engineer'),('co-23','d0639f52-9112-41af-8514-565ea8acdae1','Cấu hình và vận hành Linux server trong các tình huống thực tế');
/*!40000 ALTER TABLE `course_outcomes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_requirements`
--

DROP TABLE IF EXISTS `course_requirements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_requirements` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `course_id` varchar(255) NOT NULL,
  `requirement` varchar(255) DEFAULT NULL,
  KEY `FKbh8ta744mcx845fv5oa5dtyyi` (`course_id`),
  CONSTRAINT `FKbh8ta744mcx845fv5oa5dtyyi` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_requirements`
--

LOCK TABLES `course_requirements` WRITE;
/*!40000 ALTER TABLE `course_requirements` DISABLE KEYS */;
INSERT INTO `course_requirements` VALUES ('cr-1','d59648c2-6436-4994-8e9e-ab66f34b607d','dsfa'),('cr-2','d59648c2-6436-4994-8e9e-ab66f34b607d','Phải biết dùng photoshop cơ bản'),('cr-3','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Đam mê với lập trình'),('cr-4','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Java Core cơ bản'),('cr-5','fc716289-dd27-4d2b-8e1d-dc4af98307ce','Biết một ít kiến thức về lập trình'),('cr-6','d59648c2-6436-4994-8e9e-ab66f34b607d','sdfasdf'),('cr-7','c62c894b-76a9-48a4-8713-3f74f93a3746','SSH, Máy ảo'),('cr-8','c62c894b-76a9-48a4-8713-3f74f93a3746','Kiến thức về mạng'),('cr-9','c62c894b-76a9-48a4-8713-3f74f93a3746','Docker cơ bản là một lợi thế'),('cr-10','f4018410-e6eb-4687-bb94-61ceb1ed4493','Chỉ cần biết sử dụng máy tính hoặc điện thoại cơ bản'),('cr-11','f4018410-e6eb-4687-bb94-61ceb1ed4493','Kết nối Internet ổn định'),('cr-12','f4018410-e6eb-4687-bb94-61ceb1ed4493','Tinh thần học hỏi và sẵn sàng khám phá'),('cr-13','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Có kiến thức lập trình căn bản (bất kỳ ngôn ngữ nào).'),('cr-14','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','Biết sử dụng máy tính cơ bản.'),('cr-15','d0639f52-9112-41af-8514-565ea8acdae1','Có tinh thần tự học và thực hành theo bài giảng'),('cr-16','d0639f52-9112-41af-8514-565ea8acdae1','Có máy tính cá nhân (Windows, macOS hoặc Linux)'),('cr-17','d0639f52-9112-41af-8514-565ea8acdae1','Không yêu cầu kiến thức Linux trước đó'),('cr-18','d0639f52-9112-41af-8514-565ea8acdae1','Biết sử dụng máy tính ở mức cơ bản');
/*!40000 ALTER TABLE `course_requirements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_tag`
--

DROP TABLE IF EXISTS `course_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_tag` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `course_id` varchar(255) NOT NULL,
  `tag_id` varchar(255) NOT NULL,
  KEY `FK4xljwd6thh893y5t81btpen5q` (`tag_id`),
  KEY `FK7om0f3y4q6v90v5mv8femot2g` (`course_id`),
  CONSTRAINT `FK4xljwd6thh893y5t81btpen5q` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`),
  CONSTRAINT `FK7om0f3y4q6v90v5mv8femot2g` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_tag`
--

LOCK TABLES `course_tag` WRITE;
/*!40000 ALTER TABLE `course_tag` DISABLE KEYS */;
INSERT INTO `course_tag` VALUES ('ct-1','fc716289-dd27-4d2b-8e1d-dc4af98307ce','11'),('ct-2','fc716289-dd27-4d2b-8e1d-dc4af98307ce','13'),('ct-3','fc716289-dd27-4d2b-8e1d-dc4af98307ce','16'),('ct-4','fc716289-dd27-4d2b-8e1d-dc4af98307ce','17'),('ct-5','fc716289-dd27-4d2b-8e1d-dc4af98307ce','20'),('ct-6','fc716289-dd27-4d2b-8e1d-dc4af98307ce','4'),('ct-7','a6b534e1-6984-4846-b214-d3fe6779aa07','11'),('ct-8','a6b534e1-6984-4846-b214-d3fe6779aa07','12'),('ct-9','a6b534e1-6984-4846-b214-d3fe6779aa07','16'),('ct-10','a6b534e1-6984-4846-b214-d3fe6779aa07','17'),('ct-11','a6b534e1-6984-4846-b214-d3fe6779aa07','4'),('ct-12','cd753132-e625-45ac-9504-354d260f5a8d','15'),('ct-13','cd753132-e625-45ac-9504-354d260f5a8d','2'),('ct-14','cd753132-e625-45ac-9504-354d260f5a8d','20'),('ct-15','cd753132-e625-45ac-9504-354d260f5a8d','3'),('ct-16','cd753132-e625-45ac-9504-354d260f5a8d','6'),('ct-17','cd753132-e625-45ac-9504-354d260f5a8d','7'),('ct-18','c62c894b-76a9-48a4-8713-3f74f93a3746','10'),('ct-19','c62c894b-76a9-48a4-8713-3f74f93a3746','11'),('ct-20','c62c894b-76a9-48a4-8713-3f74f93a3746','13'),('ct-21','c62c894b-76a9-48a4-8713-3f74f93a3746','17'),('ct-22','c62c894b-76a9-48a4-8713-3f74f93a3746','18'),('ct-23','c62c894b-76a9-48a4-8713-3f74f93a3746','8'),('ct-24','d59648c2-6436-4994-8e9e-ab66f34b607d','10'),('ct-25','d59648c2-6436-4994-8e9e-ab66f34b607d','11'),('ct-26','d59648c2-6436-4994-8e9e-ab66f34b607d','16'),('ct-27','d59648c2-6436-4994-8e9e-ab66f34b607d','17'),('ct-28','d59648c2-6436-4994-8e9e-ab66f34b607d','19'),('ct-29','d59648c2-6436-4994-8e9e-ab66f34b607d','20'),('ct-30','d59648c2-6436-4994-8e9e-ab66f34b607d','4'),('ct-31','d59648c2-6436-4994-8e9e-ab66f34b607d','5'),('ct-32','d59648c2-6436-4994-8e9e-ab66f34b607d','6'),('ct-33','f4018410-e6eb-4687-bb94-61ceb1ed4493','1'),('ct-34','f4018410-e6eb-4687-bb94-61ceb1ed4493','10'),('ct-35','f4018410-e6eb-4687-bb94-61ceb1ed4493','11'),('ct-36','f4018410-e6eb-4687-bb94-61ceb1ed4493','12'),('ct-37','f4018410-e6eb-4687-bb94-61ceb1ed4493','3'),('ct-38','f4018410-e6eb-4687-bb94-61ceb1ed4493','4'),('ct-39','f4018410-e6eb-4687-bb94-61ceb1ed4493','5'),('ct-40','f4018410-e6eb-4687-bb94-61ceb1ed4493','6'),('ct-41','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','10'),('ct-42','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','11'),('ct-43','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','12'),('ct-44','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','13'),('ct-45','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','17'),('ct-46','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','18'),('ct-47','d0639f52-9112-41af-8514-565ea8acdae1','12'),('ct-48','d0639f52-9112-41af-8514-565ea8acdae1','13'),('ct-49','d0639f52-9112-41af-8514-565ea8acdae1','17'),('ct-50','d0639f52-9112-41af-8514-565ea8acdae1','18'),('ct-51','d0639f52-9112-41af-8514-565ea8acdae1','4'),('ct-52','d0639f52-9112-41af-8514-565ea8acdae1','7'),('ct-53','d0639f52-9112-41af-8514-565ea8acdae1','8'),('ct-54','d0639f52-9112-41af-8514-565ea8acdae1','9');
/*!40000 ALTER TABLE `course_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `final_price` double DEFAULT NULL,
  `instructor_id` varchar(255) NOT NULL,
  `language` varchar(255) DEFAULT NULL,
  `long_description` text,
  `original_price` double DEFAULT NULL,
  `progress_step` enum('INTRO','CURRICULUM','PRICING','SETTINGS','COMPLETED') DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `status` enum('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED','ARCHIVED') DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `category_id` varchar(255) DEFAULT NULL,
  `introductory_video` varchar(255) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK72l5dj585nq7i6xxv1vj51lyn` (`category_id`),
  CONSTRAINT `FK72l5dj585nq7i6xxv1vj51lyn` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3','2025-12-11 18:04:35.444019',_binary '\0','2025-12-26 02:27:17.165011',300000,'6c22aa89-636a-41f9-91eb-4f920e45c4bd',NULL,'<h1>📘 <strong>Mô tả khóa học Git &amp; GitHub cho Người Mới Bắt Đầu</strong></h1><p>Khóa học này sẽ giúp em làm chủ Git – công cụ quản lý phiên bản mạnh mẽ nhất hiện nay – và GitHub, nền tảng lưu trữ mã nguồn lớn nhất thế giới 🌍.</p><p>Thông qua các bài học trực quan và thực hành thực tế 💻, em sẽ hiểu cách commit, tạo branch, xử lý xung đột, tạo pull request và làm việc nhóm như một lập trình viên chuyên nghiệp 🚀.</p><p>Dù em chưa biết gì về Git, khóa học này vẫn phù hợp 100% vì nội dung được xây dựng từ cơ bản đến nâng cao nhẹ, dễ hiểu và dễ áp dụng ngay vào dự án thực tế 🔧✨.</p>',1000000,'COMPLETED','Khóa học này giúp em hiểu và sử dụng thành thạo Git – công cụ quản lý phiên bản phổ biến nhất hiện nay','PUBLISHED','http://res.cloudinary.com/df3snzgv2/image/upload/v1765451219/itsfwi7yzaeh1meesfvc.jpg','Git & GitHub cho Người Mới Bắt Đầu ở đây','1','localhost:8888/api/v1/learning/storage/1766459628674-videoplayback.mp4',4,'Nội dung không ổn '),('9a2b92e3-1834-4589-a5d1-41de12705ee6','2025-12-16 23:14:07.946805',_binary '','2025-12-24 21:59:17.810603',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd',NULL,NULL,NULL,'INTRO','Đây là mô tả ngắn','DRAFT','http://res.cloudinary.com/df3snzgv2/image/upload/v1765901662/uzv3wjbyvtwns94lgjd6.jpg','Java Basics','1','localhost:8888/api/v1/learning/storage/1765901721636-hello_learnova.mp4',NULL,NULL),('a6b534e1-6984-4846-b214-d3fe6779aa07','2025-10-25 14:33:43.266828',_binary '\0','2025-11-23 20:19:21.979775',65000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'Hello',70000,'COMPLETED','Đây là mô tả ngắn','PUBLISHED','http://res.cloudinary.com/df3snzgv2/image/upload/v1762358559/pll5rlbxwq6ifbuzj7oz.jpg','UX UI Cùng Tiến Anh','10','localhost:8888/api/v1/learning/storage/1762598087978-122233-724743712_small.mp4',5,NULL),('c62c894b-76a9-48a4-8713-3f74f93a3746','2025-10-26 11:08:25.942940',_binary '\0','2025-12-26 02:16:09.860708',130000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'Khóa học Docker cơ bản cho người mới bắt đầu\nKhóa học giúp bạn nắm vững những khái niệm nền tảng của Docker — công cụ container hóa phổ biến nhất hiện nay. Bạn sẽ học cách cài đặt Docker, xây dựng và quản lý container, tạo image',140000,'COMPLETED','Cùng nhau học docker nào !','PUBLISHED','https://repository-images.githubusercontent.com/80358265/370bef00-981b-11eb-9eb2-0fb1bb5124b1','Docker cơ bản cho người mới bắt đầu','12','localhost:8888/api/v1/learning/storage/1766685971084-What_is_Docker_in_5_minutes.mp4',4.25,''),('cd753132-e625-45ac-9504-354d260f5a8d','2025-10-25 00:26:12.996210',_binary '\0','2025-11-29 13:54:54.882185',50000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'Hello',50000,'COMPLETED','Đây là mô tả ngắn','PUBLISHED','http://res.cloudinary.com/df3snzgv2/image/upload/v1762598176/wa9d3xnejxu9cd3kclsq.jpg','UX UI Cùng Tiến Anh','11','localhost:8888/api/v1/learning/storage/1761379824821-5730327-uhd_4096_2160_25fps.mp4',4,NULL),('d0639f52-9112-41af-8514-565ea8acdae1','2025-12-01 18:45:25.373019',_binary '\0','2025-12-26 02:48:55.041709',1000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'<p>🚀 <strong>Mastering Linux System Engineering with Mr. PhamTienAnh</strong></p><p>Khóa học này được thiết kế dành cho những ai muốn <strong>nắm vững Linux từ nền tảng đến thực chiến</strong>, đặc biệt phù hợp với sinh viên CNTT, DevOps/Backend Engineer, System Engineer hoặc người mới chuyển hướng sang hạ tầng hệ thống.</p><p>Bạn sẽ được hướng dẫn từng bước để:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Hiểu rõ <strong>cách Linux vận hành ở cấp độ hệ thống</strong></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Làm chủ <strong>terminal, file system, process, user &amp; permission</strong></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Cấu hình và quản trị <strong>server Linux trong môi trường thực tế</strong></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Tiếp cận tư duy <strong>system engineering</strong> thay vì chỉ học lệnh rời rạc</li></ol><p>📚 <strong>Nội dung chính bao gồm:</strong></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Kiến trúc Linux &amp; cách hệ điều hành hoạt động</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Quản lý user, group, permission, service</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Networking cơ bản trên Linux</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Monitoring, logging và xử lý sự cố</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Best practices khi vận hành hệ thống production</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Kinh nghiệm thực tế từ giảng viên trong môi trường doanh nghiệp</li></ol><p>🎯 <strong>Sau khóa học, bạn có thể:</strong></p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Tự tin làm việc với Linux server</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Hiểu và debug các vấn đề hệ thống thường gặp</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Có nền tảng vững chắc để học tiếp DevOps, Cloud, Kubernetes</li></ol><p>✨ Khóa học được xây dựng theo hướng <strong>dễ hiểu – thực hành nhiều – sát thực tế</strong>, giúp bạn học đúng trọng tâm và áp dụng ngay vào công việc.</p>',1000000,'COMPLETED','Khóa học free, cùng Learnova bắt đầu nào.','PENDING_REVIEW','https://i.ytimg.com/vi/sWbUDq4S6Y8/maxresdefault.jpg','Mastering Linux System Engineering with Mr. PhamTienAnh','10','localhost:8888/api/v1/learning/storage/1766691244371-linnux-introdution-video.mp4',NULL,'Nội dung chưa ổn, xem lại nhé'),('d59648c2-6436-4994-8e9e-ab66f34b607d','2025-10-25 19:25:17.204591',_binary '','2025-12-26 00:58:15.338936',55000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'dkafjslf',70000,'CURRICULUM','123','PENDING_REVIEW','http://res.cloudinary.com/df3snzgv2/image/upload/v1762598421/xsmr2jmpowxstlmtyr5o.jpg','Photoshop cùng TIến Anh','2','localhost:8888/api/v1/learning/storage/1762356808044-307864_small.mp4',1,NULL),('e77c84a7-d223-4db3-bb13-9fb83b7ab366','2025-12-14 23:24:16.881760',_binary '','2025-12-26 00:50:02.983820',NULL,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,NULL,NULL,'INTRO','dfdf','DRAFT',NULL,'hello','10','localhost:8888/api/v1/learning/storage/1765729464329-1761901944546-307864_small.mp4',NULL,NULL),('ebb3b003-ba00-451c-add0-fb9540ae68c9','2025-12-11 19:07:07.322828',_binary '','2025-12-24 21:51:51.272851',NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd',NULL,NULL,NULL,'INTRO','2123','DRAFT',NULL,'Khóa học mới ','10',NULL,NULL,NULL),('f4018410-e6eb-4687-bb94-61ceb1ed4493','2025-12-10 23:27:29.318231',_binary '\0','2025-12-24 21:44:21.578112',1000,'6c22aa89-636a-41f9-91eb-4f920e45c4bd',NULL,'<p>\"Chào mừng bạn đến với Learnova! 🎉</p><p> Nếu bạn còn bỡ ngỡ hoặc chưa biết bắt đầu từ đâu 🤔, khóa học này chính là tấm bản đồ dẫn đường 💡🗺️.</p><p> Từ cách điều hướng giao diện 💻✨, học bài hiệu quả 📘🧠 cho đến tối ưu tốc độ tiến bộ cá nhân 🚀📈 – tất cả đều cực kỳ đơn giản và trực quan.</p><p> Hãy bắt đầu hành trình nâng cấp bản thân ngay hôm nay! 💪🔥\"</p>',100000,'COMPLETED','Đây là khóa học hướng dẫn siêu dễ hiểu giúp bạn làm quen với giao diện, thao tác, công cụ học tập.','PUBLISHED','http://res.cloudinary.com/df3snzgv2/image/upload/v1766558239/sfv6wxf8pzi7p1ssll2c.jpg','Learnova 101: Bắt đầu hành trình học tập thông minh','1','localhost:8888/api/v1/learning/storage/1766554655146-introdution-course.mp4',4.8,'Bổ sung video introdution nhé\n'),('fc716289-dd27-4d2b-8e1d-dc4af98307ce','2025-10-17 17:57:49.969693',_binary '\0','2025-10-26 18:37:12.112695',56000,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092',NULL,'Quá buồn',60000,'COMPLETED','Chinh phục lập trình Java từ cơ bản đến nâng cao cùng hướng dẫn chi tiết và thực hành thực tế.','PUBLISHED','http://res.cloudinary.com/df3snzgv2/image/upload/v1761461569/ioh4tkgqhh2wbkbtrstg.jpg','Học JAVA cùng sư phụ Tiến Anh','12','localhost:8888/api/v1/learning/storage/1760881805988-1760633536295-istockphoto-2223899615-640_adpp_is.mp4',NULL,NULL);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `enrollment_date` datetime(6) DEFAULT NULL,
  `progress` double DEFAULT NULL,
  `status` enum('IN_PROGRESS','COMPLETED') DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `course_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg1muiskd02x66lpy6fqcj6b9q` (`user_id`,`course_id`),
  KEY `FKho8mcicp4196ebpltdn9wl6co` (`course_id`),
  CONSTRAINT `FKho8mcicp4196ebpltdn9wl6co` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES ('029dc08c-bf69-4df8-9e54-d1d78daddd45','2025-12-26 01:23:33.165661',_binary '\0','2025-12-26 09:13:24.535101',NULL,0.14285714285714285,NULL,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','c62c894b-76a9-48a4-8713-3f74f93a3746'),('0e68d81d-4a78-4436-9225-2f683b98c2eb','2025-12-16 21:56:20.860036',_binary '\0','2025-12-16 21:56:20.860036',NULL,0,NULL,'17c24a88-9abe-4142-aa8a-fdea4e32d51b','a6b534e1-6984-4846-b214-d3fe6779aa07'),('0f011e5c-2fe5-4de9-8986-209c303240dd','2025-11-29 12:33:14.757693',_binary '\0','2025-11-29 12:33:14.757693',NULL,0,NULL,'2df2ef54-9555-4495-be80-a506910fd5f3','cd753132-e625-45ac-9504-354d260f5a8d'),('1f2aca50-fb8a-4890-8d50-ef52b6277927','2025-12-11 00:27:20.537633',_binary '\0','2025-12-24 21:45:18.774463',NULL,0.375,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('23f92126-203f-41c8-9629-b77ff27ab64d','2025-12-26 01:54:55.458964',_binary '\0','2025-12-26 01:55:42.757969',NULL,0.2857142857142857,NULL,'0ea02ad2-211c-435e-857b-6178e7e7a9ed','c62c894b-76a9-48a4-8713-3f74f93a3746'),('367eb4a9-b2fc-4164-b84e-bc49fd4cc01b','2025-12-09 02:54:00.691324',_binary '\0','2025-12-09 02:54:00.691324',NULL,0,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','a6b534e1-6984-4846-b214-d3fe6779aa07'),('3c3b489d-ae85-4362-9579-72cb29685096','2025-11-23 12:50:20.084462',_binary '\0','2025-12-11 02:24:00.060987',NULL,0.5,NULL,'19e9b70f-1748-4e5e-accc-7d3218147994','c62c894b-76a9-48a4-8713-3f74f93a3746'),('3cfa9c57-6b56-480c-9c65-0519d924a9f3','2025-12-16 21:56:20.891462',_binary '\0','2025-12-16 21:56:20.891462',NULL,0,NULL,'17c24a88-9abe-4142-aa8a-fdea4e32d51b','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('44855b99-9f8f-4a32-8e33-caf7900bcd6f','2025-11-25 21:25:44.832066',_binary '\0','2025-11-25 21:25:44.832066',NULL,0,NULL,'96b2f0b3-7f63-47de-aad5-5c05683685b7','cd753132-e625-45ac-9504-354d260f5a8d'),('5477064f-5fc4-488c-83b2-3171d3c4974b','2025-12-11 01:10:54.412490',_binary '\0','2025-12-11 01:13:03.612481',NULL,0.42857142857142855,NULL,'5c6fceef-7fe8-47cf-91d7-6a500362c83c','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('618a1eb0-32fe-4687-908c-cd8b990036dd','2025-12-16 22:04:13.092660',_binary '\0','2025-12-16 22:04:13.092660',NULL,0,NULL,'17665735-5597-4583-9e47-121b494bf41f','cd753132-e625-45ac-9504-354d260f5a8d'),('6f684350-800a-40bb-ba00-7db8a0bd9f8f','2025-12-09 02:49:59.654887',_binary '\0','2025-12-09 02:49:59.654887',NULL,0,NULL,'96b2f0b3-7f63-47de-aad5-5c05683685b7','d59648c2-6436-4994-8e9e-ab66f34b607d'),('6fe8762f-7ac5-4caf-9351-a1e31635a9fc','2025-12-10 23:52:46.428880',_binary '\0','2025-12-10 23:52:46.428880',NULL,0,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','d59648c2-6436-4994-8e9e-ab66f34b607d'),('791f9bbb-d82f-4a29-b5c5-de184c8bade7','2025-12-09 02:46:05.024104',_binary '\0','2025-12-09 02:46:05.024104',NULL,0,NULL,'2df2ef54-9555-4495-be80-a506910fd5f3','a6b534e1-6984-4846-b214-d3fe6779aa07'),('8260f66f-cdc1-49b9-9678-eca774663138','2025-12-16 21:56:20.887997',_binary '\0','2025-12-16 21:56:20.887997',NULL,0,NULL,'17c24a88-9abe-4142-aa8a-fdea4e32d51b','cd753132-e625-45ac-9504-354d260f5a8d'),('88e0d89f-4b58-42f3-b72c-1beb4841d45a','2025-11-23 13:40:41.341746',_binary '\0','2025-11-23 13:40:41.341746',NULL,0,NULL,'19e9b70f-1748-4e5e-accc-7d3218147994','a6b534e1-6984-4846-b214-d3fe6779aa07'),('a2be0d06-7e28-4572-b7b1-7903eac376d1','2025-12-09 02:54:00.701361',_binary '\0','2025-12-09 02:54:00.701361',NULL,0,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','cd753132-e625-45ac-9504-354d260f5a8d'),('a3f14e19-7ce4-4f0f-a940-a0abd1d6d8e6','2025-12-16 22:04:13.088634',_binary '\0','2025-12-16 22:29:19.211392',NULL,0.2857142857142857,NULL,'17665735-5597-4583-9e47-121b494bf41f','c62c894b-76a9-48a4-8713-3f74f93a3746'),('a6298b23-f226-4bb9-bbc3-a621f3462099','2025-11-23 12:46:00.460499',_binary '\0','2025-11-23 12:46:00.460499',NULL,0,NULL,'96b2f0b3-7f63-47de-aad5-5c05683685b7','c62c894b-76a9-48a4-8713-3f74f93a3746'),('aced4253-261f-4c3b-a6ee-4100a1ca616f','2025-12-09 01:13:08.982281',_binary '\0','2025-12-09 01:13:08.982281',NULL,0,NULL,'2df2ef54-9555-4495-be80-a506910fd5f3','c62c894b-76a9-48a4-8713-3f74f93a3746'),('ad3fb301-37e6-44e8-b045-dfe4a5298845','2025-12-16 21:56:20.884337',_binary '\0','2025-12-16 21:56:20.884337',NULL,0,NULL,'17c24a88-9abe-4142-aa8a-fdea4e32d51b','c62c894b-76a9-48a4-8713-3f74f93a3746'),('af3279fc-ae0e-4fb8-bbcf-788944419cd2','2025-12-26 01:43:56.399942',_binary '\0','2025-12-26 01:43:56.399942',NULL,0,NULL,'0ea02ad2-211c-435e-857b-6178e7e7a9ed','a6b534e1-6984-4846-b214-d3fe6779aa07'),('b3ce962f-86b3-4044-b769-ca756efa5c5b','2025-12-26 02:08:32.989170',_binary '\0','2025-12-26 02:26:32.294545',NULL,0.375,NULL,'1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('b3f4e554-5b2a-47c4-a583-ded45d5827a2','2025-12-16 22:04:13.085465',_binary '\0','2025-12-16 22:04:13.085465',NULL,0,NULL,'17665735-5597-4583-9e47-121b494bf41f','a6b534e1-6984-4846-b214-d3fe6779aa07'),('bddac129-b9ab-4409-a8a5-d0f75698024d','2025-12-26 08:04:11.657098',_binary '\0','2025-12-26 08:04:11.657098',NULL,0,NULL,'12d39987-3d04-4429-a4e5-e817ba16d6e1','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('bf3d2490-ece8-41ff-a9b2-b8a872f62954','2025-12-09 02:54:00.696556',_binary '\0','2025-12-24 13:34:41.471645',NULL,0.14285714285714285,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','c62c894b-76a9-48a4-8713-3f74f93a3746'),('c1cc4268-ed0a-4839-9f1a-de7384a7c708','2025-11-23 13:48:43.945780',_binary '\0','2025-11-23 13:48:43.945780',NULL,0,NULL,'19e9b70f-1748-4e5e-accc-7d3218147994','cd753132-e625-45ac-9504-354d260f5a8d'),('cc5768ae-c1a5-49e7-8a51-e3aee0943ef3','2025-11-23 13:48:43.953763',_binary '\0','2025-11-23 13:48:43.953763',NULL,0,NULL,'19e9b70f-1748-4e5e-accc-7d3218147994','d59648c2-6436-4994-8e9e-ab66f34b607d'),('d231128e-ccee-41fc-99a9-f114609c2922','2025-11-23 02:32:53.983421',_binary '\0','2025-11-23 02:32:53.983421',NULL,0,NULL,'5c6fceef-7fe8-47cf-91d7-6a500362c83c','fc716289-dd27-4d2b-8e1d-dc4af98307ce'),('d5100050-83bc-4e27-b7fc-65612e70766e','2025-12-16 23:35:41.427215',_binary '\0','2025-12-16 23:35:41.427215',NULL,0,NULL,'6c22aa89-636a-41f9-91eb-4f920e45c4bd','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3'),('d5356aac-2338-4f77-b40b-d68b2b3914e2','2025-11-22 19:19:02.311588',_binary '\0','2025-12-11 01:45:10.611525',NULL,0,NULL,'a3da063e-db01-4ebe-8b07-b277be9f1076','c62c894b-76a9-48a4-8713-3f74f93a3746'),('d7a0fe0a-6d37-4acd-ab34-5bef28b5aae4','2025-12-11 01:19:19.079927',_binary '\0','2025-12-11 01:39:44.740846',NULL,0.42857142857142855,NULL,'a3da063e-db01-4ebe-8b07-b277be9f1076','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('e0390e40-4c13-4b92-a5c5-1c22b206af8f','2025-11-22 15:31:13.808846',_binary '\0','2025-12-11 00:48:56.411015',NULL,0.5,NULL,'5c6fceef-7fe8-47cf-91d7-6a500362c83c','c62c894b-76a9-48a4-8713-3f74f93a3746'),('e267216e-e30e-4da9-a0f2-4c64e952c1fd','2025-12-11 02:29:03.070135',_binary '\0','2025-12-11 02:29:53.294481',NULL,0,NULL,'19e9b70f-1748-4e5e-accc-7d3218147994','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('f81a14b6-070b-4792-a22b-09b9ae6d09e1','2025-12-16 22:04:13.096425',_binary '\0','2025-12-16 22:08:08.587567',NULL,0.42857142857142855,NULL,'17665735-5597-4583-9e47-121b494bf41f','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('f94fcb03-3365-4acf-a7cb-1e481e865bf6','2025-12-11 02:18:19.931250',_binary '\0','2025-12-11 02:21:38.879432',NULL,0.5714285714285714,NULL,'96b2f0b3-7f63-47de-aad5-5c05683685b7','f4018410-e6eb-4687-bb94-61ceb1ed4493'),('fc97b37c-7f48-4b1a-9b92-85c6304f82b0','2025-12-26 01:43:56.403617',_binary '\0','2025-12-26 01:43:56.403617',NULL,0,NULL,'0ea02ad2-211c-435e-857b-6178e7e7a9ed','cd753132-e625-45ac-9504-354d260f5a8d');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `progress` enum('NOT_STARTED','COMPLETED') DEFAULT NULL,
  `enrollment_id` varchar(255) DEFAULT NULL,
  `lesson_id` varchar(255) DEFAULT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `FKkx3nc17yyecdqwfgdydqmc24x` (`enrollment_id`),
  KEY `FKqwr70bkn0j6gok1y4op9jns8y` (`lesson_id`),
  CONSTRAINT `FKkx3nc17yyecdqwfgdydqmc24x` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`),
  CONSTRAINT `FKqwr70bkn0j6gok1y4op9jns8y` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
INSERT INTO `lesson_progress` VALUES ('060ad49a-5493-4bad-b5fb-ded7cb18f521','2025-12-26 01:55:13.201453',_binary '\0','2025-12-26 01:55:13.201453','COMPLETED','23f92126-203f-41c8-9629-b77ff27ab64d','7586c3b0-cf35-4d22-bc01-e00901716a82',NULL),('1a6a996a-4323-48a3-b38a-3ef5ff9c9431','2025-12-24 21:45:10.826804',_binary '\0','2025-12-24 21:45:10.826804','COMPLETED','1f2aca50-fb8a-4890-8d50-ef52b6277927','6a4de907-097e-4905-8733-64f4c3a0cfea',NULL),('3a1d9027-c3cc-480f-a8d8-bc15faa603e1','2025-12-26 02:25:46.162996',_binary '\0','2025-12-26 02:25:46.162996','COMPLETED','b3ce962f-86b3-4044-b769-ca756efa5c5b','d386a486-8c39-4e58-b82b-fffda007130e',NULL),('4c4b7d5c-88ef-4240-821d-33a26bb593ec','2025-12-26 01:55:42.748988',_binary '\0','2025-12-26 01:56:59.991986','COMPLETED','23f92126-203f-41c8-9629-b77ff27ab64d','666ee1cf-1965-4197-acf3-e02171a782d6','bài học hay'),('51d80c43-1959-477a-abfc-8e7f0f2ed10e','2025-12-16 22:28:53.428840',_binary '\0','2025-12-16 22:28:53.428840','COMPLETED','a3f14e19-7ce4-4f0f-a940-a0abd1d6d8e6','28e2c12f-2358-4b5d-8d7d-206f36442121',NULL),('72d662bb-0caa-484e-98b2-1c6ab33733f9','2025-12-24 21:32:25.744279',_binary '\0','2025-12-24 21:32:25.744279','NOT_STARTED','d5100050-83bc-4e27-b7fc-65612e70766e','604f2b5a-a315-469b-9dc9-a809713c2e8b','oke quá hay'),('89ea51c5-35d8-4a53-bfe5-807c95145f8a','2025-12-26 01:56:28.147854',_binary '\0','2025-12-26 01:56:28.147854','NOT_STARTED','23f92126-203f-41c8-9629-b77ff27ab64d','e3d42587-bc11-429b-91f3-a9e2e85e3642','bài học hay'),('9f77af54-9682-4f14-aea7-0187e41fd1b1','2025-12-26 09:13:24.435126',_binary '\0','2025-12-26 09:13:24.435126','COMPLETED','029dc08c-bf69-4df8-9e54-d1d78daddd45','7586c3b0-cf35-4d22-bc01-e00901716a82',NULL),('af719ce9-2689-4843-8964-4f9e1e752f0f','2025-12-24 21:45:18.762576',_binary '\0','2025-12-24 21:45:18.762576','COMPLETED','1f2aca50-fb8a-4890-8d50-ef52b6277927','464dbbb6-8960-452d-8a4c-a4ba021f5995',NULL),('c6e78ee8-e84e-43f4-a681-cea011981e4f','2025-12-26 02:25:44.084563',_binary '\0','2025-12-26 02:25:44.084563','COMPLETED','b3ce962f-86b3-4044-b769-ca756efa5c5b','fb94f99f-bfbe-4bbe-a76c-cc01e8d59f8b',NULL),('d795f4ab-4165-45fd-8779-c484499aa089','2025-12-24 13:34:41.431444',_binary '\0','2025-12-24 13:34:41.431444','COMPLETED','bf3d2490-ece8-41ff-a9b2-b8a872f62954','28e2c12f-2358-4b5d-8d7d-206f36442121',NULL),('e06f1bfc-8828-441b-93ce-f8770047b34e','2025-12-26 02:26:32.285476',_binary '\0','2025-12-26 02:26:32.285476','COMPLETED','b3ce962f-86b3-4044-b769-ca756efa5c5b','0345613b-d3a9-46e9-bede-fecc223840ec',NULL),('eb8d7ffa-4803-4e04-b68b-e4d84cefd20b','2025-12-16 22:29:19.201873',_binary '\0','2025-12-16 22:29:57.819819','COMPLETED','a3f14e19-7ce4-4f0f-a940-a0abd1d6d8e6','666ee1cf-1965-4197-acf3-e02171a782d6','bài học  này cần chú ý cái này '),('fb1b6972-7a93-4ac0-9e26-bfa2cd916eaa','2025-12-24 21:45:08.028711',_binary '\0','2025-12-24 21:45:08.028711','COMPLETED','1f2aca50-fb8a-4890-8d50-ef52b6277927','edec161f-fe34-4127-979b-ecb6a4a19430',NULL);
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `content` text,
  `duration` bigint DEFAULT NULL,
  `is_public` bit(1) DEFAULT NULL,
  `position` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` enum('video','article') DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `chapter_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmb78vk1f2oljr16oj1hpo45ma` (`chapter_id`),
  CONSTRAINT `FKmb78vk1f2oljr16oj1hpo45ma` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES ('0217f08f-618d-4847-b037-101b7c8fffc8','2025-10-25 14:50:21.795729',_binary '\0','2025-10-25 14:50:21.795729','CV của Phan Tấn Phúc',NULL,_binary '\0',NULL,'CV của Phan Tấn Phúc','article','localhost:8888/api/v1/learning/storage/1761378617799-Cv_PhanTanPhuc_BackEnd.pdf','955697bf-ad3c-4bce-94dd-95e1ddbf940b'),('0315b464-35d9-4ccd-85f8-2246671d8229','2025-12-08 23:53:14.681895',_binary '','2025-12-26 02:29:21.920088','',13,_binary '\0',NULL,'Hello cùng nhau học bài nào ','video','localhost:8888/api/v1/learning/storage/1765212764530-122233-724743712_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('0345613b-d3a9-46e9-bede-fecc223840ec','2025-12-24 09:53:31.249234',_binary '\0','2025-12-24 09:53:31.249234','<p>⚙️ Trong bài học này, bạn sẽ được hướng dẫn <strong>cài đặt Git</strong> trên máy tính và thực hiện các cấu hình cơ bản như username và email.</p><p> Bài học giải thích vì sao những thông tin này lại quan trọng khi làm việc nhóm và khi push code lên GitHub.</p><p>✅ Sau bài học, bạn sẽ có môi trường Git sẵn sàng để bắt đầu quản lý source code cho các dự án cá nhân.</p>',19,_binary '\0',NULL,'Cài đặt Git và cấu hình ban đầu','video','localhost:8888/api/v1/learning/storage/1766544799820-1761901944546-307864_small.mp4','71d27ce4-2908-4397-a9c0-f194405df880'),('03467460-e288-4c90-a068-5ac3511eae60','2025-10-19 14:45:34.510089',_binary '\0','2025-10-19 14:45:34.510089','123456',12,_binary '\0',NULL,'Quá buồn ','video','localhost:8888/api/v1/learning/storage/1760859929081-istockphoto-2223899615-640_adpp_is.mp4','d689238f-b756-49bf-a574-2ae319afa8b0'),('0429f4d2-1f89-4721-940b-760ab0a9168b','2025-12-08 23:55:12.668178',_binary '','2025-12-09 00:04:44.147532','',19,_binary '\0',NULL,'test','video','localhost:8888/api/v1/learning/storage/1765212894891-1761901944546-307864_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('045be3c7-ec71-4259-839c-cbd9b3d2cefc','2025-12-16 23:18:29.239605',_binary '','2025-12-23 09:54:11.049049','<p><br></p><p>✨ <strong>Learnova – Nơi kiến thức được chia sẻ bởi <em>mọi người</em>, cho <em>mọi người</em></strong> 🌱</p><p>Learnova không chỉ là hệ thống dành riêng cho giảng viên 👩‍🏫👨‍🏫, mà là <strong>không gian mở để bất kỳ ai cũng có thể tự tin chia sẻ kiến thức</strong> của mình 📚💡. Dù bạn là sinh viên, người đi làm hay chuyên gia trong lĩnh vực nào đó, Learnova trao cho bạn cơ hội <strong>biến trải nghiệm cá nhân thành bài học giá trị</strong>, lan tỏa hiểu biết và cùng nhau học hỏi 🤝🚀.</p><p>Tại Learnova, <strong>mỗi người học đều có thể trở thành người dạy</strong>, và mỗi kiến thức được chia sẻ đều góp phần xây dựng một cộng đồng học tập chủ động, tích cực và không ngừng phát triển 🌍✨. hhhhh</p>',712,_binary '\0',NULL,'Docker bắt đầu','video','localhost:8888/api/v1/learning/storage/1765901901356-The_Only_Docker_Tutorial_You_Need_To_Get_Started.mp4','71d27ce4-2908-4397-a9c0-f194405df880'),('0563b6b1-7e90-480d-a651-78bd94a04e98','2025-10-19 13:09:12.599773',_binary '\0','2025-10-19 13:09:12.599773','Một con vịt',NULL,_binary '\0',NULL,'Bình trà quá ngon','video','localhost:8888/api/v1/learning/storage/1760854141064-1216594-hd_1920_1080_30fps.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('069dee17-d8f7-4248-ab17-8c8a0683879a','2025-12-16 23:21:56.484648',_binary '','2025-12-23 09:54:13.478294','Hero feature',NULL,_binary '\0',NULL,'Nguyễn Văn A','article','localhost:8888/api/v1/learning/storage/1765902096274-GIẤY_CHỨNG_NHẬN.pdf','71d27ce4-2908-4397-a9c0-f194405df880'),('0b504026-c6e1-41fb-bdea-2b21872f288c','2025-12-11 18:15:38.351758',_binary '','2025-12-16 23:19:51.822143','🗂️ GitHub Projects (Kanban Board)\n\nTrong bài học này, em sẽ khám phá GitHub Projects – công cụ quản lý công việc trực quan theo mô hình Kanban 📋.\nEm sẽ học cách tạo bảng công việc, sắp xếp các task vào các cột To Do – In Progress – Done, gán người thực hiện và theo dõi tiến độ của cả nhóm một cách khoa học 👥⚡.\n\nGitHub Projects giúp dự án của em rõ ràng hơn, dễ phối hợp hơn và chuyên nghiệp hơn, phù hợp cho cả cá nhân và team hoạt động theo GitHub Flow 🚀.',NULL,_binary '\0',NULL,'GitHub Projects (Kanban board)','article','localhost:8888/api/v1/learning/storage/1765451734550-project-standard-sample.pdf','71d27ce4-2908-4397-a9c0-f194405df880'),('0c28d702-c14a-4b0e-941f-f80d69b031ce','2025-10-19 10:59:43.797949',_binary '\0','2025-10-19 10:59:43.797949','ấm trà quá ngon',NULL,_binary '\0',NULL,'Ấm trà quá ngon','video','localhost:8888/api/v1/learning/storage/1760846376181-1216594-hd_1920_1080_30fps.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('0deacebb-d607-42cd-9eff-7dff2d082d6b','2025-12-24 13:58:51.765937',_binary '\0','2025-12-24 13:58:51.765937','<p>Trong bài học này, bạn sẽ được hướng dẫn <strong>từng bước cách đăng ký một khóa học trên Learnova</strong> một cách nhanh chóng và đơn giản 📝🚀.</p><p>1. Truy cập khóa học bạn quan tâm</p><p>Từ trang chủ hoặc trang danh sách khóa học, bạn có thể <strong>tìm kiếm khóa học theo tên, chủ đề hoặc giảng viên</strong> 🔍📚.</p><p> Nhấn vào khóa học để xem <strong>thông tin chi tiết</strong>, bao gồm mô tả, nội dung bài học, thời lượng và yêu cầu trước khi học.</p><p>2. Xem chi tiết nội dung khóa học</p><p>Tại trang chi tiết, bạn sẽ thấy:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Mục tiêu và nội dung khóa học 📘</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Danh sách bài học được sắp xếp theo từng phần 📂</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Thông tin giảng viên 👨‍🏫👩‍🏫</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Trạng thái khóa học (miễn phí / trả phí nếu có) 💳</li></ol><p>Bước này giúp bạn <strong>đảm bảo khóa học phù hợp với nhu cầu và mục tiêu học tập của mình</strong> 🎯.</p>',37,_binary '',NULL,'Cách đăng ký khóa học trên Learnova','video','localhost:8888/api/v1/learning/storage/1766559525897-Screencast_from_2025-12-11_00-23-16.webm','70e15a00-11aa-4089-b312-9c733ea0b1ea'),('14b795fa-ec4c-4f4c-9adf-78fd888a4d36','2025-12-11 18:13:23.186958',_binary '','2025-12-23 09:54:15.990165','<h1>🧑‍💻 <strong>Tạo tài khoản GitHub</strong></h1><p>Trong bài học này, em sẽ được hướng dẫn cách tạo tài khoản GitHub – bước đầu tiên để bắt đầu lưu trữ, quản lý và chia sẻ mã nguồn trên nền tảng lập trình lớn nhất thế giới 🌍.</p><p> Em sẽ học cách đăng ký tài khoản, thiết lập thông tin cá nhân cơ bản, bật bảo mật và chuẩn bị mọi thứ để sẵn sàng làm việc với GitHub trong các bài học tiếp theo 🔐⚙️.</p><p>Sau bài này, em sẽ có một tài khoản GitHub hoàn chỉnh để bắt đầu push code, tạo repository và tham gia vào các dự án cá nhân hoặc làm việc nhóm 🚀.</p>',116,_binary '',NULL,'Tạo tài khoản GitHub & giới thiệu giao diện','video','localhost:8888/api/v1/learning/storage/1765451584970-videoplayback.mp4','71d27ce4-2908-4397-a9c0-f194405df880'),('1f116fcf-a903-41f2-bc2a-86cadede6cc6','2025-10-25 19:34:41.489762',_binary '\0','2025-10-25 19:34:41.489762','sdfasdf',NULL,_binary '\0',NULL,'sdfs','article','localhost:8888/api/v1/learning/storage/1761395679908-Mang-Luoi-Anh-Huong-Circle-of-Influence-Network.pdf','0e4282f9-36fe-41b1-ab03-2319aa86be13'),('2018f54d-5e85-4cb5-8a37-b420cb0b3b07','2025-12-09 00:35:49.225296',_binary '\0','2025-12-09 00:35:49.225296','<p>Chào em cô gái ban chiều</p>',13,_binary '\0',NULL,'Cùng nhau ôn bài nào !','video','localhost:8888/api/v1/learning/storage/1765215342214-122233-724743712_small.mp4','79b79e4e-938d-40d1-a079-56411274c316'),('201a51a6-3a6c-49e4-8630-1ce73979ac58','2025-12-09 00:05:18.741081',_binary '','2025-12-26 02:29:24.963328','Cùng nhau học bài nào',13,_binary '',NULL,'Hello ','video','localhost:8888/api/v1/learning/storage/1765213513973-122233-724743712_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('212f007a-1ee0-43bb-80b6-677ffefbb954','2025-12-26 02:44:44.858776',_binary '\0','2025-12-26 02:48:05.532439','<p>🐧 Trong bài học này, bạn sẽ tìm hiểu Linux là gì, nguồn gốc ra đời và triết lý thiết kế của hệ điều hành Linux.</p><p>Giảng viên sẽ phân tích vì sao Linux trở thành nền tảng cốt lõi cho server, cloud, container và các hệ thống lớn trên thế giới.</p><p>🎯 Sau bài này, bạn sẽ hiểu rõ <strong>vì sao học Linux là bước đi bắt buộc</strong> nếu muốn theo System Engineer, Backend hoặc DevOps.</p>',114,_binary '',NULL,'Linux là gì? Vì sao Linux quan trọng','video','localhost:8888/api/v1/learning/storage/1766691875210-YTDown.com_YouTube_Linux-Explained-in-1-Minute_Media_YvuHmfLrrdU_001_1080p.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('21ec60b0-adf5-430d-8cae-f7528141f1ee','2025-11-29 18:24:27.103738',_binary '\0','2025-11-29 18:24:27.103738','Hello ',13,_binary '',NULL,'hello ','video','localhost:8888/api/v1/learning/storage/1764415451380-122233-724743712_small.mp4','ef062bc3-e682-4672-872d-d5bb159757ac'),('26803f32-27c4-4a60-b19e-a36b86206c39','2025-10-19 17:44:21.597853',_binary '\0','2025-10-19 17:44:21.597853','Một buổi mưa quá buồn',36,_binary '',NULL,'Một buổi mưa quá buồn','video','localhost:8888/api/v1/learning/storage/1760870648297-A_havey_rainy_day.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('270c3303-cb71-4832-ad9b-adc204bdb6ae','2025-12-24 10:10:35.983331',_binary '','2025-12-24 10:11:19.872897','<p>📂 Trong bài học này, bạn sẽ làm quen với <strong>những lệnh Git quan trọng nhất</strong> như init, status, add, commit và log.</p><p> Bạn sẽ hiểu rõ sự khác nhau giữa working directory, staging area và repository.</p><p>🚀 Bài học được minh họa bằng ví dụ thực tế giúp bạn nắm được workflow chuẩn khi làm việc với Git.</p><p> ✨ Đây là phần kiến thức bắt buộc để bạn có thể sử dụng Git hàng ngày.</p>',756,_binary '\0',NULL,'Các lệnh Git cơ bản cần nắm','video','localhost:8888/api/v1/learning/storage/1766545831334-git3.mp4','4c457a28-678b-44aa-a052-e554bddfdaf9'),('28952ce8-982b-4450-aa62-4b22b7ed9718','2025-10-17 18:04:38.904382',_binary '\0','2025-10-17 18:04:38.904382','Description...',NULL,_binary '',NULL,'My lesson','video','localhost:8888/api/v1/learning/storage/1760699076172-1760633536295-istockphoto-2223899615-640_adpp_is_(1).mp4','c05552c8-e77e-4789-82e9-9f5f00837c33'),('28e2c12f-2358-4b5d-8d7d-206f36442121','2025-12-16 22:27:15.111018',_binary '','2025-12-26 01:14:57.388474','🐳 Cùng nhau học Docker – Bước đầu vào thế giới Container 🚀\n\nTrong bài học này, chúng ta sẽ cùng nhau khám phá Docker – công cụ giúp đóng gói ứng dụng một cách gọn nhẹ, dễ chạy và dễ triển khai ở mọi môi trường 💻☁️. Bạn sẽ hiểu Docker là gì, vì sao Dev & DevOps đều cần dùng Docker, và cách nó giúp tiết kiệm thời gian, giảm lỗi “chạy máy em được mà” 😅.\nThông qua ví dụ thực tế và cách làm từng bước, bài học sẽ giúp bạn tự tin tạo image, chạy container và sẵn sàng áp dụng Docker vào dự án của mình 🤝🔥.',NULL,_binary '\0',NULL,'Làm quen với DockerFile','article','localhost:8888/api/v1/learning/storage/1765898825477-(OChapter_&_OClan_2.0)_-_Proposal_-_20251020.pdf','36a61432-a7c0-4ee5-9e9f-c056a721587f'),('2b4b4d7d-a0b9-45b9-a15e-6b26c73700f8','2025-11-17 11:15:48.974244',_binary '','2025-12-26 01:17:50.030531','Video này giúp bạn nắm vững toàn bộ kiến thức Docker chỉ trong 100 phút.',126,_binary '\0',NULL,'Docker in 100 seconds','video','localhost:8888/api/v1/learning/storage/1763352940456-Docker_in_100_Seconds.mp4','51616392-29b3-4cd0-b256-56f64284ffae'),('348907da-e3c1-42fe-8971-1bdfcbf67b89','2025-10-31 16:12:32.742964',_binary '\0','2025-10-31 16:12:32.742964','dkakskf',19,_binary '',NULL,'jdjdj','video','localhost:8888/api/v1/learning/storage/1761901944546-307864_small.mp4','955697bf-ad3c-4bce-94dd-95e1ddbf940b'),('365ccaf4-cd19-4c2d-ab82-ef04265801c3','2025-12-26 02:46:32.265144',_binary '\0','2025-12-26 02:46:32.265144','<p>💻 Giải thích khái niệm Terminal và Shell, cách người dùng giao tiếp với Linux thông qua dòng lệnh.</p><p>Bạn sẽ hiểu sự khác nhau giữa:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Terminal</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Shell (bash, zsh…)</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Command line</li></ol><p>🎯 Đây là nền tảng quan trọng để bạn không bị “mù mờ” khi dùng terminal</p>',79,_binary '\0',NULL,'Terminal và Shell là gì?','video','localhost:8888/api/v1/learning/storage/1766691985655-YTDown.com_YouTube_The-Terminal-vs-The-Shell_Media_Yt57-gg9jVg_001_1080p.mp4','a0de103a-1278-421b-affa-8024c0802b83'),('3757897f-a49c-421a-a27c-cf12452b71db','2025-10-18 14:10:28.762820',_binary '\0','2025-10-18 14:10:28.762820','Quá buồn',NULL,_binary '\0',NULL,'Oke chúng ta là một nhà','video','localhost:8888/api/v1/learning/storage/1760771426831-1760633536295-istockphoto-2223899615-640_adpp_is.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('42459b55-cb82-484c-9de7-533766654226','2025-10-19 13:04:47.300025',_binary '\0','2025-10-19 13:04:47.300025','123456',NULL,_binary '\0',NULL,'Vì một nồi bánh chưng ngon','video','localhost:8888/api/v1/learning/storage/1760853877987-1216594-hd_1920_1080_30fps.mp4','d689238f-b756-49bf-a574-2ae319afa8b0'),('464dbbb6-8960-452d-8a4c-a4ba021f5995','2025-12-24 21:30:18.226232',_binary '\0','2025-12-24 21:30:18.226232','📝 Bài: Ghi chú trực tiếp trên bài giảng\n\nBài học này giới thiệu tính năng ghi chú trực tiếp khi học bài giảng – công cụ giúp bạn ghi nhớ kiến thức tốt hơn 🧠✍️\n\nNội dung bao gồm:\n\nCách tạo ghi chú trong lúc xem bài giảng\n\nChỉnh sửa, lưu và quản lý ghi chú cá nhân\n\nXem lại ghi chú khi ôn tập\n\nMẹo ghi chú hiệu quả để tăng khả năng ghi nhớ\n\nTính năng này đặc biệt hữu ích khi bạn học các nội dung dài hoặc chuyên sâu 📌',NULL,_binary '\0',NULL,'Ghi chú trực tiếp trên bài giảng','article','localhost:8888/api/v1/learning/storage/1766586615614-huongdanghichubaihoc.pdf','06d8a182-5c38-49a8-9676-1b95e89cde03'),('4c1dab5b-5759-44dd-9b6e-5a2dd79d7abd','2025-12-26 01:15:10.163812',_binary '\0','2025-12-26 01:15:10.163812','<p>🧪 Thông qua các ví dụ thực tế, bài học sẽ demo cách chạy một vài ứng dụng đơn giản bằng Docker, giúp bạn hình dung rõ hơn việc áp dụng Docker vào dự án thực tế 💻</p>',661,_binary '',NULL,'Demo thử vài ứng dụng Docker','video','localhost:8888/api/v1/learning/storage/1766686490444-Learn_Docker_in_7_Easy_Steps_-_Full_Beginner_s_Tutorial.mp4','2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8'),('5079198e-6ae4-46b4-9de8-3f7d38bea517','2025-10-19 20:51:34.319844',_binary '\0','2025-10-19 20:51:34.319844','Nội dung',NULL,_binary '\0',NULL,'Tài liệu','article','localhost:8888/api/v1/learning/storage/1760881892845-22110334_NguyenTuanHuy_BTW4.pdf','d689238f-b756-49bf-a574-2ae319afa8b0'),('510f0f5d-5868-4c6d-b9a4-5fdaeeee9139','2025-10-18 00:11:43.405372',_binary '\0','2025-10-18 00:11:43.405372','Quá xinh đẹp',NULL,_binary '\0',NULL,'Người phụ nữ đang cười','video','localhost:8888/api/v1/learning/storage/1760721101263-istockphoto-1667643471-640_adpp_is.mp4','39cd7c9f-bf01-4322-91ce-c54061e2a843'),('54a11552-4dd2-4245-bc2e-38072d556487','2025-12-24 09:35:32.500769',_binary '\0','2025-12-24 09:35:32.500769','<p>🌱 Trong bài học này, bạn sẽ được làm quen với <strong>khái niệm Git</strong> và hiểu vì sao Git trở thành công cụ không thể thiếu trong phát triển phần mềm hiện đại.</p><p> Chúng ta sẽ cùng phân tích những khó khăn khi quản lý source code thủ công như mất file, ghi đè code, không theo dõi được lịch sử thay đổi.</p><p>🔍 Bài học cũng giúp bạn hiểu Git hỗ trợ lưu trữ lịch sử code, quay lại phiên bản cũ và làm việc nhóm hiệu quả như thế nào.</p><p> 🎯 Sau bài học này, bạn sẽ hiểu rõ <strong>vì sao Git là nền tảng bắt buộc với mọi developer</strong>.</p>',136,_binary '',NULL,'Git là gì và vấn đề Git giải quyết','video','localhost:8888/api/v1/learning/storage/1766543720462-git1.mp4','71d27ce4-2908-4397-a9c0-f194405df880'),('54eba372-47fb-468f-9e6e-d2fea2b1541d','2025-10-17 23:59:26.086319',_binary '\0','2025-10-17 23:59:26.086319','Description...',NULL,_binary '',NULL,'My lesson','video','localhost:8888/api/v1/learning/storage/1760720363648-1760633536295-istockphoto-2223899615-640_adpp_is_(1).mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('58a1ff2a-2826-4a18-b930-7eefa878abe4','2025-10-18 21:11:31.006737',_binary '\0','2025-10-18 21:11:31.006737','múa',NULL,_binary '\0',NULL,'Hai phụ nữa đang múa ','video','localhost:8888/api/v1/learning/storage/1760796686778-1760672641275-istockphoto-2223899615-640_adpp_is.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('5aa6ed16-bad9-41bb-a75f-a525a044ddd1','2025-12-10 23:49:41.851026',_binary '','2025-12-24 13:43:30.305112','<h2><strong>Tổng quan giao diện &amp; cấu trúc khóa học</strong></h2><p><strong>\"Trong bài học này, bạn sẽ được làm quen với toàn bộ giao diện của Learnova 💻✨ – từ màn hình chính, thanh điều hướng, đến khu vực học tập cá nhân.</strong></p><p><strong> Bạn sẽ hiểu cách cấu trúc của một khóa học được tổ chức như thế nào 📘📂, gồm các bài giảng, tài liệu, bài kiểm tra và mục theo dõi tiến độ.</strong></p><p><strong> Bài học giúp bạn nắm rõ vị trí của những tính năng quan trọng 🔍, cách truy cập nhanh vào bài học, xem mục lục, kiểm tra trạng thái hoàn thành và sử dụng các công cụ hỗ trợ trong quá trình học 📊📎.</strong></p><p><strong> Sau bài này, bạn sẽ tự tin điều hướng và sử dụng Learnova một cách mượt mà hơn 🚀.\"</strong></p>',35,_binary '',NULL,'Tổng quan giao diện & cấu trúc khóa học','video','localhost:8888/api/v1/learning/storage/1765385376312-Screencast_from_2025-12-10_23-36-33.webm','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('5fbd2dc4-562e-4d38-b020-0701ba287cab','2025-12-10 23:56:59.595270',_binary '','2025-12-24 21:25:18.853620','<h2><strong>Cách đăng ký khóa học</strong></h2><p><strong>\"Bài học này hướng dẫn bạn từng bước để đăng ký một khóa học trên Learnova 📝✨.</strong></p><p><strong> Bạn sẽ biết cách tìm khóa học phù hợp 🔍, xem thông tin chi tiết 📘 và nhấn đăng ký chỉ với vài thao tác đơn giản 👆.</strong></p><p><strong> Hướng dẫn cũng giúp bạn hiểu cách lưu khóa học vào danh sách học tập của mình và bắt đầu học ngay lập tức 🚀.\"</strong></p>',92,_binary '',NULL,'Cách đăng ký khóa học','video','localhost:8888/api/v1/learning/storage/1765385809024-Screencast_from_2025-12-10_23-51-29.webm','70e15a00-11aa-4089-b312-9c733ea0b1ea'),('604f2b5a-a315-469b-9dc9-a809713c2e8b','2025-12-24 10:19:30.976886',_binary '\0','2025-12-24 10:19:30.976886','<p>🔁 Trong bài học này, bạn sẽ được làm quen với <strong>Pull Request (PR)</strong> – quy trình quan trọng trong làm việc nhóm.</p><p> Bạn sẽ học cách tạo PR, review code và xử lý feedback từ các thành viên khác.</p><p>🤝 Bài học giúp bạn hiểu rõ quy trình làm việc nhóm chuẩn trong các công ty phần mềm hiện nay.</p><p> ✨ Sau bài học, bạn có thể tự tin tham gia vào các dự án teamwork chuyên nghiệp.</p>',223,_binary '\0',NULL,'Pull Request (PR) và quy trình review code','video','localhost:8888/api/v1/learning/storage/1766546357616-git7.mp4','3c39fe61-b21b-4af3-81a5-6f4d1b341b3d'),('63c3074a-3106-4f83-8e39-4e3f2d0a3221','2025-12-26 01:19:22.942974',_binary '\0','2025-12-26 01:19:22.942974','<p>🔗 Bài này giúp bạn hiểu Docker Compose là gì, cách sử dụng Compose để quản lý nhiều container cùng lúc và xây dựng môi trường ứng dụng hoàn chỉnh một cách gọn gàng, dễ bảo trì 🚢</p>',126,_binary '\0',NULL,'Tìm hiểu Docker Compose','video','localhost:8888/api/v1/learning/storage/1766686746651-Docker_in_100_Seconds.mp4','51616392-29b3-4cd0-b256-56f64284ffae'),('666ee1cf-1965-4197-acf3-e02171a782d6','2025-12-16 22:21:12.821889',_binary '\0','2025-12-16 22:21:12.821889','<p>🐳 <strong>Cùng nhau học Docker – Bước đầu vào thế giới Container</strong> 🚀</p><p>Trong bài học này, chúng ta sẽ <strong>cùng nhau khám phá Docker</strong> – công cụ giúp đóng gói ứng dụng một cách gọn nhẹ, dễ chạy và dễ triển khai ở mọi môi trường 💻☁️. Bạn sẽ hiểu Docker là gì, vì sao Dev &amp; DevOps đều cần dùng Docker, và cách nó giúp tiết kiệm thời gian, giảm lỗi “chạy máy em được mà” 😅.</p><p> Thông qua ví dụ thực tế và cách làm từng bước, bài học sẽ giúp bạn <strong>tự tin tạo image, chạy container</strong> và sẵn sàng áp dụng Docker vào dự án của mình 🤝🔥.</p><p><br></p>',13,_binary '\0',NULL,'Cùng nhau học Docker nhé ','video','localhost:8888/api/v1/learning/storage/1765898467768-122233-724743712_small.mp4','2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8'),('67255990-88bb-4c9b-9ff4-aafc6f9db424','2025-12-11 00:18:35.722590',_binary '','2025-12-24 21:25:24.559246','',NULL,_binary '\0',NULL,'Cách xem nội dung bài học','article','localhost:8888/api/v1/learning/storage/1765387110442-cachs_xem_nbooij_dung_bai_học.pdf','70e15a00-11aa-4089-b312-9c733ea0b1ea'),('6a4de907-097e-4905-8733-64f4c3a0cfea','2025-12-24 13:50:23.767058',_binary '\0','2025-12-24 13:50:23.767058','Learnova là nền tảng học tập và chia sẻ tri thức trực tuyến, được xây dựng với mục tiêu giúp mọi người dễ dàng học – dạy – và phát triển bản thân trong thời đại số 🌍📚.\n\nKhông chỉ dành riêng cho giảng viên hay chuyên gia, Learnova là nơi bất kỳ ai cũng có thể trở thành người học và người chia sẻ kiến thức 💡🤝. Từ kỹ năng chuyên môn, công nghệ, thiết kế, đến kinh nghiệm thực tế trong công việc và cuộc sống – tất cả đều có thể được lan tỏa tại đây.\n\nLearnova tập trung vào:\n\nTrải nghiệm học tập thân thiện, dễ sử dụng 💻✨\n\nCấu trúc khóa học rõ ràng, khoa học 📂📘\n\nTheo dõi tiến độ minh bạch, giúp người học luôn biết mình đang ở đâu và cần làm gì tiếp theo 📊\n\nKhuyến khích cộng đồng học tập chủ động, học đi đôi với chia sẻ 🚀\n\nVới Learnova, việc học không còn bị giới hạn bởi không gian hay thời gian ⏰🌐. Chỉ cần một thiết bị kết nối internet, bạn đã có thể tiếp cận tri thức, nâng cao kỹ năng và từng bước chinh phục mục tiêu của mình 🎯🎓.',NULL,_binary '\0',NULL,'Learnova là ai?','article','localhost:8888/api/v1/learning/storage/1766559010321-intro_to_learnova.pdf','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('6f07c4f3-536f-4839-8e03-e0ac742b5df0','2025-12-10 23:39:02.435939',_binary '','2025-12-24 13:45:23.452438','<h2>🌟 <strong>Learnova là gì?</strong></h2><p><strong>\"Learnova là một nền tảng học tập trực tuyến thông minh 📚✨ giúp bạn học mọi thứ dễ dàng, nhanh chóng và hiệu quả hơn!</strong></p><p><strong> Tại đây, bạn có thể tham gia khóa học 🎓, xem bài giảng 📘, làm bài kiểm tra 📝, theo dõi tiến độ học 📊 và nhận chứng chỉ sau khi hoàn thành 🎖️.</strong></p><p><strong> Learnova được thiết kế để hỗ trợ cả người học lẫn người dạy với giao diện trực quan 💻, thao tác đơn giản 👆 và trải nghiệm học tập mượt mà 🚀.</strong></p><p><strong> Dù bạn là người mới, học viên, nhân viên hay giảng viên – Learnova đều giúp bạn nâng cấp kỹ năng một cách dễ dàng! 💡🔥\"</strong></p>',35,_binary '',NULL,'Learnova là gì?','video','localhost:8888/api/v1/learning/storage/1765384738797-Screencast_from_2025-12-10_23-36-33.webm','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('71df3cbc-e7e1-4256-bf4f-fc2d51faf0d3','2025-10-25 19:34:05.025156',_binary '\0','2025-10-25 19:34:05.025156','dsaf',7,_binary '\0',NULL,'dsfa','video','localhost:8888/api/v1/learning/storage/1761395643202-istockphoto-1667643471-640_adpp_is.mp4','0e4282f9-36fe-41b1-ab03-2319aa86be13'),('73fb4c19-9fc6-456c-b02d-4503fabef6ea','2025-12-16 23:28:12.523447',_binary '','2025-12-23 09:54:18.629393','Hello',NULL,_binary '\0',NULL,'Bài học này là PDF, Document','article','localhost:8888/api/v1/learning/storage/1765902485985-(OChapter_&_OClan_2.0)_-_Proposal_-_20251020.pdf','71d27ce4-2908-4397-a9c0-f194405df880'),('7586c3b0-cf35-4d22-bc01-e00901716a82','2025-12-26 01:16:19.044816',_binary '\0','2025-12-26 01:16:19.044816','📄 Bài viết này giới thiệu Dockerfile là gì, vai trò của Dockerfile trong Docker và các instruction cơ bản thường dùng khi build image 🏗️',NULL,_binary '\0',NULL,'Làm quen với Dockerfile','article','localhost:8888/api/v1/learning/storage/1766686575767-Docker_Guide___Stirling-PDF.pdf','36a61432-a7c0-4ee5-9e9f-c056a721587f'),('75b7c664-5d5a-48e9-910d-abe8712d5a58','2025-10-18 10:15:48.509410',_binary '\0','2025-10-18 10:15:48.509410','Qúa buồn cho một cuộc tình',NULL,_binary '',NULL,'Hai người phụ nữ đàng trò chuyện','video','localhost:8888/api/v1/learning/storage/1760757340536-1760672641275-istockphoto-2223899615-640_adpp_is.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('75e6ccbb-c435-4889-923c-ef45c020c3a0','2025-12-24 13:55:10.548212',_binary '\0','2025-12-24 13:55:10.548212','<p>Trong bài học này, bạn sẽ được <strong>khám phá toàn cảnh giao diện Learnova</strong> 💻✨ – từ màn hình chính, thanh điều hướng cho đến không gian học tập cá nhân của riêng bạn.</p><p>Bạn sẽ hiểu rõ <strong>cách một khóa học được xây dựng và sắp xếp khoa học</strong> 📘📂, bao gồm các bài giảng, tài liệu học tập, bài kiểm tra và hệ thống theo dõi tiến độ học tập.</p><p>Bài học cũng giúp bạn <strong>xác định nhanh các tính năng quan trọng</strong> 🔍, biết cách truy cập bài học chỉ trong vài thao tác, xem mục lục khóa học, kiểm tra trạng thái hoàn thành và tận dụng các công cụ hỗ trợ học tập hiệu quả 📊📎.</p><p>Sau khi hoàn thành bài này, bạn sẽ <strong>tự tin làm chủ giao diện Learnova</strong>, điều hướng mượt mà và học tập hiệu quả hơn ngay từ những bước đầu tiên 🚀🎓.</p>',27,_binary '',NULL,'Hãy là một phần của Learnova nào !','video','localhost:8888/api/v1/learning/storage/1766559295053-Screencast_from_2025-12-24_13-52-54.webm','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('78171f0d-a741-438c-8161-7d25bd0ea912','2025-12-26 01:17:38.931776',_binary '\0','2025-12-26 01:17:38.931776','<p>📦 Bạn sẽ học cách tạo Docker Image từ Dockerfile, hiểu quá trình build image diễn ra như thế nào và cách quản lý các image trong hệ thống một cách hiệu quả ⚙️</p>',318,_binary '\0',NULL,'Bắt đầu với Docker Image nhé','video','localhost:8888/api/v1/learning/storage/1766686630412-What_is_Docker_in_5_minutes.mp4','36a61432-a7c0-4ee5-9e9f-c056a721587f'),('78c96ef4-ba29-4020-a313-d1f6c49a2bc6','2025-12-26 02:45:22.909610',_binary '\0','2025-12-26 02:45:22.909610','<p>⚖️ So sánh Linux, Windows và macOS dưới góc nhìn <strong>vận hành hệ thống</strong>, không chỉ là trải nghiệm người dùng.</p><p>Bạn sẽ hiểu sự khác nhau về:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Cách quản lý tài nguyên</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Bảo mật</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Khả năng tùy biến</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Mức độ phù hợp cho production</li></ol><p>🎯 Giúp bạn trả lời câu hỏi: <em>“Vì sao server gần như luôn chạy Linux?”</em></p>',566,_binary '\0',NULL,'Linux vs Windows vs macOS (Góc nhìn hệ thống)','video','localhost:8888/api/v1/learning/storage/1766691902971-YTDown.com_YouTube_LDL5-Dev-nen-xai-Win-Mac-hay-Linux_Media_fLskVBD9tz4_003_480p.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('885be873-e2bd-46a3-a0fc-d1e92c5b86a6','2025-12-26 01:18:55.687804',_binary '\0','2025-12-26 01:18:55.687804','<p>⏱️ Một bài học ngắn gọn giúp bạn tổng hợp nhanh các kiến thức cốt lõi về Docker, cực kỳ phù hợp để ôn tập hoặc nắm bắt bức tranh tổng quan chỉ trong vài phút 🧩</p>',318,_binary '\0',NULL,'Docker in 100 seconds','video','localhost:8888/api/v1/learning/storage/1766686710008-What_is_Docker_in_5_minutes.mp4','51616392-29b3-4cd0-b256-56f64284ffae'),('8a3537b1-1a1a-46d3-a514-13946689b358','2025-12-24 10:22:53.731162',_binary '\0','2025-12-24 10:22:53.731162','<p>🔄 Trong bài học này, bạn sẽ được làm quen với <strong>Git workflow phổ biến trong các dự án thực tế</strong>.</p><p> Bài học mô tả quy trình làm việc từ lúc nhận task, tạo branch, commit code cho đến khi mở Pull Request.</p><p>🧩 Bạn sẽ hiểu rõ vai trò của các nhánh như <code>main</code>, <code>develop</code>, <code>feature branch</code> và cách phối hợp giữa các thành viên trong team.</p><p> 🎯 Sau bài học, bạn sẽ hình dung rõ quy trình làm Git chuẩn trong môi trường làm việc chuyên nghiệp.</p>',624,_binary '\0',NULL,'Git workflow trong dự án thực tế','video','localhost:8888/api/v1/learning/storage/1766546555377-git10.mp4','0c28786c-60f1-4498-acff-4968b8956d70'),('8ec743bb-1bc5-45f7-8af8-01e701330fe2','2025-12-26 02:47:28.221069',_binary '\0','2025-12-26 02:47:28.221069','🔤 Phân tích chi tiết cấu trúc một câu lệnh Linux gồm:\n\nCommand\n\nOption\n\nArgument\n\nGiảng viên hướng dẫn cách đọc tài liệu man để tự học lệnh mới.\n\n🎯 Giúp bạn học Linux theo tư duy hiểu bản chất, không học thuộc.',NULL,_binary '\0',NULL,'Các lệnh Shell cơ bản ','article','localhost:8888/api/v1/learning/storage/1766692043463-Product_Frontend_-_Project_Complexity.pptx_(1).pdf','a0de103a-1278-421b-affa-8024c0802b83'),('90f69fcb-b743-4780-b8c7-59565d3e7608','2025-12-01 18:47:49.422249',_binary '','2025-12-09 00:04:56.298105','Hello, xin chào mọi người',13,_binary '\0',NULL,'Cùng nhau học bài nào !','video','localhost:8888/api/v1/learning/storage/1764589656970-122233-724743712_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('91563117-89f6-4cbd-ae0b-7d887b492fc9','2025-12-24 21:37:31.177382',_binary '\0','2025-12-24 21:37:31.177382','<p>Trong bài học này, bạn sẽ được hướng dẫn <strong>cách nhận hỗ trợ khi gặp khó khăn trong quá trình học tập</strong> trên Learnova 🤝</p><p>Bạn sẽ tìm hiểu:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Cách gửi câu hỏi cho giảng viên hoặc đội ngũ hỗ trợ</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Theo dõi và phản hồi các câu trả lời</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Những kênh hỗ trợ chính thức của Learnova</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Mẹo đặt câu hỏi rõ ràng để nhận được hỗ trợ nhanh hơn</li></ol><p>Bài học giúp bạn yên tâm học tập, biết rõ mình luôn có người đồng hành khi cần 💙</p>',17,_binary '\0',NULL,'Hỏi đáp & hỗ trợ','video','localhost:8888/api/v1/learning/storage/1766587046840-Screencast_from_2025-12-24_21-36-38.webm','df870152-0db0-4331-8195-dfe03b84b65b'),('9855dae5-bbfc-4c01-b65a-9a9f47f53d63','2025-11-08 19:12:06.112094',_binary '','2025-12-26 01:17:53.211386','Tìm hiểu Docker Compose ',19,_binary '\0',NULL,'Tìm hiểu Docker Compose ','video','localhost:8888/api/v1/learning/storage/1762603919014-307864_small.mp4','51616392-29b3-4cd0-b256-56f64284ffae'),('994bddb7-c3e6-4b98-ae15-6fe87e135230','2025-11-08 18:14:14.568813',_binary '','2025-12-26 01:13:25.448633','<h3>🐳 Tiếp Tục Làm Quen Với Docker: Hiểu Cách Container Hoạt Động ⚙️</h3><p>Docker giúp em đóng gói ứng dụng cùng môi trường chạy để đảm bảo chạy giống nhau ở mọi nơi. Mỗi container giống như một “hộp mini” chứa đúng những gì app cần — gọn, nhẹ và cách ly hoàn toàn. Khi hiểu được cách image → container hoạt động, em sẽ triển khai ứng dụng nhanh hơn, ổn định hơn và ít lỗi môi trường hơn. 🚀</p><h3>🐳 Tiếp Tục Làm Quen Với Docker: Hiểu Cách Container Hoạt Động ⚙️</h3><p>Docker giúp em đóng gói ứng dụng cùng môi trường chạy để đảm bảo chạy giống nhau ở mọi nơi. Mỗi container giống như một “hộp mini” chứa đúng những gì app cần — gọn, nhẹ và cách ly hoàn toàn. Khi hiểu được cách image → container hoạt động, em sẽ triển khai ứng dụng nhanh hơn, ổn định hơn và ít lỗi môi trường hơn. 🚀</p><p><br></p>',712,_binary '',NULL,'Làm quen với Docker ','video','localhost:8888/api/v1/learning/storage/1762600446030-The_Only_Docker_Tutorial_You_Need_To_Get_Started.mp4','2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8'),('9dfbe8c4-64d9-43a3-bbf2-b2811b50f922','2025-10-25 19:34:07.241239',_binary '\0','2025-11-30 19:23:52.160908','Hello tôi là Tiến Anh, tôi mừng cho các bạn',36,_binary '',NULL,'sdfa','video','localhost:8888/api/v1/learning/storage/1761395637715-A_havey_rainy_day.mp4','0e4282f9-36fe-41b1-ab03-2319aa86be13'),('9ec5bad5-56d7-42fb-93d0-2c9cde98f93b','2025-12-24 09:42:09.004651',_binary '\0','2025-12-24 09:42:09.004651','<p>🧠 Bài học này giúp bạn hiểu <strong>cách Git hoạt động bên trong</strong> thay vì chỉ học thuộc lệnh.</p><p> Bạn sẽ làm quen với các khái niệm như repository, commit, branch và cách Git lưu trữ lịch sử thay đổi.</p><p>📦 Thông qua ví dụ đơn giản, bài học giúp bạn hình dung rõ quy trình làm việc với Git từ lúc chỉnh sửa file cho đến khi lưu thay đổi.</p><p> ✨ Đây là nền tảng quan trọng để bạn không bị “mù Git” khi học các phần nâng cao.</p>',358,_binary '\0',NULL,'Git hoạt động như thế nào?','video','localhost:8888/api/v1/learning/storage/1766544107511-git2.mp4','71d27ce4-2908-4397-a9c0-f194405df880'),('9fc01bce-5e69-44bc-b6ee-56711d0f547b','2025-10-19 17:50:35.783134',_binary '\0','2025-10-19 17:50:35.783134','123456',12,_binary '',NULL,'helloo tôi là quá buồn','video','localhost:8888/api/v1/learning/storage/1760871032496-1760633536295-istockphoto-2223899615-640_adpp_is_(1).mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('a0595cdd-8126-450e-9262-0a3f057ae0bb','2025-10-18 00:09:59.015743',_binary '\0','2025-10-18 00:09:59.015743','Quá xinh đẹp',NULL,_binary '\0',NULL,'Người phụ nữ đang cười','video','localhost:8888/api/v1/learning/storage/1760720996519-istockphoto-1667643471-640_adpp_is.mp4','39cd7c9f-bf01-4322-91ce-c54061e2a843'),('a13f4075-8c97-4d62-8d6a-9e49facbc27a','2025-12-09 00:10:07.000888',_binary '','2025-12-26 02:29:28.397678','',13,_binary '\0',NULL,'Hello chúng ta là bạn','video','localhost:8888/api/v1/learning/storage/1765213793795-122233-724743712_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('a2cbfe2d-fd55-40ca-8471-90c092c74632','2025-12-24 10:13:45.638622',_binary '\0','2025-12-24 10:13:45.638622','<p>🌿 Bài học này giúp bạn hiểu <strong>khái niệm branch</strong> và lý do vì sao branch giúp làm việc nhóm an toàn hơn.</p><p> Bạn sẽ học cách tạo nhánh mới, chuyển nhánh và merge code.</p><p>🧠 Bài học cũng giải thích các tình huống thực tế khi cần dùng branch trong dự án.</p><p> 🎯 Sau bài học, bạn sẽ hiểu cách tổ chức code chuyên nghiệp hơn.</p>',273,_binary '\0',NULL,'Nhánh (Branch) là gì và vì sao cần dùng','video','localhost:8888/api/v1/learning/storage/1766546014255-git5.mp4','3c39fe61-b21b-4af3-81a5-6f4d1b341b3d'),('a302c2e9-95bf-4a53-a8dc-ccdad33a10cb','2025-11-08 18:09:37.408883',_binary '','2025-12-16 22:26:16.463779','<h3>🚀 Bắt Đầu Làm Quen Với Dockerfile – Viết Một Lần, Chạy Mọi Nơi 🐳</h3><p><strong>Description:</strong></p><p> Dockerfile là “công thức” giúp em đóng gói ứng dụng vào container một cách tự động, nhất quán và dễ triển khai. Với vài dòng lệnh đơn giản, em có thể định nghĩa môi trường chạy, copy source code, cài dependency và build image chỉ với một câu lệnh. Đây là bước đầu tiên để đi vào thế giới DevOps, CI/CD và triển khai ứng dụng chuyên nghiệp. ⚙️🔥</p>',NULL,_binary '',NULL,'Làm quen với Docker file','article','localhost:8888/api/v1/learning/storage/1762600172713-(OChapter_&_OClan_2.0)_-_Proposal_-_20251020.pdf','36a61432-a7c0-4ee5-9e9f-c056a721587f'),('a91bc102-b9ad-489a-bf5b-c32616ec403f','2025-10-18 00:14:45.203741',_binary '\0','2025-10-18 00:14:45.203741','Một nỗi buồn không thể tả ',NULL,_binary '\0',NULL,'Quá buồn','video','localhost:8888/api/v1/learning/storage/1760721282657-istockphoto-2223899615-640_adpp_is.mp4','39cd7c9f-bf01-4322-91ce-c54061e2a843'),('ac99fe86-ac5b-439f-b5c9-46e5291f26b4','2025-12-16 23:20:20.228712',_binary '','2025-12-16 23:26:40.850094','<p>bài viết pdf chỉnh sửa </p>',NULL,_binary '',NULL,'hello','article','localhost:8888/api/v1/learning/storage/1765902005484-(OChapter_&_OClan_2.0)_-_Proposal_-_20251020.pdf','71d27ce4-2908-4397-a9c0-f194405df880'),('adb1c087-7ffe-4c1c-b0a1-ebdebd4defc0','2025-11-08 18:20:55.595900',_binary '','2025-12-26 01:15:04.764449','Bắt đầu với Docker Image nhé',661,_binary '\0',NULL,'Bắt đầu với Docker Image nhé','video','localhost:8888/api/v1/learning/storage/1762600848658-Learn_Docker_in_7_Easy_Steps_-_Full_Beginner_s_Tutorial.mp4','36a61432-a7c0-4ee5-9e9f-c056a721587f'),('b48ef60c-52e8-4d4d-b246-d14821b2057f','2025-10-19 17:48:41.178249',_binary '\0','2025-10-19 17:48:41.178249','ranin',36,_binary '\0',NULL,'rain','video','localhost:8888/api/v1/learning/storage/1760870907196-A_havey_rainy_day.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('b4b54e6d-79c7-4dba-bbe0-2f4feb18826e','2025-10-19 13:14:33.837859',_binary '\0','2025-10-19 13:14:33.837859','Một con vịt',NULL,_binary '',NULL,'Hello hai người phụ nữ đang buồn','video','localhost:8888/api/v1/learning/storage/1760854470275-istockphoto-2223899615-640_adpp_is.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('b7ca4509-cec5-48a8-8ad4-85eac4a280b9','2025-10-19 20:53:30.165410',_binary '\0','2025-10-19 20:53:30.165410','mưa',36,_binary '',NULL,'mưa quá mưa','video','localhost:8888/api/v1/learning/storage/1760881994150-A_havey_rainy_day.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('b8708d22-eed6-4065-a10a-0f14971dd0f4','2025-10-18 21:10:21.706006',_binary '\0','2025-10-18 21:10:21.706006','Quá buồn',NULL,_binary '\0',NULL,'Phụ nữ đang cười','video','localhost:8888/api/v1/learning/storage/1760796618222-istockphoto-1667643471-640_adpp_is.mp4','6d5b123c-dbc9-4da0-9dac-5b1a2ea4193b'),('bcabf0ce-2b49-4af3-93cb-bcbd08819480','2025-12-24 13:41:18.736048',_binary '\0','2025-12-24 13:41:18.736048','<p>Trong bài học này, bạn sẽ được <strong>khám phá toàn cảnh giao diện Learnova</strong> 💻✨ – từ màn hình chính, thanh điều hướng cho đến không gian học tập cá nhân của riêng bạn.</p><p>Bạn sẽ hiểu rõ <strong>cách một khóa học được xây dựng và sắp xếp khoa học</strong> 📘📂, bao gồm các bài giảng, tài liệu học tập, bài kiểm tra và hệ thống theo dõi tiến độ học tập.</p><p>Bài học cũng giúp bạn <strong>xác định nhanh các tính năng quan trọng</strong> 🔍, biết cách truy cập bài học chỉ trong vài thao tác, xem mục lục khóa học, kiểm tra trạng thái hoàn thành và tận dụng các công cụ hỗ trợ học tập hiệu quả 📊📎.</p><p>Sau khi hoàn thành bài này, bạn sẽ <strong>tự tin làm chủ giao diện Learnova</strong>, điều hướng mượt mà và học tập hiệu quả hơn ngay từ những bước đầu tiên 🚀🎓.</p><p>Nếu em muốn:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Viết <strong>ngắn gọn hơn</strong></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Viết theo kiểu <strong>marketing / landing page</strong></li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Hoặc giọng văn <strong>trẻ trung – Gen Z hơn</strong></li></ol>',63,_binary '\0',NULL,'Tổng quan giao diện & cấu trúc khóa học','video','localhost:8888/api/v1/learning/storage/1766558464135-Screencast_from_2025-12-24_13-38-06.webm','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('bcee5812-ece2-4323-b43d-8f93e938a2a6','2025-12-11 18:11:46.149545',_binary '','2025-12-23 09:54:43.896287','<h1>📌 <strong>Git là gì? Vì sao cần dùng Git?</strong></h1><p>Trong bài học này, em sẽ khám phá Git – hệ thống quản lý phiên bản mạnh mẽ được sử dụng bởi hầu hết lập trình viên trên thế giới 🌍.</p><p> Git giúp theo dõi mọi thay đổi trong mã nguồn, lưu lịch sử phát triển của dự án, và cho phép làm việc nhóm hiệu quả mà không lo mất code 💻✨.</p><p>Em sẽ hiểu vì sao Git trở thành công cụ “bắt buộc phải biết” đối với bất kỳ lập trình viên nào và nó giúp em làm việc chuyên nghiệp hơn như thế nào 🚀.</p>',116,_binary '',NULL,'Git là gì? Vì sao cần dùng Git?','video','localhost:8888/api/v1/learning/storage/1765451486680-videoplayback.mp4','4c457a28-678b-44aa-a052-e554bddfdaf9'),('be8b162f-0950-4a35-92aa-f8391328f099','2025-12-08 23:50:08.265422',_binary '','2025-12-08 23:52:32.916280','cùng nhau docker nào ',19,_binary '\0',NULL,'Hello docker ','video','localhost:8888/api/v1/learning/storage/1765212597976-1761901944546-307864_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('bfa19d06-9fee-48ac-a8e0-00ba10407a0c','2025-10-19 12:33:25.621999',_binary '\0','2025-10-19 12:33:25.621999','Uống trà cùng tiến anh nhé !!!',NULL,_binary '',NULL,'Bình trà quá ngon','video','localhost:8888/api/v1/learning/storage/1760851995817-1216594-hd_1920_1080_30fps.mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('c361f3c3-64ca-42b0-b5be-68a352c108ae','2025-10-19 15:13:15.257399',_binary '\0','2025-10-19 15:13:15.257399','Quá buồn cho một cuộc tình',NULL,_binary '\0',NULL,'CV backend','article','localhost:8888/api/v1/learning/storage/1760861593398-CV_Backend_Fresher.pdf','d689238f-b756-49bf-a574-2ae319afa8b0'),('c52defe6-eda6-4e4d-befb-5432b969a5f8','2025-12-09 00:36:43.669676',_binary '','2025-12-26 02:29:31.446079','<p><strong><em>Nếu chúng ta quá buồn</em></strong></p>',19,_binary '\0',NULL,'cơn mưa','video','localhost:8888/api/v1/learning/storage/1765215396862-307864_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('c5df286a-51c8-4215-8f64-a126bc083ea7','2025-11-08 17:30:58.187802',_binary '\0','2025-11-08 17:30:58.187802','Cố lên mấy đứa ơi',19,_binary '',NULL,'Liệu rằng chúng ta có quá buồn cho một cuộc tình','video','localhost:8888/api/v1/learning/storage/1762597852474-307864_small.mp4','46f38269-7092-40ee-9c49-fee9303ac774'),('cecb2d70-eb76-431c-be34-0edd305b6cc5','2025-10-19 12:46:12.931900',_binary '\0','2025-10-19 12:46:12.931900','quá buòn',NULL,_binary '\0',NULL,'Cà phê quá ngon ','video','localhost:8888/api/v1/learning/storage/1760852760035-1216594-hd_1920_1080_30fps.mp4','6d5b123c-dbc9-4da0-9dac-5b1a2ea4193b'),('cfd22269-d932-4ac9-b216-a7613bd525cf','2025-11-08 17:31:46.996230',_binary '','2025-11-29 14:59:51.904643','Cùng nhau học bài nào ',19,_binary '\0',NULL,'Bắt đầu học nha','video','localhost:8888/api/v1/learning/storage/1762597900898-307864_small.mp4','6bff3314-952a-46f0-9bcf-3215750a7839'),('d1eb9b36-c456-4489-b684-c3032edf6ec8','2025-12-11 00:22:28.435614',_binary '','2025-12-24 21:28:39.199918','\"Bài học này giúp bạn hiểu cách tạo ghi chú ngay trong lúc xem bài giảng 📝✨.\nBạn có thể ghi lại ý chính, đánh dấu nội dung quan trọng và xem lại toàn bộ ghi chú ở một nơi rất tiện lợi 📚🔖.\nTính năng này giúp việc học của bạn trở nên tập trung và hiệu quả hơn 🚀.\"',NULL,_binary '\0',NULL,'Ghi chú trực tiếp trên bài giảng','article','localhost:8888/api/v1/learning/storage/1765387345482-note.pdf','06d8a182-5c38-49a8-9676-1b95e89cde03'),('d26b6f38-0d62-4cd5-ac57-4b190d3e7258','2025-12-09 23:11:00.481402',_binary '','2025-12-26 02:29:34.406356','<p><strong>Thành huy đang đọc sách</strong></p>',13,_binary '',NULL,'Thành Huy đang đọc sách','video','localhost:8888/api/v1/learning/storage/1765296656820-122233-724743712_small.mp4','6757507a-e20a-420d-bac3-9e8d104b20d8'),('d2e1a9b1-5044-4716-ac81-f042e7f7221b','2025-10-24 13:53:52.162035',_binary '\0','2025-10-24 13:53:52.162035','dfsafs',36,_binary '\0',NULL,'dfa','video','localhost:8888/api/v1/learning/storage/1761288818229-A_havey_rainy_day.mp4','ecfaae7a-af46-4efb-90d5-1e4fbbc40ac1'),('d386a486-8c39-4e58-b82b-fffda007130e','2025-12-24 09:55:33.321100',_binary '\0','2025-12-24 09:55:33.321100','🔐 Bài học này tập trung vào việc kết nối Git local với GitHub thông qua credential.\nBạn sẽ được hướng dẫn sử dụng Personal Access Token (PAT) hoặc SSH key để xác thực an toàn.\n\n⚠️ Ngoài ra, bài học cũng chỉ ra những lỗi thường gặp khi push code và cách khắc phục nhanh chóng.\n🎯 Sau bài học, bạn có thể tự tin push/pull code mà không gặp lỗi xác thực.',NULL,_binary '\0',NULL,'Setup GitHub credential và xác thực','article','localhost:8888/api/v1/learning/storage/1766544929815-git-cheat-sheet-education.pdf','4c457a28-678b-44aa-a052-e554bddfdaf9'),('d3f4242c-a412-42f9-94fb-f3e8b08d2663','2025-12-11 00:25:43.233870',_binary '','2025-12-24 21:30:31.926748','<p><strong>\"Trong bài học này, bạn sẽ khám phá toàn bộ cách sử dụng khu vực Hỏi &amp; Đáp trên Learnova 💬✨.</strong></p><p><strong> Tại đây, bạn có thể đặt câu hỏi khi gặp khó khăn 🤔❓, trao đổi trực tiếp với giảng viên 👩‍🏫👨‍🏫, và thảo luận cùng các học viên khác để làm rõ kiến thức 📚🤝.</strong></p><p><strong> Bạn cũng sẽ học cách theo dõi các chủ đề quan trọng 📌, nhận thông báo khi có câu trả lời mới 🔔 và tìm lại những câu hỏi đã được giải đáp trước đó 🔍🗂️.</strong></p><p><strong> Khu vực này giúp bạn học sâu hơn, hiểu bài nhanh hơn và luôn có người đồng hành trong quá trình học của mình 🚀🔥.</strong></p><p><strong> Hãy tận dụng Hỏi &amp; Đáp để biến việc học trở nên thú vị, kết nối và hiệu quả hơn! 🌟\"</strong></p>',37,_binary '\0',NULL,'Hỏi đáp & hỗ trợ','video','localhost:8888/api/v1/learning/storage/1765387532568-Screencast_from_2025-12-11_00-23-16.webm','df870152-0db0-4331-8195-dfe03b84b65b'),('d40b5236-485e-464e-a05a-b4c6f855c936','2025-10-19 20:54:08.178004',_binary '\0','2025-10-19 20:54:08.178004','123456',NULL,_binary '\0',NULL,'geek','article','localhost:8888/api/v1/learning/storage/1760882046542-Product_Backend_-_Technical_Assessment_GI_Autumn_2025.pdf','d689238f-b756-49bf-a574-2ae319afa8b0'),('db9f7827-3f54-45e3-b3a9-3d2c64c1f219','2025-10-24 13:53:18.963726',_binary '\0','2025-10-24 13:53:18.963726','hello',36,_binary '\0',NULL,'Hello','video','localhost:8888/api/v1/learning/storage/1761288787389-lỗi_like_ảnh.mp4','2b5bda1b-118a-4deb-9057-247e2dde90c0'),('debd41d9-3391-42af-a5bd-527ff08a4189','2025-11-05 22:34:54.816801',_binary '\0','2025-11-05 22:34:54.816801','Những chú gà',19,_binary '',NULL,'Hello ','video','localhost:8888/api/v1/learning/storage/1762356888562-307864_small.mp4','bb6ad511-12c7-4f4a-b128-e45f8dcfdcab'),('e3d42587-bc11-429b-91f3-a9e2e85e3642','2025-12-26 01:14:08.377189',_binary '\0','2025-12-26 01:14:08.377189','<p>🧠 Trong bài này, bạn sẽ hiểu rõ hơn về cách Docker hoạt động, các khái niệm cơ bản như container, image và cách chúng liên kết với nhau trong quá trình phát triển ứng dụng.</p>',712,_binary '',NULL,'Làm quen với Docker','video','localhost:8888/api/v1/learning/storage/1766686442281-The_Only_Docker_Tutorial_You_Need_To_Get_Started.mp4','2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8'),('edec161f-fe34-4127-979b-ecb6a4a19430','2025-12-24 21:27:49.815867',_binary '\0','2025-12-24 21:27:49.815867','Trong bài viết này, bạn sẽ được hướng dẫn cách truy cập và theo dõi nội dung học tập bên trong một khóa học trên Learnova 📚\n\nBạn sẽ biết:\n\nCách mở bài giảng video và bài viết\n\nTheo dõi tiến độ học tập của bản thân 📊\n\nChuyển đổi giữa các bài học trong cùng một chương\n\nCách học lại các bài đã hoàn thành\n\nSau khi đọc xong, bạn sẽ dễ dàng làm quen với giao diện học tập và học hiệu quả hơn ✨',NULL,_binary '\0',NULL,'Cách xem nội dung bài học','article','localhost:8888/api/v1/learning/storage/1766586467374-qua-buon.pdf','70e15a00-11aa-4089-b312-9c733ea0b1ea'),('ee3b8a67-4e8d-48f0-a976-3de3867c4bc0','2025-12-02 22:56:42.137896',_binary '\0','2025-12-02 22:56:42.137896','test',318,_binary '',NULL,'Hello','video','localhost:8888/api/v1/learning/storage/1764690987188-What_is_Docker_in_5_minutes.mp4','f11729dc-db9e-4859-ab05-3204c20a33f8'),('ee59f77f-ff2f-44b7-8230-bdb24c996059','2025-10-19 20:53:27.993918',_binary '\0','2025-10-19 20:53:27.993918','fdsafs',18,_binary '\0',NULL,'dsfasdf','video','localhost:8888/api/v1/learning/storage/1760882002130-1216594-hd_1920_1080_30fps.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('f2bdbecd-069d-4d10-9d41-b8ae9868e0db','2025-10-19 17:48:34.451429',_binary '\0','2025-10-19 17:48:34.451429','dsfa',12,_binary '\0',NULL,'dfas','video','localhost:8888/api/v1/learning/storage/1760870912991-istockphoto-2223899615-640_adpp_is.mp4','2ccc4895-7949-478e-b89b-f6e8381b3d94'),('f6b10e15-9bf2-4596-ac77-b9a5124101b2','2025-12-10 23:48:28.573607',_binary '','2025-12-24 13:47:00.908847','\"Học nhanh hơn, theo dõi tiến độ dễ dàng, trải nghiệm mượt mà, nội dung trực quan và nhận chứng chỉ ngay khi hoàn thành.\"',NULL,_binary '',NULL,'Lợi ích khi học trên Learnova','article','localhost:8888/api/v1/learning/storage/1765385307411-Giới_thiệu_Learnova_-_Nền_tảng_học_tập_trực_tuyến.pdf','8407b6f7-9184-40a4-86d0-7ba64df50e81'),('f702906d-9fe2-4e95-b301-8df75de4fdc7','2025-10-31 16:11:46.266520',_binary '\0','2025-10-31 16:11:46.266520','Quá buồn',19,_binary '',NULL,'Cối xay gió','video','localhost:8888/api/v1/learning/storage/1761901899804-307864_small.mp4','955697bf-ad3c-4bce-94dd-95e1ddbf940b'),('f7458f7f-9f83-4b33-ad50-895e28252d63','2025-10-17 23:46:46.220228',_binary '\0','2025-10-17 23:46:46.220228','Description...',NULL,_binary '',NULL,'My lesson','video','localhost:8888/api/v1/learning/storage/1760719602801-1760633536295-istockphoto-2223899615-640_adpp_is_(1).mp4','41a0b33c-a1fb-407c-85b3-fcb02615f4d4'),('f7a6c371-80e3-4d16-b4f7-0126c7ddc89d','2025-10-26 11:30:38.888918',_binary '','2025-12-26 01:13:28.231828','cốc nước đá',18,_binary '\0',NULL,'Demo thử vài ứng dụng Docker ','video','localhost:8888/api/v1/learning/storage/1761453019441-1216594-hd_1920_1080_30fps.mp4','2fc43b2d-1ae1-4bfe-8d89-3ded8e1118a8'),('fb30ee30-4bcd-42c3-9965-ac376400038e','2025-12-24 21:34:11.215900',_binary '\0','2025-12-24 21:41:18.387236','<p>Bài học này giới thiệu tính năng <strong>ghi chú trực tiếp khi học bài giảng</strong> – công cụ giúp bạn ghi nhớ kiến thức tốt hơn 🧠✍️</p><p>Nội dung bao gồm:</p><ol><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Cách tạo ghi chú trong lúc xem bài giảng</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Chỉnh sửa, lưu và quản lý ghi chú cá nhân</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Xem lại ghi chú khi ôn tập</li><li data-list=\"bullet\"><span class=\"ql-ui\" contenteditable=\"false\"></span>Mẹo ghi chú hiệu quả để tăng khả năng ghi nhớ</li></ol><p>Tính năng này đặc biệt hữu ích khi bạn học các nội dung dài hoặc chuyên sâu 📌</p>',32,_binary '',NULL,'Ghi chú trực tiếp trên bài giảng','video','localhost:8888/api/v1/learning/storage/1766586847115-Screencast_from_2025-12-24_21-32-10.webm','06d8a182-5c38-49a8-9676-1b95e89cde03'),('fb94f99f-bfbe-4bbe-a76c-cc01e8d59f8b','2025-12-24 10:12:10.159808',_binary '\0','2025-12-24 10:12:10.159808','<p>🔐 Bài học này tập trung vào việc <strong>kết nối Git local với GitHub</strong> thông qua credential.</p><p> Bạn sẽ được hướng dẫn sử dụng Personal Access Token (PAT) hoặc SSH key để xác thực an toàn.</p><p>⚠️ Ngoài ra, bài học cũng chỉ ra những lỗi thường gặp khi push code và cách khắc phục nhanh chóng.</p><p> 🎯 Sau bài học, bạn có thể tự tin push/pull code mà không gặp lỗi xác thực.</p>',19,_binary '\0',NULL,'Setup GitHub credential và xác thực (continue)','video','localhost:8888/api/v1/learning/storage/1766545919801-307864_small.mp4','4c457a28-678b-44aa-a052-e554bddfdaf9'),('ff63cc1e-eff0-44b1-8d93-244269c536f9','2025-12-16 23:27:55.456887',_binary '','2025-12-23 09:54:21.905794','<p>🐳 <strong>Cùng nhau học Docker – Bước đầu vào thế giới Container</strong> 🚀</p><p>Trong bài học này, chúng ta sẽ <strong>cùng nhau khám phá Docker</strong> – công cụ giúp đóng gói ứng dụng một cách gọn nhẹ, dễ chạy và dễ triển khai ở mọi môi trường 💻☁️. Bạn sẽ hiểu Docker là gì, vì sao Dev &amp; DevOps đều cần dùng Docker, và cách nó giúp tiết kiệm thời gian, giảm lỗi “chạy máy em được mà” 😅.</p><p> Thông qua ví dụ thực tế và cách làm từng bước, bài học sẽ giúp bạn <strong>tự tin tạo image, chạy container</strong> và sẵn sàng áp dụng Docker vào dự án của mình 🤝🔥.</p>',126,_binary '\0',NULL,'Cùng nhau học Docker – Bước đầu vào thế giới Container ','video','localhost:8888/api/v1/learning/storage/1765902457712-Docker_in_100_Seconds.mp4','71d27ce4-2908-4397-a9c0-f194405df880');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `deleted` bit(1) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES ('1','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg','Java'),('10','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg','Vue.js'),('11','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png','Docker'),('12','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg','Kubernetes'),('13','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg','AWS'),('14','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg','Azure'),('15','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Cloud_logo.svg','GCP'),('16','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/en/4/45/MongoDB-Logo.svg','MongoDB'),('17','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg','PostgreSQL'),('18','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/en/d/dd/MySQL_logo.svg','MySQL'),('19','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/en/6/6b/Redis_Logo.svg','Redis'),('2','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg','Python'),('20','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg','GraphQL'),('3','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png','JavaScript'),('4','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg','React'),('5','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg','Spring Boot'),('6','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/7/74/Kotlin_Icon.png','Kotlin'),('7','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/1/17/Google-flutter-logo.png','Flutter'),('8','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg','Node.js'),('9','2025-10-17 10:57:42.000000',_binary '\0','2025-10-17 10:57:42.000000','https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg','Angular');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `user_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `user_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `user_service`;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` varchar(255) NOT NULL,
  `credential_url` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `organization` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `verification_source` varchar(255) DEFAULT NULL,
  `verified` bit(1) NOT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `verify_note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_s9grd73xaw050p5vrrp0uxml7` (`credential_url`),
  CONSTRAINT `certificates_chk_1` CHECK ((`status` between 0 and 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expertise`
--

DROP TABLE IF EXISTS `expertise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expertise` (
  `id` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expertise`
--

LOCK TABLES `expertise` WRITE;
/*!40000 ALTER TABLE `expertise` DISABLE KEYS */;
INSERT INTO `expertise` VALUES ('1193526c-9e79-4cf6-bc7a-2ca646bcd10b','https://images.pexels.com/photos/5182446/pexels-photo-5182446.jpeg','Cloud Computing'),('355a0887-4036-49c4-ad38-30347ac69a88','https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg','Web Development'),('7c2b7b74-288c-4d57-b2b7-e84da35ec1e1','https://images.pexels.com/photos/4491462/pexels-photo-4491462.jpeg','UI/UX Design'),('99173836-9eca-4c79-ba9a-c80a9714550a','https://images.pexels.com/photos/5473956/pexels-photo-5473956.jpeg','Machine Learning'),('a7361590-f259-4a70-8e16-3ffcf1175767','https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg','Mobile App Development'),('cdb0be89-c397-4ecc-9237-9689818c7362','https://images.pexels.com/photos/5182446/pexels-photo-5182446.jpeg','Cloud Computing'),('d2b0317f-1c29-4e0a-837f-44ba1133b550','https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg','Data Science');
/*!40000 ALTER TABLE `expertise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('cdd5e037-7bde-4b58-8fdb-f98a13fc03af','Admin Role','admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_expertise`
--

DROP TABLE IF EXISTS `user_expertise`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_expertise` (
  `id` varchar(255) NOT NULL PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `expertise_id` varchar(255) NOT NULL,
  KEY `FKdw281y9ir7ihl2sqw6decjo9b` (`expertise_id`),
  KEY `FKsx97uyb1hsrfhn4ew2latu8hr` (`user_id`),
  CONSTRAINT `FKdw281y9ir7ihl2sqw6decjo9b` FOREIGN KEY (`expertise_id`) REFERENCES `expertise` (`id`),
  CONSTRAINT `FKsx97uyb1hsrfhn4ew2latu8hr` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_expertise`
--

LOCK TABLES `user_expertise` WRITE;
/*!40000 ALTER TABLE `user_expertise` DISABLE KEYS */;
INSERT INTO `user_expertise` VALUES ('ue-1','1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','355a0887-4036-49c4-ad38-30347ac69a88'),('ue-2','1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','7c2b7b74-288c-4d57-b2b7-e84da35ec1e1'),('ue-3','6c22aa89-636a-41f9-91eb-4f920e45c4bd','7c2b7b74-288c-4d57-b2b7-e84da35ec1e1'),('ue-4','6c22aa89-636a-41f9-91eb-4f920e45c4bd','355a0887-4036-49c4-ad38-30347ac69a88'),('ue-5','6c22aa89-636a-41f9-91eb-4f920e45c4bd','1193526c-9e79-4cf6-bc7a-2ca646bcd10b');
/*!40000 ALTER TABLE `user_expertise` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` varchar(255) NOT NULL,
  `role_id` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('a7d2782b-1d44-4ce2-9e47-3849d0e36b00','cdd5e037-7bde-4b58-8fdb-f98a13fc03af');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `description` text,
  `email` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','NOT_ACTIVE') DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0ea02ad2-211c-435e-857b-6178e7e7a9ed',NULL,'anh.pt@geekup.vnn','https://lh3.googleusercontent.com/a/ACg8ocLJJ5CEH0_DYPbfB-YRx8lpanf22yOI3aQnYrvLbSfJ3XremgU=s96-c','Phạm Tiến Anh',NULL,NULL,NULL,'ACTIVE','anh.pt@geekup.vnn'),('12d39987-3d04-4429-a4e5-e817ba16d6e1',NULL,'anh.pt@geekup.vn','https://lh3.googleusercontent.com/a/ACg8ocLJJ5CEH0_DYPbfB-YRx8lpanf22yOI3aQnYrvLbSfJ3XremgU=s96-c','Phạm Tiến Anh',NULL,NULL,NULL,'ACTIVE','anh.pt@geekup.vn'),('1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','Thầy Phạm Tiến Anh là giảng viên trẻ đam mê công nghệ, chuyên về phát triển phần mềm và hệ thống. Với lối truyền đạt dễ hiểu, thầy giúp học viên nắm vững kiến thức thực tiễn, ứng dụng hiệu quả trong các dự án web và di động.','22110404@student.hcmute.edu.vn','http://res.cloudinary.com/dijyyybm2/image/upload/v1763389890/iotbtngkluuxp5dlaxm5.webp','t9tieanh','$2a$10$K0xpqJczfZaDhN.eh9ZyQuMkyUZkWzj2qzi8nd0AQyeyNAkGnHYES','','','ACTIVE','teacher'),('17665735-5597-4583-9e47-121b494bf41f',NULL,'sdfasdf','https://lh3.googleusercontent.com/a/ACg8ocJDgFO76dF4_r7qBW4anddEsRGwa0pE09-fr8ZYsgvYst6ZsK2Y=s96-c','Phạm Tiến Anh',NULL,NULL,NULL,'ACTIVE','phama91621@gmail.com'),('17c24a88-9abe-4142-aa8a-fdea4e32d51b',NULL,'phama91dfda62@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJDgFO76dF4_r7qBW4anddEsRGwa0pE09-fr8ZYsgvYst6ZsK2Y=s96-c','Phạm Tiến Anh',NULL,NULL,NULL,'ACTIVE','phama91622@gmail.com'),('17efd4fa-e360-4a87-bee8-df29db20df0a',NULL,'huymixi2k4@gmail.com',NULL,'huy','$2a$10$8IGSs7URMn.K2MgZ3CKJf.tDJifzbaay6M4xfF2xZTImHX.XJ4XDe','0335233755',NULL,'ACTIVE','huy'),('19e9b70f-1748-4e5e-accc-7d3218147994',NULL,'phamtienanh815@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJpoE1UVrk9KhUEYsDqeSmOBRa1VTtnk2JteYL9-jOU2SLDPh8=s96-c','Phạm Tiến Anh',NULL,NULL,NULL,'ACTIVE','phamtienanh815@gmail.com'),('2df2ef54-9555-4495-be80-a506910fd5f3','','phama9df162@gmail.com','http://res.cloudinary.com/dijyyybm2/image/upload/v1765218769/i7ct9awkk0p8zim2dwp5.jpg','PHAM TIEN ANH','$2a$10$mJUkQ9uSH1vwCiOJdhW9/.8UOA4avTNvOKsy/XbztSIgOlNSX0pbe','0856230326','','ACTIVE','CuTienAnhBuChaBa'),('5c6fceef-7fe8-47cf-91d7-6a500362c83c','','anh.pt@geekupp.vn','http://res.cloudinary.com/dijyyybm2/image/upload/v1763827696/go18uueugzyg6cahefji.jpg','Phạm Tiến Anh',NULL,'','','ACTIVE','anh.pt@geekupp.vn'),('5e85b528-8e2d-414c-838b-99d42154579c',NULL,'phama9162@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocJDgFO76dF4_r7qBW4anddEsRGwa0pE09-fr8ZYsgvYst6ZsK2Y=s96-c','Phạm Tiến Anh','$2a$10$xFpLoDaBTfwsWR9YK3X0YOoXWmm5ODvVok3hN3Djpwnq6uCm3xH.y',NULL,NULL,'ACTIVE','phama9162@gmail.com'),('6c22aa89-636a-41f9-91eb-4f920e45c4bd','<p><strong>👨‍🏫 DevOps Instructor – Chuyên môn vững, truyền dạy dễ hiểu</strong></p><p>Một thầy giáo DevOps với kinh nghiệm thực chiến nhiều năm trong CI/CD, Docker, Kubernetes và Cloud ☁️🛠️. Thầy có phong cách giảng dạy rõ ràng, thực tế, luôn đi thẳng vào vấn đề và giúp học viên hiểu bản chất thay vì chỉ làm theo.</p><p>Luôn tận tâm hỗ trợ, giải đáp mọi thắc mắc từ cơ bản đến nâng cao, thầy truyền cảm hứng để học viên tự tin triển khai, vận hành và tối ưu hệ thống DevOps trong môi trường doanh nghiệp 🚀💻.</p>','doiphama9162oday','http://res.cloudinary.com/dijyyybm2/image/upload/v1766546917/b5g5ycvskqevbt3fwyt6.jpg','Phạm Tiến Anh','$2a$10$3NTpNAAPRmxediac4y4pEuHQ6Ej/IUzgPtXm9AB8t92CuVs2kAIJi','0856230326','Thành Phố Hồ Chí Minh','ACTIVE','phama91623@gmail.com'),('7b907782-0330-44a0-aeb6-c2929aad2497',NULL,'DSF',NULL,'PHAM TIEN ANH','$2a$10$UOPrf.XkEW3F0vqIhWFAS.CYDhvzg5teWWWk4V9xBnrOCPw47rv5G','0856230326',NULL,'ACTIVE','quabuon'),('96b2f0b3-7f63-47de-aad5-5c05683685b7','','chienthannodejs@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocKp8ts81Hc_0ITyDVzZEXdveuhnbwK7yrbAbvkv3pSxP08xlbE=s96-c','Nguyễn Đức Sang',NULL,'0856230326','Hồ Chí Minh','ACTIVE','chienthannodejs@gmail.com'),('a3da063e-db01-4ebe-8b07-b277be9f1076',NULL,'22110282@student.hcmute.edu.vn','https://lh3.googleusercontent.com/a/ACg8ocLl8yfGBS9zswq-lEwPGiskP3ffjn5CgM7RWAc7eINDP4zGgNo=s96-c','Pham Tien Anh',NULL,NULL,NULL,'ACTIVE','22110282@student.hcmute.edu.vn'),('a7d2782b-1d44-4ce2-9e47-3849d0e36b00',NULL,'admin@tienanh194.com',NULL,NULL,'$2a$10$MuHh9KFLCFB/Idmr/yMyQOy/hkRp32FjiF02LWV.qVVokBHQiG3H2',NULL,NULL,'ACTIVE','admin123');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `sale_service`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sale_service` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `sale_service`;

--
-- Table structure for table `Cart`
--

DROP TABLE IF EXISTS `Cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cart` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cart_user_id_key` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cart`
--

LOCK TABLES `Cart` WRITE;
/*!40000 ALTER TABLE `Cart` DISABLE KEYS */;
INSERT INTO `Cart` VALUES ('2d89485f-058e-424c-962c-2c3551c796f5','a3da063e-db01-4ebe-8b07-b277be9f1076','2025-11-13 11:02:45.458','2025-11-13 11:02:45.458'),('33a2bf2f-48d4-43bc-9884-ca44a7c05423','96b2f0b3-7f63-47de-aad5-5c05683685b7','2025-11-23 05:45:18.796','2025-11-23 05:45:18.796'),('4267d6f6-aabb-43f2-a30b-333034ecd3a1','17665735-5597-4583-9e47-121b494bf41f','2025-12-16 14:58:43.727','2025-12-16 14:58:43.727'),('4fef10b3-85ae-41e5-84d9-1b58c136616c','0ea02ad2-211c-435e-857b-6178e7e7a9ed','2025-12-25 18:43:56.445','2025-12-25 18:43:56.445'),('55eb67e4-0d7a-4c36-9337-750b63c7c635','user-1','2025-11-14 01:08:11.130','2025-11-14 01:08:11.130'),('5f2a763f-0a89-4bae-bfa3-b694c21984d6','5e85b528-8e2d-414c-838b-99d42154579c','2026-01-08 09:57:14.913','2026-01-08 09:57:14.913'),('643ba001-4ff5-45a1-b4ce-147ac04fd5d6','17c24a88-9abe-4142-aa8a-fdea4e32d51b','2025-12-16 14:56:20.984','2025-12-16 14:56:20.984'),('6c0a2b4e-3a9f-4d81-b017-6d526aab155a','2df2ef54-9555-4495-be80-a506910fd5f3','2025-11-26 17:01:38.804','2025-11-26 17:01:38.804'),('7827b6f8-575f-429d-bbe9-327b35c625ab','19e9b70f-1748-4e5e-accc-7d3218147994','2025-11-23 05:49:30.517','2025-11-23 05:49:30.517'),('9556e98f-5d02-4679-96c7-843e5e64ab66','12d39987-3d04-4429-a4e5-e817ba16d6e1','2025-12-26 01:04:11.803','2025-12-26 01:04:11.803'),('b7d6178f-2728-4c81-aab4-975cb84bbe87','17efd4fa-e360-4a87-bee8-df29db20df0a','2025-12-23 02:22:20.555','2025-12-23 02:22:20.555'),('c8dd45ac-f6f9-442f-a9a0-45e22449a43f','1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','2025-11-13 09:34:03.892','2025-11-13 09:34:03.892'),('e9cd9c77-e534-4011-b878-60847ef1ff48','6c22aa89-636a-41f9-91eb-4f920e45c4bd','2025-12-08 19:54:00.734','2025-12-08 19:54:00.734'),('ee540d78-efc9-4749-aa35-76ca31310b67','user-3','2025-11-14 01:08:11.141','2025-11-14 01:08:11.141'),('f4c68a8e-519e-4121-bd2b-ff824d948499','user-2','2025-11-14 01:08:11.136','2025-11-14 01:08:11.136'),('f6ac1dd8-0b60-4021-bec1-831794dfee31','5c6fceef-7fe8-47cf-91d7-6a500362c83c','2025-11-14 14:17:57.928','2025-11-14 14:17:57.928');
/*!40000 ALTER TABLE `Cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Cart_Item`
--

DROP TABLE IF EXISTS `Cart_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Cart_Item` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cart_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Cart_Item_cart_id_fkey` (`cart_id`),
  CONSTRAINT `Cart_Item_cart_id_fkey` FOREIGN KEY (`cart_id`) REFERENCES `Cart` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Cart_Item`
--

LOCK TABLES `Cart_Item` WRITE;
/*!40000 ALTER TABLE `Cart_Item` DISABLE KEYS */;
INSERT INTO `Cart_Item` VALUES ('0b5f9edd-b182-40f1-99e3-5179451fcac8','f4c68a8e-519e-4121-bd2b-ff824d948499','course-103'),('36b463c6-ff90-49fa-8abc-2274d65328fe','55eb67e4-0d7a-4c36-9337-750b63c7c635','course-102'),('41fa4a56-ba7e-4c00-9796-24ed105ab7e4','6c0a2b4e-3a9f-4d81-b017-6d526aab155a','c62c894b-76a9-48a4-8713-3f74f93a3746'),('465979be-5859-4f32-9214-54f3d2b62ea0','f6ac1dd8-0b60-4021-bec1-831794dfee31','a6b534e1-6984-4846-b214-d3fe6779aa07'),('490379bf-6923-4f72-bdab-9428d85a5748','55eb67e4-0d7a-4c36-9337-750b63c7c635','course-101'),('7f5d9113-006c-4b8a-ab14-becc6a42ddf7','6c0a2b4e-3a9f-4d81-b017-6d526aab155a','a6b534e1-6984-4846-b214-d3fe6779aa07'),('81163ea7-a39a-46f7-b6ed-fa47b6e74b96','f6ac1dd8-0b60-4021-bec1-831794dfee31','cd753132-e625-45ac-9504-354d260f5a8d'),('8dc1a9aa-07eb-4b20-bf3f-0723c43ebf9b','c8dd45ac-f6f9-442f-a9a0-45e22449a43f','c62c894b-76a9-48a4-8713-3f74f93a3746'),('95f6196d-6db0-4b75-b86c-415836b85bc5','e9cd9c77-e534-4011-b878-60847ef1ff48','cd753132-e625-45ac-9504-354d260f5a8d'),('98708ecb-6070-476f-a5d3-e95839c545af','33a2bf2f-48d4-43bc-9884-ca44a7c05423','c62c894b-76a9-48a4-8713-3f74f93a3746'),('a27e7b68-2b98-473a-a1be-b4f73be89225','ee540d78-efc9-4749-aa35-76ca31310b67','course-104'),('a3180951-3f2a-47e7-be35-ba39f3855ba9','5f2a763f-0a89-4bae-bfa3-b694c21984d6','c62c894b-76a9-48a4-8713-3f74f93a3746'),('ef2cabdb-ff47-4834-b4dd-fdd28d3da4c1','6c0a2b4e-3a9f-4d81-b017-6d526aab155a','cd753132-e625-45ac-9504-354d260f5a8d'),('fbbb56d0-0564-4b7c-bb0d-d0f781b3d164','33a2bf2f-48d4-43bc-9884-ca44a7c05423','a6b534e1-6984-4846-b214-d3fe6779aa07');
/*!40000 ALTER TABLE `Cart_Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Discount`
--

DROP TABLE IF EXISTS `Discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Discount` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` double NOT NULL,
  `type` enum('Percent','Amount') COLLATE utf8mb4_unicode_ci NOT NULL,
  `minOrderValue` double DEFAULT NULL,
  `maxDiscount` double DEFAULT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Discount_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Discount`
--

LOCK TABLES `Discount` WRITE;
/*!40000 ALTER TABLE `Discount` DISABLE KEYS */;
INSERT INTO `Discount` VALUES ('620de2c5-3d97-4e2b-911d-cef935b6544d','Big 50K Off (min 200K)','BIG50K',50000,'Amount',200000,50000,'2025-11-23 06:44:27.710','2026-01-22 06:44:27.733'),('6740f755-62da-453d-b522-2da4a43e8d6e','Fixed 5K Off','FIX5K',5000,'Amount',6000,NULL,'2025-11-23 06:44:27.710','2026-01-22 06:44:27.733'),('f56095c8-d498-4021-84da-8425536f94f1','50% Off (cap 10K)','MAX50_10K',50,'Percent',0,10000,'2025-11-23 06:44:27.710','2026-01-22 06:44:27.733'),('fe7c5ede-5fef-470a-a307-d6ff247d8ca0','Welcome 10% Off','WELCOME10',10,'Percent',0,100000,'2025-11-23 06:44:27.710','2026-01-22 06:44:27.733');
/*!40000 ALTER TABLE `Discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order`
--

DROP TABLE IF EXISTS `Order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Cancel','Pending','Completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `discount_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_discount_id_fkey` (`discount_id`),
  CONSTRAINT `Order_discount_id_fkey` FOREIGN KEY (`discount_id`) REFERENCES `Discount` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order`
--

LOCK TABLES `Order` WRITE;
/*!40000 ALTER TABLE `Order` DISABLE KEYS */;
INSERT INTO `Order` VALUES ('cmia14stb0009k4ruxlt4dtow','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-11-22 08:30:57.503','2025-11-22 08:31:13.817',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',130000),('cmia1cbhv000bk4ruhvaz6ymz','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-11-22 08:36:48.308','2025-11-22 08:37:18.063',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',50000),('cmia99224000dk4rueecwe07g','a3da063e-db01-4ebe-8b07-b277be9f1076','Pending','2025-11-22 12:18:13.036','2025-11-22 12:18:13.036',NULL,'22110282@student.hcmute.edu.vn','Pham Tien Anh',130000),('cmia99e49000fk4ru00nuo6oo','a3da063e-db01-4ebe-8b07-b277be9f1076','Completed','2025-11-22 12:18:28.665','2025-11-22 12:19:02.437',NULL,'22110282@student.hcmute.edu.vn','Pham Tien Anh',130000),('cmiaonzz50001k4b2ut2v75hk','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-11-22 19:29:44.418','2025-11-22 19:30:32.717',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',65000),('cmiaorpok0003k4b2g066svge','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-11-22 19:32:37.699','2025-11-22 19:32:53.998',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',111000),('cmibanx1i0001k4quqorn8a2e','96b2f0b3-7f63-47de-aad5-5c05683685b7','Completed','2025-11-23 05:45:32.167','2025-11-23 05:46:00.510',NULL,'chienthannodejs@gmail.com','Nguyễn Đức Sang',130000),('cmibatb220003k4qucnwcpdvj','19e9b70f-1748-4e5e-accc-7d3218147994','Completed','2025-11-23 05:49:43.610','2025-11-23 05:50:20.095',NULL,'phamtienanh815@gmail.com','Phạm Tiến Anh',130000),('cmibcmbin0001k4bmndrs35d0','19e9b70f-1748-4e5e-accc-7d3218147994','Completed','2025-11-23 06:40:16.847','2025-11-23 06:40:41.386',NULL,'phamtienanh815@gmail.com','Phạm Tiến Anh',65000),('cmibcwnrv0001k4nx90hs32s0','19e9b70f-1748-4e5e-accc-7d3218147994','Completed','2025-11-23 06:48:19.291','2025-11-23 06:48:43.968','6740f755-62da-453d-b522-2da4a43e8d6e','phamtienanh815@gmail.com','Phạm Tiến Anh',100000),('cmibv2gg20001k47o9akquczb','19e9b70f-1748-4e5e-accc-7d3218147994','Pending','2025-11-23 15:16:42.818','2025-11-23 15:16:42.818',NULL,'phamtienanh815@gmail.com','Phạm Tiến Anh',56000),('cmieo3que0001k4mpns5mqu5z','96b2f0b3-7f63-47de-aad5-5c05683685b7','Completed','2025-11-25 14:25:04.166','2025-11-25 14:25:44.893',NULL,'chienthannodejs@gmail.com','Nguyễn Đức Sang',50000),('cmijup2bo0001k4lztpz04tls','2df2ef54-9555-4495-be80-a506910fd5f3','Completed','2025-11-29 05:28:27.393','2025-11-29 05:33:14.812',NULL,'phama9162@gmail.com','PHAM TIEN ANH',50000),('cmixgr1s80001k4s45xd6scbm','2df2ef54-9555-4495-be80-a506910fd5f3','Pending','2025-12-08 18:06:51.848','2025-12-08 18:06:51.848',NULL,'phama9162@gmail.com','PHAM TIEN ANH',130000),('cmixgyrtf0003k4s47gt48zkg','2df2ef54-9555-4495-be80-a506910fd5f3','Pending','2025-12-08 18:12:52.179','2025-12-08 18:13:09.114',NULL,'phama9162@gmail.com','PHAM TIEN ANH',130000),('cmixh5bul0001k4o23io2cz9h','2df2ef54-9555-4495-be80-a506910fd5f3','Cancel','2025-12-08 18:17:58.077','2025-12-08 18:18:23.238','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','PHAM TIEN ANH',125000),('cmixk9yck0003k4o2meyfgulb','2df2ef54-9555-4495-be80-a506910fd5f3','Completed','2025-12-08 19:45:32.708','2025-12-08 19:46:05.048','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','PHAM TIEN ANH',60000),('cmixkf8rx0005k4o2lsmd5mdh','96b2f0b3-7f63-47de-aad5-5c05683685b7','Completed','2025-12-08 19:49:39.501','2025-12-08 19:49:59.666','6740f755-62da-453d-b522-2da4a43e8d6e','chienthannodejs@gmail.com','Nguyễn Đức Sang',50000),('cmixkjyoh0007k4o2j3juuddm','6c22aa89-636a-41f9-91eb-4f920e45c4bd','Completed','2025-12-08 19:53:19.698','2025-12-08 19:54:00.713','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','Phạm Tiến Anh',240000),('cmj08z19i0001k4z633ockqk4','6c22aa89-636a-41f9-91eb-4f920e45c4bd','Completed','2025-12-10 16:52:26.022','2025-12-10 16:52:46.457','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','Phạm Tiến Anh',50000),('cmj0bpjgy0001k4qgc3hz49il','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Pending','2025-12-10 18:09:01.906','2025-12-10 18:09:01.906',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',1000),('cmj0bq91s0003k4qg5ug0k2jo','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-12-10 18:09:35.056','2025-12-10 18:10:54.462',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',1000),('cmj0c25f00005k4qgnjtnb6mp','a3da063e-db01-4ebe-8b07-b277be9f1076','Completed','2025-12-10 18:18:50.220','2025-12-10 18:19:19.087',NULL,'22110282@student.hcmute.edu.vn','Pham Tien Anh',1000),('cmj0e5uns0007k4qgu3a9gp16','96b2f0b3-7f63-47de-aad5-5c05683685b7','Completed','2025-12-10 19:17:42.135','2025-12-10 19:18:19.984',NULL,'chienthannodejs@gmail.com','Nguyễn Đức Sang',1000),('cmj0ek3mi0009k4qglzbg60qp','19e9b70f-1748-4e5e-accc-7d3218147994','Completed','2025-12-10 19:28:46.938','2025-12-10 19:29:03.079',NULL,'phamtienanh815@gmail.com','Phạm Tiến Anh',1000),('cmj1eg8250001k4e86eb4hm90','5c6fceef-7fe8-47cf-91d7-6a500362c83c','Completed','2025-12-11 12:13:32.237','2025-12-11 12:13:48.261','6740f755-62da-453d-b522-2da4a43e8d6e','anh.pt@geekup.vn','Phạm Tiến Anh',15000),('cmj8p3bw00001k40gwk194qvq','17c24a88-9abe-4142-aa8a-fdea4e32d51b','Pending','2025-12-16 14:45:49.680','2025-12-16 14:45:49.680','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','Phạm Tiến Anh',111000),('cmj8pg7pc0003k40g2d8cmm9n','17c24a88-9abe-4142-aa8a-fdea4e32d51b','Completed','2025-12-16 14:55:50.784','2025-12-16 14:56:20.955','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','Phạm Tiến Anh',241000),('cmj8pqje50001k410dzrypzqf','17665735-5597-4583-9e47-121b494bf41f','Completed','2025-12-16 15:03:52.493','2025-12-16 15:04:13.111','6740f755-62da-453d-b522-2da4a43e8d6e','phama9162@gmail.com','Phạm Tiến Anh',241000),('cmjlsiv0q0001k4uohr9689cb','0ea02ad2-211c-435e-857b-6178e7e7a9ed','Completed','2025-12-25 18:42:53.450','2025-12-25 18:43:56.422','6740f755-62da-453d-b522-2da4a43e8d6e','anh.pt@geekup.vn','Phạm Tiến Anh',110000),('cmjlsx69q0001k4z3w0r6xh9e','0ea02ad2-211c-435e-857b-6178e7e7a9ed','Pending','2025-12-25 18:54:01.214','2025-12-25 18:54:01.214',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',300000),('cmjlsxvw50003k4z30hpny3m5','0ea02ad2-211c-435e-857b-6178e7e7a9ed','Completed','2025-12-25 18:54:34.422','2025-12-25 18:54:55.470',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',130000),('cmjltews50001k4f1jkvuf576','1387188c-e7b6-49c0-b1fe-8dfb5f3e3092','Completed','2025-12-25 19:07:48.726','2025-12-25 19:08:33.050',NULL,'22110282@student.hcmute.edu.vn','t9tieanh',300000),('cmjm5wvcn0001k4ai6ooohqej','12d39987-3d04-4429-a4e5-e817ba16d6e1','Pending','2025-12-26 00:57:42.071','2025-12-26 00:57:42.071','6740f755-62da-453d-b522-2da4a43e8d6e','anh.pt@geekup.vn','Phạm Tiến Anh',0),('cmjm5xt0l0003k4ai6fxo8esp','12d39987-3d04-4429-a4e5-e817ba16d6e1','Pending','2025-12-26 00:58:25.702','2025-12-26 00:58:25.702','6740f755-62da-453d-b522-2da4a43e8d6e','anh.pt@geekup.vn','Phạm Tiến Anh',0),('cmjm64uiy0005k4ai885p373j','12d39987-3d04-4429-a4e5-e817ba16d6e1','Completed','2025-12-26 01:03:54.250','2025-12-26 01:04:11.762',NULL,'anh.pt@geekup.vn','Phạm Tiến Anh',1000);
/*!40000 ALTER TABLE `Order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Order_Item`
--

DROP TABLE IF EXISTS `Order_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Order_Item` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Order_Item_order_id_fkey` (`order_id`),
  CONSTRAINT `Order_Item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Order_Item`
--

LOCK TABLES `Order_Item` WRITE;
/*!40000 ALTER TABLE `Order_Item` DISABLE KEYS */;
INSERT INTO `Order_Item` VALUES ('0b24a39b-adf1-4e2e-8d8c-928c96f43b77','cmixkjyoh0007k4o2j3juuddm','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('0fc82d5e-2ce8-4eed-8d68-516beed96e32','cmj0e5uns0007k4qgu3a9gp16','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('1428f4cf-3a19-4b24-8f93-52fe0f8ec4b3','cmj1eg8250001k4e86eb4hm90','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3',20000),('1836fa3e-f359-44c8-b738-7b4d3ceba188','cmj0bq91s0003k4qg5ug0k2jo','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('1876e091-aa73-460f-888a-4808b6e05369','cmijup2bo0001k4lztpz04tls','cd753132-e625-45ac-9504-354d260f5a8d',50000),('22fb5d85-e8a8-4fb5-a050-e1d1cfd989f6','cmjlsxvw50003k4z30hpny3m5','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('25b6565e-fe91-4a37-a525-9f59b4fe66f6','cmj8pg7pc0003k40g2d8cmm9n','cd753132-e625-45ac-9504-354d260f5a8d',50000),('34b7e4ab-25ae-4ce2-8f10-da44c20fa660','cmj8p3bw00001k40gwk194qvq','cd753132-e625-45ac-9504-354d260f5a8d',50000),('3b2539e7-28b1-4473-baf9-f2ecb872e710','cmiaonzz50001k4b2ut2v75hk','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('45d2eae2-42ce-4038-8cfb-b423bc546a6c','cmiaorpok0003k4b2g066svge','fc716289-dd27-4d2b-8e1d-dc4af98307ce',56000),('487d1901-fd0d-4ee7-b4cd-efa96152aac2','cmibcmbin0001k4bmndrs35d0','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('48b7a466-dc5f-41fd-8b43-757b32dfe98a','cmj8pg7pc0003k40g2d8cmm9n','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('4ef54e91-276b-445d-9514-30469e1f59eb','cmj8pg7pc0003k40g2d8cmm9n','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('52e09258-c99f-46a4-932b-87da7a4e9133','cmj8pg7pc0003k40g2d8cmm9n','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('587f96dc-ac5d-4417-84d0-1baa6f10a13f','cmjm5xt0l0003k4ai6fxo8esp','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('5b9c6cfe-e192-4364-8e6a-48cd8f69077b','cmj8pqje50001k410dzrypzqf','cd753132-e625-45ac-9504-354d260f5a8d',50000),('5ed39a7f-4ca3-4fbc-8499-6f0a5769680c','cmj0ek3mi0009k4qglzbg60qp','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('6849cf7d-f823-4d6b-a6b0-111faff4e5fa','cmixkjyoh0007k4o2j3juuddm','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('6a4222fa-6cdf-4267-a986-c87592e32edc','cmjlsx69q0001k4z3w0r6xh9e','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3',300000),('6b9edd97-de78-4b97-841f-265ea216de59','cmibatb220003k4qucnwcpdvj','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('6c0a0fff-43e4-4ee9-a6b7-d4dabb0cd338','cmibcwnrv0001k4nx90hs32s0','cd753132-e625-45ac-9504-354d260f5a8d',50000),('6d1268e4-b6c9-4f24-88d9-ae206c2043a5','cmjlsiv0q0001k4uohr9689cb','cd753132-e625-45ac-9504-354d260f5a8d',50000),('716595fb-81e2-4615-8e6d-519e5663a61d','cmieo3que0001k4mpns5mqu5z','cd753132-e625-45ac-9504-354d260f5a8d',50000),('7867cc3a-0ae6-42b3-a7e6-0942e6d458a1','cmj08z19i0001k4z633ockqk4','d59648c2-6436-4994-8e9e-ab66f34b607d',55000),('7ab6423d-506e-47e1-8e1e-292224b1ca80','cmixkf8rx0005k4o2lsmd5mdh','d59648c2-6436-4994-8e9e-ab66f34b607d',55000),('7af4fa48-ca48-4c12-846e-038edd17664a','cmibanx1i0001k4quqorn8a2e','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('877586aa-8046-49e3-a15d-53d03a580560','cmia14stb0009k4ruxlt4dtow','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('9bcc84d7-b54f-4469-9dc7-0a36e161c0e8','cmixh5bul0001k4o23io2cz9h','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('9f01c42c-4aeb-42e2-a0a0-46043c56d77d','cmibcwnrv0001k4nx90hs32s0','d59648c2-6436-4994-8e9e-ab66f34b607d',55000),('a09f4ed9-6c22-4db4-8815-fdc57bcaab1c','cmjlsiv0q0001k4uohr9689cb','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('a8c8067a-bbc9-4afa-8508-9f59897456c4','cmjltews50001k4f1jkvuf576','512cf4b7-4f5f-4fdf-a37e-e89b5794d9b3',300000),('a9c0c352-f3da-45af-9698-9815b981850f','cmixkjyoh0007k4o2j3juuddm','cd753132-e625-45ac-9504-354d260f5a8d',50000),('b3297dd0-9237-46fe-a456-4bed141f821d','cmiaorpok0003k4b2g066svge','d59648c2-6436-4994-8e9e-ab66f34b607d',55000),('b41c25c9-8eab-4b24-a708-5aaf2c067e3b','cmixk9yck0003k4o2meyfgulb','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('c8d3ed3f-52ef-4870-852a-5c122903565e','cmjm5wvcn0001k4ai6ooohqej','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('c93b8210-22b8-455c-9d38-caa530d1a83c','cmixgr1s80001k4s45xd6scbm','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('d011b9df-17ef-456a-8822-b1d6cfd0d6ea','cmj0bpjgy0001k4qgc3hz49il','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('d43197b1-9528-474e-9ad9-fd8adcde24c8','cmj8p3bw00001k40gwk194qvq','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('d757e8df-051e-4bfb-8363-9c4c99f05c0b','cmj8p3bw00001k40gwk194qvq','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('d9995bb3-8432-4d66-882f-51eabd833835','cmj8pqje50001k410dzrypzqf','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('df5ad014-de25-420d-bb74-7f62c97f3685','cmj8pqje50001k410dzrypzqf','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('e1fabef0-fffe-4e43-8139-53c4541df2b3','cmia99e49000fk4ru00nuo6oo','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('e7823143-c570-4f3f-a144-af5b7ac37d5f','cmia1cbhv000bk4ruhvaz6ymz','cd753132-e625-45ac-9504-354d260f5a8d',50000),('eabaada8-37c5-4e27-be2a-7ae5431847b3','cmia99224000dk4rueecwe07g','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('f20d2f24-b5db-4fbd-8a4c-27f070bdea05','cmj0c25f00005k4qgnjtnb6mp','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000),('f3754a26-5638-44a7-aeea-88248b8c4670','cmibv2gg20001k47o9akquczb','fc716289-dd27-4d2b-8e1d-dc4af98307ce',56000),('f3d27633-222c-48b0-93c5-9c1cd4215463','cmixgyrtf0003k4s47gt48zkg','c62c894b-76a9-48a4-8713-3f74f93a3746',130000),('fc628cb5-83f9-42d0-a377-a907ba4461e7','cmj8pqje50001k410dzrypzqf','a6b534e1-6984-4846-b214-d3fe6779aa07',65000),('fd1fb6ed-34be-4050-8956-794b9c368e8b','cmjm64uiy0005k4ai885p373j','f4018410-e6eb-4687-bb94-61ceb1ed4493',1000);
/*!40000 ALTER TABLE `Order_Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payment`
--

DROP TABLE IF EXISTS `Payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payment` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` double NOT NULL,
  `method` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Payment_order_id_key` (`order_id`),
  CONSTRAINT `Payment_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `Order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payment`
--

LOCK TABLES `Payment` WRITE;
/*!40000 ALTER TABLE `Payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('06e17ec8-42ac-44d6-a6fe-e95effe5e8bc','55011a007d946d50cfe74cc39c68d3b3b82e6c3ea6789c6e593be9978c39abdf','2025-11-13 09:32:00.523','20251113093033_init',NULL,NULL,'2025-11-13 09:32:00.498',1),('21342179-c498-412c-8dfb-811150cc7551','c2ee214708748a45bbb3dffd3f830f654363c39c940e296b8d928d7f09e20eca','2025-11-13 09:32:00.497','20251107150905_init',NULL,NULL,'2025-11-13 09:32:00.467',1),('96cf33a0-6fae-4bdd-934d-9945327f7ff0','c4266dd291b819e833155e91a5813609953a66bc9e2919100c3fb9fc390f9f8b','2025-11-13 09:32:00.420','20251105083453_init',NULL,NULL,'2025-11-13 09:32:00.410',1),('a0ecc6b0-a16a-4376-bb90-7a90dadeba3e','0b92f887a0b3707d1c960d4234b67bad08ea91b7b6bdad2aafb3934b8944f2bf','2025-11-13 09:32:00.409','20251104052904_init',NULL,NULL,'2025-11-13 09:32:00.286',1),('b4bdc1b6-68e0-45a3-b2b9-7e03d7fd1f11','a441803fc3def9d809b0bcfd65918e34df3e20a1da143f304c626e79069667eb','2025-11-13 09:32:00.438','20251105095438_init',NULL,NULL,'2025-11-13 09:32:00.421',1),('b5ef1171-1f56-49f3-87d6-1c51dd49c314','417903b8eaddbfaf84e53cd2310a083684c03c8e4bce5219d7ee0dc35cf0a8e9','2025-11-13 09:32:00.465','20251107133819_add_order_status',NULL,NULL,'2025-11-13 09:32:00.439',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-08 22:23:58
