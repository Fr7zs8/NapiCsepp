-- phpMyAdmin SQL Dump (Docker-barát változat)
-- Host: 127.0.0.1
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `napicsepp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;

USE napicsepp;

-- ========================================================
-- FUNCTIONS
-- ========================================================
DELIMITER $$

CREATE FUNCTION `pwd_encrypt` (`pwd` VARCHAR(100)) RETURNS VARCHAR(255) DETERMINISTIC
BEGIN
    RETURN SHA2(CONCAT(pwd,'sozas'),256);
END$$

CREATE FUNCTION `login` (`email` VARCHAR(100), `pwd` VARCHAR(100)) RETURNS INT(11) DETERMINISTIC
BEGIN
    DECLARE ok INT DEFAULT 0;
    SELECT user_id INTO ok FROM users WHERE users.email = email COLLATE utf8mb4_hungarian_ci AND users.password = pwd_encrypt(pwd);
    RETURN ok;
END$$

DELIMITER ;

-- ========================================================
-- TABLES
-- ========================================================

CREATE TABLE `types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `difficulties` (
  `difficulty_id` int(11) NOT NULL AUTO_INCREMENT,
  `difficulty_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`difficulty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `activities` (
  `activity_id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_name` varchar(255) DEFAULT NULL,
  `activity_type_id` int(11) DEFAULT NULL,
  `activity_difficulty_id` int(11) DEFAULT NULL,
  `activity_achive` int(11) DEFAULT NULL,
  `activity_start_date` date DEFAULT NULL,
  `activity_end_date` date DEFAULT NULL,
  PRIMARY KEY (`activity_id`),
  KEY `activity_type_id` (`activity_type_id`),
  KEY `activity_difficulty_id` (`activity_difficulty_id`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`activity_type_id`) REFERENCES `types` (`type_id`) ON DELETE CASCADE,
  CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`activity_difficulty_id`) REFERENCES `difficulties` (`difficulty_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `register_date` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL AUTO_INCREMENT,
  `event_name` varchar(255) DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `event_end_time` datetime DEFAULT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `users_activities` (
  `user_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  KEY `user_id` (`user_id`),
  KEY `activity_id` (`activity_id`),
  CONSTRAINT `users_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `users_activities_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE `users_events` (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `users_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `users_events_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ========================================================
-- TRIGGERS
-- ========================================================
DELIMITER $$

CREATE TRIGGER `insert_user` BEFORE INSERT ON `users`
FOR EACH ROW
BEGIN
    SET NEW.password = pwd_encrypt(NEW.password);
END$$

DELIMITER ;

-- ========================================================
-- INSERT DATA
-- ========================================================

INSERT INTO `types` (`type_id`, `type_name`) VALUES
(1, 'Házimunka'),
(2, 'Tanulás'),
(3, 'Munka'),
(4, 'Szokás'),
(5, 'Mozgás');

INSERT INTO `difficulties` (`difficulty_id`, `difficulty_name`) VALUES
(1, 'Könnyű'),
(2, 'Közepes'),
(3, 'Nehéz');

INSERT INTO `activities` (`activity_id`, `activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`) VALUES
(1, 'Levinni a szemetet', 1, 1, 1, '2025-11-10', '2025-11-10'),
(2, 'Mosás', 1, 1, 0, '2025-11-12', '2025-11-12'),
(3, 'Angol tz tanulni', 2, 2, 1, '2025-11-01', '2025-11-01'),
(4, '2 liter viz', 4, 1, 0, '2025-12-01', '2025-12-30'),
(5, 'Diétá követés', 4, 3, 0, '2025-11-10', '2025-12-10'),
(6, 'Mosogatás', 1, 1, 1, '2026-01-02', '2026-01-02'),
(7, 'Mosogatás', 1, 1, 1, '2026-01-23', '2026-01-23'),
(8, 'Mosogatás', 1, 1, 1, '2026-01-25', '2026-01-25'),
(9, 'Mosogatás', 1, 1, 1, '2026-01-18', '2026-01-19');

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `language`, `role`, `register_date`) VALUES
(1, 'admin', 'admin@gmail.com', 'admin123', 'hu', 'admin', '2025-11-27 00:00:00'),
(2, 'Fruzsi', 'abcd@gmail.com', '1234', 'hu', 'user', '2025-11-27 00:00:00'),
(3, 'Abi', 'dcba@gmail.com', 'jelszo', 'hu', 'user', '2025-11-27 00:00:00');

INSERT INTO `events` (`event_id`, `event_name`, `event_start_time`, `event_end_time`) VALUES
(1, 'Anya szülinap', '2025-10-15 15:00:00', '2025-10-15 16:00:00'),
(2, 'Vezetés', '2025-11-20 15:00:00', '2025-11-20 16:40:00'),
(3, 'Nyaralás', '2025-06-25 08:00:00', '2025-07-01 16:00:00'),
(4, 'Baráti találka', '2026-01-23 15:00:00', '2026-01-23 16:00:00');

INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES
(2, 1),
(2, 3),
(2, 4),
(3, 2),
(3, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9);

INSERT INTO `users_events` (`user_id`, `event_id`) VALUES
(2, 1),
(2, 2),
(3, 3);

-- ========================================================
-- STORED PROCEDURES (DELIMITER $$)
-- ========================================================
DELIMITER $$

CREATE PROCEDURE `overview`()
BEGIN
    	SELECT
d.date,
  SUM(d.activity_count) AS activity_count,
  SUM(d.habit_count) AS habit_count,
  SUM(d.event_count) AS event_count
FROM (
  SELECT
    DATE_Format(a.activity_start_date , '%Y-%m-%d %H:%i')
     AS date,
    SUM(t.type_name <> 'Szokás') AS activity_count,
    SUM(t.type_name = 'Szokás') AS habit_count,
    0 AS event_count
  FROM activities a
  JOIN types t ON t.type_id = a.activity_type_id
  GROUP BY a.activity_start_date
 
  UNION ALL
 
  SELECT
    DATE_Format(e.event_start_time, '%Y-%m-%d %H:%i') AS date,
    0, 0,
    COUNT(*) AS event_count
  FROM events e
  GROUP BY DATE_Format(e.event_start_time, '%Y-%m-%d %H:%i')
) d
GROUP BY d.date
ORDER BY d.date;
End$$

CREATE PROCEDURE `pr_pullactivities` (IN `user_id` INT)
BEGIN
    SELECT activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive,
           DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date,
           DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date
    FROM activities
    JOIN types ON types.type_id = activities.activity_type_id
    JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id
    JOIN users_activities ON users_activities.activity_id = activities.activity_id
    JOIN users ON users.user_id = users_activities.user_id
    WHERE users.user_id = user_id;
END$$

CREATE PROCEDURE `pr_pullallusers` ()
BEGIN
    SELECT username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users;
END$$

CREATE PROCEDURE `pr_pullevent` (IN `user_id` INT)
BEGIN
    SELECT events.event_name,
           DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS event_start_time,
           DATE_FORMAT(events.event_end_time, '%Y-%m-%d %H:%i') AS event_end_time
    FROM events
    JOIN users_events ON users_events.event_id = events.event_id
    JOIN users ON users_events.user_id = users.user_id
    WHERE users.user_id = user_id;
END$$

CREATE PROCEDURE `pr_pullhabits` (IN `user_id` INT)
BEGIN
    SELECT activities.activity_name,
           DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date,
           DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date,
           activities.activity_achive, users.username, types.type_name, difficulties.difficulty_name
    FROM activities
    JOIN users_activities ON activities.activity_id = users_activities.activity_id
    JOIN users ON users.user_id = users_activities.user_id
    JOIN types ON activities.activity_type_id = types.type_id
    JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id
    WHERE users.user_id = user_id AND types.type_name LIKE 'szokas';
END$$

CREATE PROCEDURE `pr_pullprofile` (IN `user_id` INT)
BEGIN
    SELECT username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users
    WHERE users.user_id = user_id;
END$$

DELIMITER ;
