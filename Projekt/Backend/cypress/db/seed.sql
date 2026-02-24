-- ========================================================
-- Cypress-barát SQL dump (Docker-kompatibilis)
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS `napicsepp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_hungarian_ci;
USE napicsepp;

-- ========================================================
-- TÁBLÁK TÖRLÉSE
-- ========================================================

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS users_activities;
DROP TABLE IF EXISTS users_events;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS difficulties;

SET FOREIGN_KEY_CHECKS=1;

-- ========================================================
-- FUNKCIÓK
-- ========================================================

CREATE FUNCTION IF NOT EXISTS pwd_encrypt(pwd VARCHAR(100)) RETURNS VARCHAR(255) DETERMINISTIC
BEGIN
    RETURN SHA2(CONCAT(pwd,'sozas'),256);
END;

CREATE FUNCTION IF NOT EXISTS login(email VARCHAR(100), pwd VARCHAR(100)) RETURNS INT(11) DETERMINISTIC
BEGIN
    DECLARE ok INT DEFAULT 0;
    SELECT user_id INTO ok 
    FROM users 
    WHERE users.email = email COLLATE utf8mb4_hungarian_ci 
      AND users.password = pwd_encrypt(pwd);
    RETURN ok;
END;

-- ========================================================
-- TÁBLÁK LÉTREHOZÁSA
-- ========================================================

CREATE TABLE types (
  type_id int(11) NOT NULL AUTO_INCREMENT,
  type_name varchar(50) DEFAULT NULL,
  PRIMARY KEY (type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE difficulties (
  difficulty_id int(11) NOT NULL AUTO_INCREMENT,
  difficulty_name varchar(50) DEFAULT NULL,
  PRIMARY KEY (difficulty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE activities (
  activity_id int(11) NOT NULL AUTO_INCREMENT,
  activity_name varchar(255) DEFAULT NULL,
  activity_type_id int(11) DEFAULT NULL,
  activity_difficulty_id int(11) DEFAULT NULL,
  activity_achive int(11) DEFAULT NULL,
  activity_start_date date DEFAULT NULL,
  activity_end_date date DEFAULT NULL,
  progress_counter int DEFAULT 0,
  PRIMARY KEY (activity_id),
  KEY activity_type_id (activity_type_id),
  KEY activity_difficulty_id (activity_difficulty_id),
  CONSTRAINT activities_ibfk_1 FOREIGN KEY (activity_type_id) REFERENCES types(type_id) ON DELETE CASCADE,
  CONSTRAINT activities_ibfk_2 FOREIGN KEY (activity_difficulty_id) REFERENCES difficulties(difficulty_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE users (
  user_id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(100) DEFAULT NULL,
  email varchar(100) DEFAULT NULL,
  password varchar(255) DEFAULT NULL,
  language varchar(100) DEFAULT NULL,
  role varchar(50) DEFAULT NULL,
  register_date datetime DEFAULT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE events (
  event_id int(11) NOT NULL AUTO_INCREMENT,
  event_name varchar(255) DEFAULT NULL,
  event_start_time datetime DEFAULT NULL,
  event_end_time datetime DEFAULT NULL,
  PRIMARY KEY (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE users_activities (
  user_id int(11) NOT NULL,
  activity_id int(11) NOT NULL,
  KEY user_id (user_id),
  KEY activity_id (activity_id),
  CONSTRAINT users_activities_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT users_activities_ibfk_2 FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

CREATE TABLE users_events (
  user_id int(11) NOT NULL,
  event_id int(11) NOT NULL,
  KEY user_id (user_id),
  KEY event_id (event_id),
  CONSTRAINT users_events_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT users_events_ibfk_2 FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_hungarian_ci;

-- ========================================================
-- TRIGGEREK
-- ========================================================

CREATE TRIGGER insert_user BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    SET NEW.password = pwd_encrypt(NEW.password);
END;

-- ========================================================
-- INSERT ADATOK
-- ========================================================

INSERT INTO types (type_name) VALUES
('Házimunka'),
('Tanulás'),
('Munka'),
('Szokás'),
('Mozgás');

ALTER TABLE types AUTO_INCREMENT = 6;

INSERT INTO difficulties (difficulty_name) VALUES
('Könnyű'),
('Közepes'),
('Nehéz');

ALTER TABLE difficulties AUTO_INCREMENT = 4;

INSERT INTO activities (activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
('Levinni a szemetet', 1, 1, 1, '2025-11-10', '2025-11-10', 0),
('Mosás', 1, 1, 0, '2025-11-12', '2025-11-12', 0),
('Angol tz tanulni', 2, 2, 1, '2025-11-01', '2025-11-01', 0),
('2 liter viz', 4, 1, 0, '2025-12-01', '2025-12-30', 0),
('Diéta követés', 4, 3, 0, '2025-11-10', '2025-12-09', 0);

ALTER TABLE activities AUTO_INCREMENT = 6;

INSERT INTO users (username, email, password, language, role, register_date) VALUES
('admin', 'admin@gmail.com', 'admin123', 'hu', 'admin', '2025-11-27 00:00:00'),
('Fruzsi', 'abcd@gmail.com', '1234', 'hu', 'user', '2025-11-27 00:00:00'),
('Abi', 'dcba@gmail.com', 'jelszo', 'hu', 'moderator', '2025-11-27 00:00:00'),
('Teszt', 'emptytest@gmail.com', '1234', 'hu', 'user', '2026-02-22 00:00:00');

ALTER TABLE users AUTO_INCREMENT = 5;

INSERT INTO events (event_name, event_start_time, event_end_time) VALUES
('Anya szülinap', '2025-10-15 15:00:00', '2025-10-15 16:00:00'),
('Vezetés', '2026-02-13 15:00:00', '2025-02-13 16:40:00'),
('Nyaralás', '2025-06-25 08:00:00', '2025-07-01 16:00:00'),
('Baráti találka', '2026-02-13 15:00:00', '2026-02-13 16:00:00');

ALTER TABLE events AUTO_INCREMENT = 5;

INSERT INTO users_activities (user_id, activity_id) VALUES
(2, 1),
(2, 3),
(2, 4),
(3, 2),
(3, 5);

INSERT INTO users_events (user_id, event_id) VALUES
(2, 1),
(2, 2),
(3, 3);

-- ========================================================
-- PROCEDÚRÁK
-- ========================================================

CREATE PROCEDURE IF NOT EXISTS systemstatistic()
BEGIN
    SELECT 
        (SELECT COUNT(user_id) FROM users) AS total_users,
        (SELECT COUNT(activity_id) FROM activities WHERE DATE(activity_start_date) = CURDATE()) AS total_activity_today,
        (SELECT COUNT(activity_id) FROM activities) AS total_activity,
        (SELECT COUNT(a.activity_id) 
         FROM activities a 
         JOIN types t ON a.activity_type_id = t.type_id 
         WHERE t.type_name = 'szokás') AS total_habits;
END;

CREATE PROCEDURE IF NOT EXISTS profile_statistic(IN p_user_id INT)
BEGIN
    SELECT
         (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND DATE(a.activity_start_date) = CURDATE()) AS total_activity,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND a.activity_achive = 1
           AND DATE(a.activity_start_date) = CURDATE()) AS completed,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND a.activity_type_id != 4
           AND DATE(a.activity_start_date) = CURDATE()) AS daily_tasks_count,

        (SELECT COUNT(e.event_id)
         FROM events e
         JOIN users_events ue ON e.event_id = ue.event_id
         WHERE ue.user_id = p_user_id AND MONTH(e.event_start_time) = MONTH(CURDATE())) AS monthly_events_count,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND d.difficulty_name = 'Nehéz'
           AND DATE(a.activity_start_date) = CURDATE()) AS hard_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND d.difficulty_name = 'Közepes'
           AND DATE(a.activity_start_date) = CURDATE()) AS middle_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND d.difficulty_name = 'Könnyű'
           AND DATE(a.activity_start_date) = CURDATE()) AS easy_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND YEARWEEK(a.activity_start_date, 1) = YEARWEEK(CURDATE(), 1)) AS weekly_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id
           AND YEARWEEK(a.activity_start_date, 1) = YEARWEEK(CURDATE(), 1)
           AND a.activity_achive = 1) AS weekly_tasks_completed;
END;

CREATE PROCEDURE IF NOT EXISTS overview()
BEGIN
    SELECT
        d.date,
        SUM(d.activity_count) AS activity_count,
        SUM(d.habit_count) AS habit_count,
        SUM(d.event_count) AS event_count
    FROM (
        SELECT
            DATE_FORMAT(a.activity_start_date , '%Y-%m-%d %H:%i') AS date,
            SUM(t.type_name <> 'Szokás') AS activity_count,
            SUM(t.type_name = 'Szokás') AS habit_count,
            0 AS event_count
        FROM activities a
        JOIN types t ON t.type_id = a.activity_type_id
        GROUP BY a.activity_start_date
        UNION ALL
        SELECT
            DATE_FORMAT(e.event_start_time, '%Y-%m-%d %H:%i') AS date,
            0, 0,
            COUNT(*) AS event_count
        FROM events e
        GROUP BY DATE_FORMAT(e.event_start_time, '%Y-%m-%d %H:%i')
    ) d
    GROUP BY d.date
    ORDER BY d.date;
END;

CREATE PROCEDURE IF NOT EXISTS pr_pullactivities(IN user_id INT)
BEGIN
    SELECT activities.activity_id, activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive,
           DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date,
           DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date, activities.progress_counter
    FROM activities
    JOIN types ON types.type_id = activities.activity_type_id
    JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id
    JOIN users_activities ON users_activities.activity_id = activities.activity_id
    JOIN users ON users.user_id = users_activities.user_id
    WHERE users.user_id = user_id;
END;

CREATE PROCEDURE IF NOT EXISTS pr_pullallusers()
BEGIN
    SELECT users.user_id, username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users;
END;

CREATE PROCEDURE IF NOT EXISTS pr_pullevent(IN user_id INT)
BEGIN
    SELECT events.event_id, events.event_name,
           DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS event_start_time,
           DATE_FORMAT(events.event_end_time, '%Y-%m-%d %H:%i') AS event_end_time
    FROM events
    JOIN users_events ON users_events.event_id = events.event_id
    JOIN users ON users_events.user_id = users.user_id
    WHERE users.user_id = user_id;
END;

CREATE PROCEDURE IF NOT EXISTS pr_pullhabits(IN p_user_id INT)
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
    JOIN users_activities ON activities.activity_id = users_activities.activity_id
    JOIN users ON users.user_id = users_activities.user_id
    JOIN types ON activities.activity_type_id = types.type_id
    JOIN difficulties ON activities.activity_difficulty_id = difficulties.difficulty_id
    WHERE users.user_id = p_user_id
      AND types.type_name = 'szokas';
END;

CREATE PROCEDURE IF NOT EXISTS pr_pullprofile(IN user_id INT)
BEGIN
    SELECT username, email, language, role, DATE_FORMAT(register_date, '%Y-%m-%d') AS register_date
    FROM users
    WHERE users.user_id = user_id;
END;