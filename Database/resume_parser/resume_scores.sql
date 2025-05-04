-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: resume-parser
-- ------------------------------------------------------
-- Server version    8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `resume_scores`
--

DROP TABLE IF EXISTS `resume_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;

CREATE TABLE `resume_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `resume_id` int NOT NULL,
  `criteria_id` int NOT NULL,
  `total_score` decimal(5,2) NOT NULL,
  `skills_score` decimal(5,2) NOT NULL,
  `experience_score` decimal(5,2) NOT NULL,
  `keyword_score` decimal(5,2) NOT NULL,
  `missing_skills` json DEFAULT NULL,
  `matching_skills` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_resume_id` (`resume_id`),
  KEY `fk_criteria_id` (`criteria_id`),
  CONSTRAINT `fk_criteria_id` FOREIGN KEY (`criteria_id`) REFERENCES `criteria_sets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_resume_id` FOREIGN KEY (`resume_id`) REFERENCES `resumes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_scores`
--

LOCK TABLES `resume_scores` WRITE;
/*!40000 ALTER TABLE `resume_scores` DISABLE KEYS */;

INSERT INTO `resume_scores` 
(`resume_id`, `criteria_id`, `total_score`, `skills_score`, `experience_score`, `keyword_score`, `missing_skills`, `matching_skills`)
VALUES
(1, 1, 85.50, 30.00, 40.00, 15.50, '["Leadership", "Agile"]', '["HRIS", "Recruitment"]'),
(2, 2, 68.75, 25.00, 30.00, 13.75, '["Redux"]', '["React", "TypeScript"]');

/*!40000 ALTER TABLE `resume_scores` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-04
