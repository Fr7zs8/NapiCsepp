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

CREATE TABLE `difficulties` (
  `difficulty_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `difficulty_name` varchar(50) DEFAULT NULL
);

CREATE TABLE `types` (
  `type_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `type_name` varchar(50) DEFAULT NULL
);

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `register_date` DATETIME DEFAULT NULL
);

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  `event_name` varchar(255) DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `event_end_time` datetime DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE `activities` (
    `activity_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    `activity_name` varchar(255) DEFAULT NULL,
    `activity_type_id` int(11) DEFAULT NULL,
    `activity_difficulty_id` int(11) DEFAULT NULL,
    `activity_achive` int(11) DEFAULT NULL,
    `activity_start_date` date DEFAULT NULL,
    `activity_end_date` date DEFAULT NULL,
    `progress_counter` int DEFAULT NULL,
    FOREIGN KEY (`activity_type_id`) REFERENCES `types`(`type_id`) ON DELETE CASCADE,
    FOREIGN KEY (`activity_difficulty_id`) REFERENCES `difficulties`(`difficulty_id`) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

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

INSERT INTO `difficulties` (`difficulty_id`, `difficulty_name`) VALUES
(1, 'Könnyű'),
(2, 'Közepes'),
(3, 'Nehéz');

INSERT INTO `types` (`type_id`, `type_name`) VALUES
(1, 'Házimunka'),
(2, 'Tanulás'),
(3, 'Munka'),
(4, 'Szokás'),
(5, 'Mozgás');

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `language`, `role`, `register_date`) VALUES
(1, 'admin', 'admin@gmail.com', 'admin123', 'hu', 'admin', '2025-11-27 00:00:00'),
(2, 'Fruzsi', 'abcd@gmail.com', '1234', 'hu', 'moderator', '2025-11-27 00:00:00'),
(3, 'Abi', 'dcba@gmail.com', 'jelszo', 'hu', 'moderator', '2025-11-27 00:00:00'),
(4, 'Teszt', "emptytest@gmail.com", '1234', 'hu', 'user', '2026-02-22 00:00:00');

INSERT INTO `events` (`event_id`, user_id,`event_name`, `event_start_time`, `event_end_time`) VALUES
(1, 2, 'Anya szülinap', '2025-10-15 15:00:00', '2025-10-15 16:00:00'),
(2, 2, 'Vezetés', '2025-11-20 15:00:00', '2025-11-20 16:40:00'),
(3, 3, 'Nyaralás', '2025-06-25 08:00:00', '2025-07-01 16:00:00');

INSERT INTO `activities` (`activity_id`, user_id, `activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`, `progress_counter`) VALUES
(1, 2, 'Levinni a szemetet', 1, 1, 1, '2025-11-10', '2025-11-10', 0),
(2, 2, 'Mosás', 1, 1, 0, '2025-11-12', '2025-11-12', 0),
(3, 2, 'Angol tz tanulni', 2, 2, 1, '2025-11-01', '2025-11-01', 0),
(4, 3, '2 liter viz', 4, 1, 0, '2025-12-01', '2025-12-30', 0),
(5, 3, 'Diétá követés', 4, 3, 0, '2025-11-10', '2025-12-10', 0);

-- ========================================================
-- STORED PROCEDURES (DELIMITER $$)
-- ========================================================
DELIMITER $$

CREATE PROCEDURE systemstatistic()
BEGIN
    SELECT 
        (SELECT COUNT(user_id) FROM users) AS total_users,
        (SELECT COUNT(activity_id) FROM activities WHERE CURDATE() BETWEEN DATE(activities.activity_start_date) AND DATE(activities.activity_end_date)) AS total_activity_today,
        (SELECT COUNT(activity_id) FROM activities) AS total_activity,
        (SELECT COUNT(a.activity_id) 
         FROM activities a 
         JOIN types t ON a.activity_type_id = t.type_id 
         WHERE t.type_name = 'szokás') AS total_habits;
END $$

CREATE PROCEDURE profile_statistic(IN p_user_id INT)
BEGIN
    SELECT
         (SELECT COUNT(a.activity_id)
         FROM activities a
         WHERE a.user_id = p_user_id
           AND CURDATE() BETWEEN DATE(a.activity_start_date) AND DATE(a.activity_end_date)) AS total_activity,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         WHERE a.user_id = p_user_id
           AND a.activity_achive = 1
           AND CURDATE() BETWEEN DATE(a.activity_start_date) AND DATE(a.activity_end_date)) AS completed,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         WHERE a.user_id = p_user_id
           AND a.activity_type_id != 4
           AND DATE(a.activity_start_date) = CURDATE()) AS daily_tasks_count,

        (SELECT COUNT(e.event_id)
         FROM events e
         WHERE e.user_id = p_user_id AND MONTH(e.event_start_time) = MONTH(CURDATE())) AS monthly_events_count,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         WHERE a.user_id = p_user_id
           AND d.difficulty_name = 'Nehéz'
           AND DATE(a.activity_start_date) = CURDATE()) AS hard_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         WHERE a.user_id = p_user_id
           AND d.difficulty_name = 'Közepes'
           AND DATE(a.activity_start_date) = CURDATE()) AS middle_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         WHERE a.user_id = p_user_id
           AND d.difficulty_name = 'Könnyű'
           AND DATE(a.activity_start_date) = CURDATE()) AS easy_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         WHERE a.user_id = p_user_id
           AND YEARWEEK(a.activity_start_date, 1) = YEARWEEK(CURDATE(), 1)) AS weekly_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         WHERE a.user_id = p_user_id
           AND YEARWEEK(a.activity_start_date, 1) = YEARWEEK(CURDATE(), 1)
           AND a.activity_achive = 1) AS weekly_tasks_completed;
END $$


CREATE PROCEDURE `overview`(IN p_user_id INT)
BEGIN
    SELECT
        summary.date,
        SUM(summary.activity_count) AS activity_count,
        SUM(summary.habit_count) AS habit_count,
        SUM(summary.event_count) AS event_count
    FROM (
        SELECT
            DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d %H:%i') AS date,
            SUM(types.type_name <> 'Szokás') AS activity_count,
            SUM(types.type_name = 'Szokás') AS habit_count,
            0 AS event_count
        FROM activities
        JOIN types ON types.type_id = activities.activity_type_id
        WHERE activities.user_id = p_user_id
        GROUP BY activities.activity_start_date

        UNION ALL
        
        SELECT
            DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS date,
            0 AS activity_count,
            0 AS habit_count,
            COUNT(*) AS event_count
        FROM events
        WHERE events.user_id = p_user_id
        GROUP BY DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i')
    ) AS summary
    GROUP BY summary.date
    ORDER BY summary.date;
END$$

CREATE PROCEDURE `pr_pullactivities` (IN `user_id` INT)
BEGIN
    SELECT activities.activity_id, activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive,
           DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date,
           DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date, activities.progress_counter
    FROM activities
    JOIN types ON types.type_id = activities.activity_type_id
    JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id
    WHERE activities.user_id = user_id;
END$$

CREATE PROCEDURE `pr_pullallusers` ()
BEGIN
    SELECT user_id, username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users;
END$$

CREATE PROCEDURE `pr_pullevent` (IN `user_id` INT)
BEGIN
    SELECT events.event_id, events.event_name,
           DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS event_start_time,
           DATE_FORMAT(events.event_end_time, '%Y-%m-%d %H:%i') AS event_end_time
    FROM events
    WHERE events.user_id = user_id;
END$$

CREATE PROCEDURE pr_pullhabits (IN p_user_id INT)
BEGIN
    SELECT 
        activities.activity_id, 
        activities.activity_name,
        DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date,
        DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date,
        activities.activity_achive, activities.progress_counter,
        users.username, 
        types.type_name, 
        difficulties.difficulty_name
    FROM activities
    JOIN users 
        ON users.user_id = activities.user_id
    JOIN types 
        ON activities.activity_type_id = types.type_id
    JOIN difficulties 
        ON difficulties.difficulty_id = activities.activity_difficulty_id
    WHERE users.user_id = p_user_id
      AND types.type_name = 'szokas';
END$$


CREATE PROCEDURE `pr_pullprofile` (IN `user_id` INT)
BEGIN
    SELECT user_id, username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users
    WHERE users.user_id = user_id;
END$$

DELIMITER ;

INSERT INTO activities (activity_id, user_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(6, 2, 'Napi vízfogyasztás', 4, 1, 0, '2025-09-01', '2025-09-07', 5),
(7, 2, 'Reggeli olvasás', 4, 2, 0, '2025-09-15', '2025-10-14', 20),
(8, 2, 'Esti meditáció', 4, 1, 0, '2025-10-01', '2025-10-07', 2),
(9, 2, 'Napi naplóírás', 4, 1, 0, '2025-11-01', '2026-10-31', 100),
(10, 2, 'Reggeli jóga', 4, 2, 0, '2025-12-01', '2026-11-30', 80);

INSERT INTO activities (activity_id, user_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(11, 2, 'Szoba takarítás', 1, 1, 1, '2026-02-20', '2026-02-20', 1),
(12, 2, 'Mosás', 1, 1, 0, '2026-02-20', '2026-02-20', 0),
(13, 2, 'Matek vizsga', 2, 3, 1, '2026-02-20', '2026-02-20', 1),
(14, 2, 'Projekt leadás', 3, 3, 0, '2026-02-21', '2026-02-21', 0),
(15, 2, 'Reggeli futás 3km', 5, 2, 1, '2026-02-21', '2026-02-21', 1),
(16, 2, 'Angol gyakorlás', 2, 2, 0, '2026-02-21', '2026-02-21', 0),
(17, 2, 'Mosogatás', 1, 1, 1, '2026-02-22', '2026-02-22', 1),
(18, 2, 'Heti riport készítés', 3, 2, 0, '2026-02-22', '2026-02-22', 0),
(19, 2, 'Futás 5km', 5, 3, 1, '2026-02-22', '2026-02-22', 1),
(20, 2, 'Mosogatás', 1, 1, 1, '2026-03-11', '2026-03-11', 1),
(21, 2, 'Munka – heti összegzés', 3, 2, 0, '2026-03-11', '2026-03-11', 0),
(22, 2, 'Futás 3km', 5, 1, 1, '2026-03-11', '2026-03-11', 1),
(23, 2, 'Porszívózás', 1, 1, 1, '2026-03-09', '2026-03-09', 1),
(24, 2, 'Tanulás – jegyzetelés', 2, 2, 0, '2026-03-09', '2026-03-09', 0),
(25, 2, 'Munka – email válaszok', 3, 1, 1, '2026-03-08', '2026-03-08', 1),
(26, 2, 'Futás 4km', 5, 2, 1, '2026-03-08', '2026-03-08', 1),
(27, 2, 'Mosás', 1, 1, 0, '2026-03-06', '2026-03-06', 0),
(28, 2, 'Tanulás – Python gyakorlás', 2, 3, 1, '2026-03-05', '2026-03-05', 1),
(29, 2, 'Konyha takarítás', 1, 2, 0, '2026-03-05', '2026-03-05', 0),
(30, 2, 'Futás 5km', 5, 2, 1, '2026-03-04', '2026-03-04', 1),
(31, 2, 'Tanulás – matek feladatok', 2, 3, 1, '2026-03-02', '2026-03-02', 1),
(32, 2, 'Munka – backlog rendezés', 3, 2, 0, '2026-03-02', '2026-03-02', 0),
(33, 2, 'Porszívózás', 1, 1, 1, '2026-03-01', '2026-03-01', 1),
(34, 2, 'Futás 6km', 5, 3, 1, '2026-02-28', '2026-02-28', 1),
(35, 2, 'Munka – riport készítés', 3, 2, 0, '2026-02-28', '2026-02-28', 0),
(36, 2, 'Mosás', 1, 1, 1, '2026-02-27', '2026-02-27', 1),
(37, 2, 'Tanulás – angol szavak', 2, 2, 0, '2026-02-26', '2026-02-26', 0),
(38, 2, 'Futás 3km', 5, 1, 1, '2026-02-26', '2026-02-26', 1),
(39, 2, 'Munka – meeting jegyzet', 3, 1, 0, '2026-02-25', '2026-02-25', 0),
(40, 2, 'Mosogatás', 1, 1, 1, '2026-02-24', '2026-02-24', 1),
(41, 2, 'Futás 4km', 5, 2, 1, '2026-02-23', '2026-02-23', 1),
(42, 2, 'Tanulás – fizika', 2, 3, 1, '2026-02-22', '2026-02-22', 1),
(43, 2, 'Munka – email tisztítás', 3, 1, 1, '2026-02-20', '2026-02-20', 1),
(44, 2, 'Futás 5km', 5, 2, 1, '2026-02-19', '2026-02-19', 1),
(45, 2, 'Tanulás – jegyzet átnézés', 2, 2, 0, '2026-02-18', '2026-02-18', 0),
(46, 2, 'Porszívózás', 1, 1, 1, '2026-02-17', '2026-02-17', 1),
(47, 2, 'Munka – prezentáció készítés', 3, 3, 0, '2026-02-16', '2026-02-16', 0),
(48, 2, 'Futás 3km', 5, 1, 1, '2026-02-15', '2026-02-15', 1),
(49, 2, 'Mosogatás', 1, 1, 1, '2026-02-14', '2026-02-14', 1),
(50, 2, 'Tanulás – programozás', 2, 3, 1, '2026-02-13', '2026-02-13', 1),
(51, 2, 'Munka – heti tervezés', 3, 2, 0, '2026-02-12', '2026-02-12', 0),
(52, 2, 'Futás 4km', 5, 2, 1, '2026-02-11', '2026-02-11', 1),
(53, 2, 'Mosás', 1, 1, 0, '2026-02-10', '2026-02-10', 0),
(54, 2, 'Tanulás – angol beszéd', 2, 2, 1, '2026-02-09', '2026-02-09', 1),
(55, 2, 'Munka – riport frissítés', 3, 2, 1, '2026-02-08', '2026-02-08', 1),
(56, 2, 'Futás 6km', 5, 3, 1, '2026-02-07', '2026-02-07', 1),
(57, 2, 'Porszívózás', 1, 1, 1, '2026-02-06', '2026-02-06', 1),
(58, 2, 'Tanulás – matek gyakorlás', 2, 3, 0, '2026-02-05', '2026-02-05', 0),
(59, 2, 'Munka – email válaszok', 3, 1, 1, '2026-02-04', '2026-02-04', 1),
(60, 2, 'Futás 3km', 5, 1, 1, '2026-02-03', '2026-02-03', 1),
(61, 2, 'Mosogatás', 1, 1, 0, '2026-02-02', '2026-02-02', 0),
(62, 2, 'Tanulás – földrajz', 2, 2, 1, '2026-02-01', '2026-02-01', 1),
(63, 2, 'Munka – dokumentum szerkesztés', 3, 2, 0, '2026-01-30', '2026-01-30', 0),
(64, 2, 'Futás 5km', 5, 2, 1, '2026-01-29', '2026-01-29', 1),
(65, 2, 'Mosás', 1, 1, 1, '2026-01-28', '2026-01-28', 1),
(66, 2, 'Tanulás – történelem', 2, 2, 0, '2026-01-27', '2026-01-27', 0),
(67, 2, 'Munka – prezentáció frissítés', 3, 2, 1, '2026-01-26', '2026-01-26', 1),
(68, 2, 'Futás 4km', 5, 2, 1, '2026-01-25', '2026-01-25', 1),
(69, 2, 'Porszívózás', 1, 1, 1, '2026-01-24', '2026-01-24', 1);

INSERT INTO `events` (`event_id`, user_id, `event_name`, `event_start_time`, `event_end_time`) VALUES
(5, 2, 'Fogorvos', '2026-02-28 10:00:00', '2026-02-28 10:30:00'), 
(6, 2, 'Hétvégi bevásárlás', '2026-02-24 17:00:00', '2026-02-24 18:00:00'),
(7, 2, 'Edzés – konditerem', '2026-02-21 19:00:00', '2026-02-21 20:15:00'),
(8, 2, 'Munka meeting', '2026-02-18 09:00:00', '2026-02-18 10:00:00'),
(9, 2, 'Baráti vacsora', '2026-02-14 18:30:00', '2026-02-14 21:00:00'),
(10, 2, 'Autószerelő – olajcsere', '2026-02-10 14:00:00', '2026-02-10 15:00:00'),
(11, 2, 'Családi ebéd', '2026-02-02 12:00:00', '2026-02-02 14:00:00'),
(12, 2, 'Orvosi kontroll', '2026-01-27 08:30:00', '2026-01-27 09:00:00'),
(13, 2, 'Mozizás', '2026-01-20 20:00:00', '2026-01-20 22:10:00'),
(14, 2, 'Havi nagybevásárlás', '2026-01-12 17:00:00', '2026-01-12 18:30:00'),
(15, 2, 'Szülinapi buli', '2026-01-05 19:00:00', '2026-01-05 23:30:00');

INSERT INTO activities (activity_id, user_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(70, 3,  'Porszívózás',               1, 1, 1, '2025-09-01', '2025-09-01', 1),
(71, 3,  'Tanulás – SQL alapok',      2, 2, 1, '2025-09-02', '2025-09-02', 1),
(72, 3,  'Futás 3km',                 5, 1, 1, '2025-09-03', '2025-09-03', 1),
(73, 3,  'Munka – riport készítés',   3, 2, 0, '2025-09-04', '2025-09-04', 0),
(74, 3,  'Mosogatás',                 1, 1, 1, '2025-09-05', '2025-09-05', 1),
(75, 3,  'Napi séta 30 perc',         4, 1, 0, '2025-09-01', '2025-09-30', 20),
(76, 3,  'Tanulás – React alapok',    2, 3, 1, '2025-09-08', '2025-09-08', 1),
(77, 3,  'Futás 5km',                 5, 2, 1, '2025-09-09', '2025-09-09', 1),
(78, 3,  'Mosás',                     1, 1, 0, '2025-09-10', '2025-09-10', 0),
(79, 3,  'Munka – meeting jegyzet',   3, 1, 1, '2025-09-11', '2025-09-11', 1),
(80, 3,  'Konyha takarítás',          1, 2, 1, '2025-09-12', '2025-09-12', 1),
(81, 3,  'Tanulás – angol nyelvtan',  2, 2, 0, '2025-09-15', '2025-09-15', 0),
(82, 3,  'Futás 4km',                 5, 2, 1, '2025-09-16', '2025-09-16', 1),
(83, 3,  'Munka – backlog rendezés',  3, 2, 0, '2025-09-17', '2025-09-17', 0),
(84, 3,  'Szoba takarítás',           1, 1, 1, '2025-09-18', '2025-09-18', 1),
(85, 3,  'Reggeli olvasás',           4, 1, 0, '2025-09-15', '2025-10-14', 15),
(86, 3,  'Tanulás – JavaScript',      2, 3, 1, '2025-09-20', '2025-09-20', 1),
(87, 3,  'Futás 6km',                 5, 3, 1, '2025-09-22', '2025-09-22', 1),
(88, 3,  'Mosogatás',                 1, 1, 1, '2025-09-24', '2025-09-24', 1),
(89, 3,  'Munka – prezentáció',       3, 3, 0, '2025-09-25', '2025-09-25', 0),
(90, 3,  'Porszívózás',               1, 1, 1, '2025-09-28', '2025-09-28', 1),
(91, 3,  'Tanulás – Python alapok',   2, 2, 1, '2025-10-01', '2025-10-01', 1),
(92, 3,  'Futás 3km',                 5, 1, 1, '2025-10-02', '2025-10-02', 1),
(93, 3,  'Mosás',                     1, 1, 0, '2025-10-03', '2025-10-03', 0),
(94, 3,  'Munka – email válaszok',    3, 1, 1, '2025-10-06', '2025-10-06', 1),
(95, 3,  'Konyha takarítás',          1, 2, 1, '2025-10-07', '2025-10-07', 1),
(96, 3,  'Napi meditáció',            4, 1, 0, '2025-10-01', '2025-10-31', 18),
(97, 3,  'Tanulás – adatbázisok',     2, 3, 1, '2025-10-09', '2025-10-09', 1),
(98, 3,  'Futás 5km',                 5, 2, 1, '2025-10-10', '2025-10-10', 1),
(99, 3,  'Munka – dokumentáció',      3, 2, 0, '2025-10-13', '2025-10-13', 0),
(100, 3, 'Szoba takarítás',           1, 1, 1, '2025-10-14', '2025-10-14', 1),
(101, 3, 'Tanulás – TypeScript',      2, 3, 1, '2025-10-16', '2025-10-16', 1),
(102, 3, 'Futás 4km',                 5, 2, 0, '2025-10-17', '2025-10-17', 0),
(103, 3, 'Mosogatás',                 1, 1, 1, '2025-10-20', '2025-10-20', 1),
(104, 3, 'Munka – heti tervezés',     3, 2, 1, '2025-10-21', '2025-10-21', 1),
(105, 3, 'Porszívózás',               1, 1, 1, '2025-10-23', '2025-10-23', 1),
(106, 3, 'Tanulás – Node.js',         2, 2, 0, '2025-10-24', '2025-10-24', 0),
(107, 3, 'Futás 6km',                 5, 3, 1, '2025-10-27', '2025-10-27', 1),
(108, 3, 'Munka – riport frissítés',  3, 2, 1, '2025-10-28', '2025-10-28', 1),
(109, 3, 'Mosás',                     1, 1, 0, '2025-10-30', '2025-10-30', 0),
(110, 3, 'Tanulás – CSS haladó',      2, 2, 1, '2025-11-03', '2025-11-03', 1),
(111, 3, 'Futás 3km',                 5, 1, 1, '2025-11-04', '2025-11-04', 1),
(112, 3, 'Munka – standup jegyzet',   3, 1, 1, '2025-11-05', '2025-11-05', 1),
(113, 3, 'Mosogatás',                 1, 1, 0, '2025-11-06', '2025-11-06', 0),
(114, 3, 'Konyha takarítás',          1, 2, 1, '2025-11-07', '2025-11-07', 1),
(115, 3, 'Napi vízfogyasztás 2L',     4, 1, 0, '2025-11-01', '2025-11-30', 22),
(116, 3, 'Tanulás – Docker',          2, 3, 1, '2025-11-10', '2025-11-10', 1),
(117, 3, 'Futás 5km',                 5, 2, 1, '2025-11-11', '2025-11-11', 1),
(118, 3, 'Szoba takarítás',           1, 1, 1, '2025-11-13', '2025-11-13', 1),
(119, 3, 'Munka – backlog átnézés',   3, 2, 0, '2025-11-14', '2025-11-14', 0),
(120, 3, 'Porszívózás',               1, 1, 1, '2025-11-17', '2025-11-17', 1),
(121, 3, 'Tanulás – Git haladó',      2, 2, 1, '2025-11-18', '2025-11-18', 1),
(122, 3, 'Futás 4km',                 5, 2, 0, '2025-11-19', '2025-11-19', 0),
(123, 3, 'Mosás',                     1, 1, 1, '2025-11-21', '2025-11-21', 1),
(124, 3, 'Munka – email tisztítás',   3, 1, 1, '2025-11-24', '2025-11-24', 1),
(125, 3, 'Tanulás – REST API-k',      2, 3, 0, '2025-11-25', '2025-11-25', 0),
(126, 3, 'Futás 6km',                 5, 3, 1, '2025-11-27', '2025-11-27', 1),
(127, 3, 'Mosogatás',                 1, 1, 1, '2025-11-28', '2025-11-28', 1),
(128, 3, 'Munka – éves összefoglaló', 3, 3, 0, '2025-12-01', '2025-12-01', 0),
(129, 3, 'Futás 3km',                 5, 1, 1, '2025-12-02', '2025-12-02', 1),
(130, 3, 'Tanulás – Express.js',      2, 2, 1, '2025-12-03', '2025-12-03', 1),
(131, 3, 'Porszívózás',               1, 1, 1, '2025-12-04', '2025-12-04', 1),
(132, 3, 'Napi jóga 15 perc',         4, 2, 0, '2025-12-01', '2025-12-31', 24),
(133, 3, 'Konyha takarítás',          1, 2, 0, '2025-12-05', '2025-12-05', 0),
(134, 3, 'Futás 5km',                 5, 2, 1, '2025-12-08', '2025-12-08', 1),
(135, 3, 'Tanulás – Cypress tesztek', 2, 3, 1, '2025-12-09', '2025-12-09', 1),
(136, 3, 'Munka – sprint review',     3, 2, 1, '2025-12-10', '2025-12-10', 1),
(137, 3, 'Mosogatás',                 1, 1, 1, '2025-12-11', '2025-12-11', 1),
(138, 3, 'Szoba takarítás',           1, 1, 0, '2025-12-12', '2025-12-12', 0),
(139, 3, 'Futás 4km',                 5, 2, 1, '2025-12-15', '2025-12-15', 1),
(140, 3, 'Tanulás – MongoDB',         2, 3, 0, '2025-12-16', '2025-12-16', 0),
(141, 3, 'Munka – heti riport',       3, 2, 1, '2025-12-17', '2025-12-17', 1),
(142, 3, 'Mosás',                     1, 1, 1, '2025-12-18', '2025-12-18', 1),
(143, 3, 'Porszívózás',               1, 1, 1, '2025-12-22', '2025-12-22', 1),
(144, 3, 'Futás 6km',                 5, 3, 1, '2025-12-23', '2025-12-23', 1),
(145, 3, 'Munka – éves zárás',        3, 3, 0, '2025-12-29', '2025-12-29', 0),
(146, 3, 'Tanulás – React Router',    2, 2, 1, '2026-01-05', '2026-01-05', 1),
(147, 3, 'Futás 3km',                 5, 1, 1, '2026-01-06', '2026-01-06', 1),
(148, 3, 'Mosogatás',                 1, 1, 1, '2026-01-07', '2026-01-07', 1),
(149, 3, 'Munka – sprint planning',   3, 2, 0, '2026-01-08', '2026-01-08', 0),
(150, 3, 'Konyha takarítás',          1, 2, 1, '2026-01-09', '2026-01-09', 1),
(151, 3, 'Napi naplóírás',            4, 1, 0, '2026-01-01', '2026-01-31', 25),
(152, 3, 'Tanulás – Vite',            2, 2, 1, '2026-01-12', '2026-01-12', 1),
(153, 3, 'Futás 5km',                 5, 2, 1, '2026-01-13', '2026-01-13', 1),
(154, 3, 'Szoba takarítás',           1, 1, 0, '2026-01-14', '2026-01-14', 0),
(155, 3, 'Munka – dokumentáció',      3, 2, 1, '2026-01-15', '2026-01-15', 1),
(156, 3, 'Mosás',                     1, 1, 1, '2026-01-16', '2026-01-16', 1),
(157, 3, 'Tanulás – JWT auth',        2, 3, 1, '2026-01-19', '2026-01-19', 1),
(158, 3, 'Futás 4km',                 5, 2, 0, '2026-01-20', '2026-01-20', 0),
(159, 3, 'Porszívózás',               1, 1, 1, '2026-01-22', '2026-01-22', 1),
(160, 3, 'Munka – code review',       3, 2, 1, '2026-01-23', '2026-01-23', 1),
(161, 3, 'Futás 6km',                 5, 3, 1, '2026-01-26', '2026-01-26', 1),
(162, 3, 'Tanulás – unit tesztek',    2, 3, 0, '2026-01-27', '2026-01-27', 0),
(163, 3, 'Mosogatás',                 1, 1, 1, '2026-01-29', '2026-01-29', 1),
(164, 3, 'Munka – sprint retro',      3, 1, 1, '2026-02-02', '2026-02-02', 1),
(165, 3, 'Futás 3km',                 5, 1, 1, '2026-02-03', '2026-02-03', 1),
(166, 3, 'Tanulás – CSS Grid',        2, 2, 1, '2026-02-04', '2026-02-04', 1),
(167, 3, 'Mosogatás',                 1, 1, 0, '2026-02-05', '2026-02-05', 0),
(168, 3, 'Konyha takarítás',          1, 2, 1, '2026-02-06', '2026-02-06', 1),
(169, 3, 'Napi stretching',           4, 1, 0, '2026-02-01', '2026-02-28', 20),
(170, 3, 'Futás 5km',                 5, 2, 1, '2026-02-09', '2026-02-09', 1),
(171, 3, 'Tanulás – Tailwind CSS',    2, 2, 0, '2026-02-10', '2026-02-10', 0),
(172, 3, 'Munka – backlog grooming',  3, 2, 1, '2026-02-11', '2026-02-11', 1),
(173, 3, 'Porszívózás',               1, 1, 1, '2026-02-12', '2026-02-12', 1),
(174, 3, 'Szoba takarítás',           1, 1, 1, '2026-02-13', '2026-02-13', 1),
(175, 3, 'Futás 4km',                 5, 2, 1, '2026-02-16', '2026-02-16', 1),
(176, 3, 'Tanulás – SQL haladó',      2, 3, 1, '2026-02-17', '2026-02-17', 1),
(177, 3, 'Mosás',                     1, 1, 0, '2026-02-18', '2026-02-18', 0),
(178, 3, 'Munka – deploy script',     3, 3, 0, '2026-02-19', '2026-02-19', 0),
(179, 3, 'Futás 6km',                 5, 3, 1, '2026-02-23', '2026-02-23', 1),
(180, 3, 'Tanulás – GraphQL',         2, 3, 0, '2026-02-24', '2026-02-24', 0),
(181, 3, 'Mosogatás',                 1, 1, 1, '2026-02-25', '2026-02-25', 1),
(182, 3, 'Munka – heti összegzés',    3, 2, 1, '2026-02-26', '2026-02-26', 1),
(183, 3, 'Futás 3km',                 5, 1, 1, '2026-03-02', '2026-03-02', 1),
(184, 3, 'Tanulás – Docker Compose',  2, 3, 1, '2026-03-03', '2026-03-03', 1),
(185, 3, 'Konyha takarítás',          1, 2, 0, '2026-03-04', '2026-03-04', 0),
(186, 3, 'Munka – standup jegyzet',   3, 1, 1, '2026-03-05', '2026-03-05', 1),
(187, 3, 'Napi víz 2.5L',            4, 1, 0, '2026-03-01', '2026-03-31', 10),
(188, 3, 'Futás 5km',                 5, 2, 1, '2026-03-09', '2026-03-09', 1),
(189, 3, 'Tanulás – CI/CD pipeline',  2, 3, 0, '2026-03-10', '2026-03-10', 0),
(190, 3, 'Mosogatás',                 1, 1, 1, '2026-03-11', '2026-03-11', 1),
(191, 3, 'Szoba takarítás',           1, 1, 1, '2026-03-12', '2026-03-12', 1),
(192, 3, 'Futás 4km',                 5, 2, 1, '2026-03-16', '2026-03-16', 1),
(193, 3, 'Munka – refactor',          3, 3, 0, '2026-03-17', '2026-03-17', 0),
(194, 3, 'Porszívózás',               1, 1, 1, '2026-03-19', '2026-03-19', 1),
(195, 3, 'Tanulás – Redis',           2, 3, 1, '2026-03-20', '2026-03-20', 1),
(196, 3, 'Futás 6km',                 5, 3, 1, '2026-03-23', '2026-03-23', 1),
(197, 3, 'Mosás',                     1, 1, 0, '2026-03-25', '2026-03-25', 0),
(198, 3, 'Munka – code review',       3, 2, 1, '2026-03-26', '2026-03-26', 1),
(199, 3, 'Tanulás – WebSocket',       2, 3, 1, '2026-04-01', '2026-04-01', 1),
(200, 3, 'Futás 3km',                 5, 1, 1, '2026-04-02', '2026-04-02', 1),
(201, 3, 'Mosogatás',                 1, 1, 1, '2026-04-03', '2026-04-03', 1),
(202, 3, 'Munka – planning',          3, 2, 0, '2026-04-06', '2026-04-06', 0),
(203, 3, 'Konyha takarítás',          1, 2, 1, '2026-04-07', '2026-04-07', 1),
(204, 3, 'Napi olvasás 20 perc',      4, 1, 0, '2025-04-01', '2025-04-30', 18),
(205, 3, 'Futás 5km',                 5, 2, 1, '2026-04-09', '2026-04-09', 1),
(206, 3, 'Tanulás – Linux alapok',    2, 2, 0, '2026-04-10', '2026-04-10', 0),
(207, 3, 'Porszívózás',               1, 1, 1, '2026-04-13', '2026-04-13', 1),
(208, 3, 'Munka – demo prep',         3, 2, 1, '2026-04-14', '2026-04-14', 1),
(209, 3, 'Futás 4km',                 5, 2, 1, '2026-04-16', '2026-04-16', 1),
(210, 3, 'Szoba takarítás',           1, 1, 0, '2026-04-17', '2026-04-17', 0),
(211, 3, 'Tanulás – Nginx',           2, 3, 1, '2026-04-20', '2026-04-20', 1),
(212, 3, 'Futás 6km',                 5, 3, 1, '2026-04-22', '2026-04-22', 1),
(213, 3, 'Mosás',                     1, 1, 1, '2026-04-24', '2026-04-24', 1),
(214, 3, 'Munka – retro',             3, 1, 1, '2026-04-28', '2026-04-28', 1),
(215, 3, 'Tanulás – Kubernetes',      2, 3, 0, '2026-05-04', '2026-05-04', 0),
(216, 3, 'Futás 3km',                 5, 1, 1, '2026-05-05', '2026-05-05', 1),
(217, 3, 'Mosogatás',                 1, 1, 1, '2026-05-06', '2026-05-06', 1),
(218, 3, 'Munka – sprint review',     3, 2, 1, '2026-05-07', '2026-05-07', 1),
(219, 3, 'Konyha takarítás',          1, 2, 0, '2026-05-08', '2026-05-08', 0);

INSERT INTO activities (activity_id, user_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(220, 3, 'Napi meditáció 10 perc',    4, 1, 0, '2025-05-01', '2025-05-31', 16),
(221, 3, 'Futás 5km',                 5, 2, 1, '2026-05-11', '2026-05-11', 1),
(222, 3, 'Tanulás – AWS alapok',      2, 3, 1, '2026-05-12', '2026-05-12', 1),
(223, 3, 'Porszívózás',               1, 1, 1, '2026-05-14', '2026-05-14', 1),
(224, 3, 'Munka – deploy',            3, 3, 0, '2026-05-15', '2026-05-15', 0),
(225, 3, 'Futás 4km',                 5, 2, 1, '2026-05-18', '2026-05-18', 1),
(226, 3, 'Szoba takarítás',           1, 1, 1, '2026-05-19', '2026-05-19', 1),
(227, 3, 'Tanulás – Firebase',        2, 2, 0, '2026-05-20', '2026-05-20', 0),
(228, 3, 'Futás 6km',                 5, 3, 1, '2026-05-22', '2026-05-22', 1),
(229, 3, 'Mosás',                     1, 1, 0, '2026-05-25', '2026-05-25', 0),
(230, 3, 'Munka – heti összegzés',    3, 2, 1, '2026-05-26', '2026-05-26', 1),
(231, 3, 'Tanulás – OAuth 2.0',       2, 3, 1, '2026-06-01', '2026-06-01', 1),
(232, 3, 'Futás 3km',                 5, 1, 1, '2026-06-02', '2026-06-02', 1),
(233, 3, 'Mosogatás',                 1, 1, 1, '2026-06-03', '2026-06-03', 1),
(234, 3, 'Munka – standup jegyzet',   3, 1, 0, '2026-06-04', '2026-06-04', 0),
(235, 3, 'Konyha takarítás',          1, 2, 1, '2026-06-05', '2026-06-05', 1),
(236, 3, 'Napi futás 2km',            4, 1, 0, '2025-06-01', '2025-06-30', 22),
(237, 3, 'Futás 5km',                 5, 2, 1, '2026-06-09', '2026-06-09', 1),
(238, 3, 'Tanulás – Prisma ORM',      2, 2, 1, '2026-06-10', '2026-06-10', 1),
(239, 3, 'Porszívózás',               1, 1, 0, '2026-06-11', '2026-06-11', 0),
(240, 3, 'Munka – refactor',          3, 3, 1, '2026-06-12', '2026-06-12', 1),
(241, 3, 'Szoba takarítás',           1, 1, 1, '2026-06-15', '2026-06-15', 1),
(242, 3, 'Futás 4km',                 5, 2, 1, '2026-06-16', '2026-06-16', 1),
(243, 3, 'Tanulás – tesztelés',       2, 2, 0, '2026-06-17', '2026-06-17', 0),
(244, 3, 'Mosás',                     1, 1, 1, '2026-06-19', '2026-06-19', 1),
(245, 3, 'Futás 6km',                 5, 3, 1, '2026-06-22', '2026-06-22', 1),
(246, 3, 'Munka – prezentáció',       3, 2, 0, '2026-06-23', '2026-06-23', 0),
(247, 3, 'Mosogatás',                 1, 1, 1, '2026-06-25', '2026-06-25', 1),
(248, 3, 'Tanulás – Socket.IO',       2, 3, 1, '2026-07-01', '2026-07-01', 1),
(249, 3, 'Futás 3km',                 5, 1, 1, '2026-07-02', '2026-07-02', 1),
(250, 3, 'Konyha takarítás',          1, 2, 0, '2026-07-03', '2026-07-03', 0),
(251, 3, 'Munka – planning',          3, 2, 1, '2026-07-06', '2026-07-06', 1),
(252, 3, 'Napi nyújtás',              4, 1, 0, '2025-07-01', '2025-07-31', 19),
(253, 3, 'Futás 5km',                 5, 2, 1, '2026-07-08', '2026-07-08', 1),
(254, 3, 'Tanulás – Next.js',         2, 3, 0, '2026-07-09', '2026-07-09', 0),
(255, 3, 'Porszívózás',               1, 1, 1, '2026-07-10', '2026-07-10', 1),
(256, 3, 'Mosogatás',                 1, 1, 1, '2026-07-13', '2026-07-13', 1),
(257, 3, 'Futás 4km',                 5, 2, 1, '2026-07-15', '2026-07-15', 1),
(258, 3, 'Szoba takarítás',           1, 1, 0, '2026-07-16', '2026-07-16', 0),
(259, 3, 'Munka – demo',              3, 2, 1, '2026-07-17', '2026-07-17', 1),
(260, 3, 'Tanulás – Zustand',         2, 2, 1, '2026-07-20', '2026-07-20', 1),
(261, 3, 'Futás 6km',                 5, 3, 1, '2026-07-22', '2026-07-22', 1),
(262, 3, 'Mosás',                     1, 1, 1, '2026-07-24', '2026-07-24', 1),
(263, 3, 'Munka – retro',             3, 1, 0, '2026-07-28', '2026-07-28', 0),
(264, 3, 'Tanulás – Vitest',          2, 2, 1, '2026-08-03', '2026-08-03', 1),
(265, 3, 'Futás 3km',                 5, 1, 1, '2026-08-04', '2026-08-04', 1),
(266, 3, 'Mosogatás',                 1, 1, 0, '2026-08-05', '2026-08-05', 0),
(267, 3, 'Munka – sprint review',     3, 2, 1, '2026-08-06', '2026-08-06', 1),
(268, 3, 'Konyha takarítás',          1, 2, 1, '2026-08-07', '2026-08-07', 1),
(269, 3, 'Napi víz 3L',              4, 1, 0, '2025-08-01', '2025-08-31', 21),
(270, 3, 'Futás 5km',                 5, 2, 1, '2026-08-11', '2026-08-11', 1),
(271, 3, 'Tanulás – Markdown',        2, 1, 1, '2026-08-12', '2026-08-12', 1),
(272, 3, 'Porszívózás',               1, 1, 1, '2026-08-14', '2026-08-14', 1),
(273, 3, 'Munka – deploy',            3, 3, 0, '2026-08-17', '2026-08-17', 0),
(274, 3, 'Futás 4km',                 5, 2, 1, '2026-08-18', '2026-08-18', 1),
(275, 3, 'Szoba takarítás',           1, 1, 1, '2026-08-19', '2026-08-19', 1),
(276, 3, 'Tanulás – Python Flask',    2, 2, 0, '2026-08-20', '2026-08-20', 0),
(277, 3, 'Futás 6km',                 5, 3, 1, '2026-08-24', '2026-08-24', 1),
(278, 3, 'Mosás',                     1, 1, 1, '2026-08-26', '2026-08-26', 1),
(279, 3, 'Munka – meeting jegyzet',   3, 1, 1, '2026-08-27', '2026-08-27', 1),
(280, 3, 'Tanulás – React 19',        2, 2, 1, '2026-09-01', '2026-09-01', 1),
(281, 3, 'Futás 3km',                 5, 1, 1, '2026-09-02', '2026-09-02', 1),
(282, 3, 'Mosogatás',                 1, 1, 1, '2026-09-03', '2026-09-03', 1),
(283, 3, 'Munka – sprint planning',   3, 2, 0, '2026-09-04', '2026-09-04', 0),
(284, 3, 'Konyha takarítás',          1, 2, 1, '2026-09-05', '2026-09-05', 1),
(285, 3, 'Napi séta 45 perc',         4, 1, 0, '2025-09-01', '2025-09-30', 12),
(286, 3, 'Futás 5km',                 5, 2, 1, '2026-09-08', '2026-09-08', 1),
(287, 3, 'Tanulás – Astro',           2, 2, 0, '2026-09-09', '2026-09-09', 0),
(288, 3, 'Porszívózás',               1, 1, 1, '2026-09-11', '2026-09-11', 1),
(289, 3, 'Szoba takarítás',           1, 1, 1, '2026-09-15', '2026-09-15', 1),
(290, 3, 'Futás 4km',                 5, 2, 0, '2026-09-16', '2026-09-16', 0),
(291, 3, 'Munka – heti riport',       3, 2, 1, '2026-09-17', '2026-09-17', 1),
(292, 3, 'Tanulás – Bun runtime',     2, 3, 1, '2026-09-18', '2026-09-18', 1),
(293, 3, 'Futás 6km',                 5, 3, 1, '2026-09-22', '2026-09-22', 1),
(294, 3, 'Mosás',                     1, 1, 0, '2026-09-24', '2026-09-24', 0),
(295, 3, 'Munka – retro',             3, 1, 1, '2026-09-25', '2026-09-25', 1);

INSERT INTO `events` (`event_id`, user_id, `event_name`, `event_start_time`, `event_end_time`) VALUES
(16, 3, 'Szülinapi buli',               '2025-09-05 18:00:00', '2025-09-05 23:00:00'),
(17, 3, 'Fogorvos',                      '2025-09-10 09:00:00', '2025-09-10 09:30:00'),
(18, 3, 'Családi ebéd',                  '2025-09-14 12:00:00', '2025-09-14 14:00:00'),
(19, 3, 'Koncert',                       '2025-09-20 20:00:00', '2025-09-20 23:00:00'),
(20, 3, 'Orvosi kontroll',               '2025-10-03 08:30:00', '2025-10-03 09:00:00'),
(21, 3, 'Egyetemi nyílt nap',            '2025-10-11 10:00:00', '2025-10-11 14:00:00'),
(22, 3, 'Mozizás',                       '2025-10-18 19:00:00', '2025-10-18 21:30:00'),
(23, 3, 'Bevásárlás IKEA',               '2025-10-25 15:00:00', '2025-10-25 18:00:00'),
(24, 3, 'Baráti vacsora',                '2025-11-01 18:30:00', '2025-11-01 21:00:00'),
(25, 3, 'Konferencia – Frontend Summit', '2025-11-08 09:00:00', '2025-11-08 17:00:00'),
(26, 3, 'Autószerelő – fékcsere',        '2025-11-14 14:00:00', '2025-11-14 15:30:00'),
(27, 3, 'Családi vacsora',               '2025-11-22 18:00:00', '2025-11-22 20:00:00'),
(28, 3, 'Karácsonyi vásár',              '2025-12-06 16:00:00', '2025-12-06 19:00:00'),
(29, 3, 'Szilveszteri buli',             '2025-12-31 20:00:00', '2026-01-01 02:00:00'),
(30, 3, 'Karácsonyi ebéd',               '2025-12-25 12:00:00', '2025-12-25 15:00:00'),
(31, 3, 'Újévi brunch',                  '2026-01-04 10:00:00', '2026-01-04 12:00:00'),
(32, 3, 'Edzés – konditerem',            '2026-01-10 17:00:00', '2026-01-10 18:30:00'),
(33, 3, 'Munka meeting – Q1 tervezés',   '2026-01-15 09:00:00', '2026-01-15 11:00:00'),
(34, 3, 'Mozizás',                       '2026-01-24 20:00:00', '2026-01-24 22:00:00'),
(35, 3, 'Valentin napi vacsora',         '2026-02-14 19:00:00', '2026-02-14 22:00:00'),
(36, 3, 'Fogorvos kontroll',             '2026-02-18 10:00:00', '2026-02-18 10:30:00'),
(37, 3, 'Baráti bowling',                '2026-02-22 16:00:00', '2026-02-22 18:00:00'),
(38, 3, 'Tavaszi nagytakarítás',         '2026-03-07 09:00:00', '2026-03-07 13:00:00'),
(39, 3, 'Családi ebéd',                  '2026-03-15 12:00:00', '2026-03-15 14:00:00'),
(40, 3, 'Edzés – úszás',                 '2026-03-21 07:00:00', '2026-03-21 08:00:00'),
(41, 3, 'Húsvéti ebéd',                  '2026-04-06 12:00:00', '2026-04-06 15:00:00'),
(42, 3, 'Túra – Mátra',                  '2026-04-12 08:00:00', '2026-04-12 16:00:00'),
(43, 3, 'Munka meetup',                  '2026-04-20 18:00:00', '2026-04-20 20:00:00'),
(44, 3, 'Anyák napi ünnepség',           '2026-05-03 11:00:00', '2026-05-03 14:00:00'),
(45, 3, 'Koncert – Akvárium',            '2026-05-16 20:00:00', '2026-05-16 23:30:00'),
(46, 3, 'Barát szülinap',                '2026-05-23 18:00:00', '2026-05-23 22:00:00'),
(47, 3, 'Nyári fesztivál nap 1',         '2026-06-12 14:00:00', '2026-06-12 23:00:00'),
(48, 3, 'Nyári fesztivál nap 2',         '2026-06-13 14:00:00', '2026-06-13 23:00:00'),
(49, 3, 'Edzés – outdoor',               '2026-06-20 07:00:00', '2026-06-20 08:30:00'),
(50, 3, 'Balaton hétvége',               '2026-07-04 08:00:00', '2026-07-05 18:00:00'),
(51, 3, 'Grillparti',                    '2026-07-18 16:00:00', '2026-07-18 21:00:00'),
(52, 3, 'Sziget fesztivál',              '2026-08-10 12:00:00', '2026-08-13 23:00:00'),
(53, 3, 'Családi nyaralás',              '2026-08-20 06:00:00', '2026-08-27 20:00:00'),
(54, 3, 'Szüret – borvidék',             '2026-09-12 10:00:00', '2026-09-12 17:00:00'),
(55, 3, 'Őszi konferencia – DevOps',     '2026-09-26 09:00:00', '2026-09-26 17:00:00');