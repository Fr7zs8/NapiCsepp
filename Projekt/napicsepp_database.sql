CREATE TABLE `difficulties` (
  `difficulty_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `difficulty_name` varchar(50) DEFAULT NULL
);

CREATE TABLE `types` (
  `type_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `type_name` varchar(50) DEFAULT NULL
);

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `event_name` varchar(255) DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `event_end_time` datetime DEFAULT NULL
);

CREATE TABLE `activities` (
    `activity_id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `activity_name` varchar(255) DEFAULT NULL,
    `activity_type_id` int(11) DEFAULT NULL,
    `activity_difficulty_id` int(11) DEFAULT NULL,
    `activity_achive` int(11) DEFAULT NULL,
    `activity_start_date` date DEFAULT NULL,
    `activity_end_date` date DEFAULT NULL,
    `progress_counter` int DEFAULT NULL,
    FOREIGN KEY (`activity_type_id`) REFERENCES `types`(`type_id`) ON DELETE CASCADE,
    FOREIGN KEY (`activity_difficulty_id`) REFERENCES `difficulties`(`difficulty_id`) ON DELETE CASCADE
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

CREATE TABLE `users_activities` (
  `user_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`activity_id`) REFERENCES `activities`(`activity_id`) ON DELETE CASCADE
);

CREATE TABLE `users_events` (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON DELETE CASCADE
);

INSERT INTO `difficulties` (`difficulty_id`, `difficulty_name`) VALUES
(1, 'Könnyű'),
(2, 'Közepes'),
(3, 'Nehéz');

INSERT INTO `events` (`event_id`, `event_name`, `event_start_time`, `event_end_time`) VALUES
(1, 'Anya szülinap', '2025-10-15 15:00:00', '2025-10-15 16:00:00'),
(2, 'Vezetés', '2025-11-20 15:00:00', '2025-11-20 16:40:00'),
(3, 'Nyaralás', '2025-06-25 08:00:00', '2025-07-01 16:00:00');

INSERT INTO `types` (`type_id`, `type_name`) VALUES
(1, 'Házimunka'),
(2, 'Tanulás'),
(3, 'Munka'),
(4, 'Szokás'),
(5, 'Mozgás');

INSERT INTO `activities` (`activity_id`, `activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`, `progress_counter`) VALUES
(1, 'Levinni a szemetet', 1, 1, 1, '2025-11-10', '2025-11-10', 0),
(2, 'Mosás', 1, 1, 0, '2025-11-12', '2025-11-12', 0),
(3, 'Angol tz tanulni', 2, 2, 1, '2025-11-01', '2025-11-01', 0),
(4, '2 liter viz', 4, 1, 0, '2025-12-01', '2025-12-30', 0),
(5, 'Diétá követés', 4, 3, 0, '2025-11-10', '2025-12-10', 0);

CREATE FUNCTION `pwd_encrypt` (`pwd` VARCHAR(100)) RETURNS VARCHAR(255) CHARSET utf8 COLLATE utf8_general_ci DETERMINISTIC RETURN SHA2(concat(pwd,'sozas'),256);

DELIMITER $$
CREATE TRIGGER `insert_user` BEFORE INSERT ON `users` FOR EACH ROW set new.password = pwd_encrypt(new.password)
$$
DELIMITER ;

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `language`, `role`, `register_date`) VALUES
(1, 'admin', 'admin@gmail.com', 'admin123', 'hu', 'admin', '2025-11-27'),
(2, 'Fruzsi', 'abcd@gmail.com', '1234', 'hu', 'user', '2025-11-27'),
(3, 'Abi', 'dcba@gmail.com', 'jelszo', 'hu', 'user', '2025-11-27');

INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES
(2, 1),
(2, 3),
(2, 4),
(3, 2),
(3, 5);

INSERT INTO `users_events` (`user_id`, `event_id`) VALUES
(2, 1),
(2, 2),
(3, 3);

DELIMITER $$

CREATE PROCEDURE `pr_pullactivities` (IN `user_id` INT)   BEGIN
	SELECT activities.activity_name, types.type_name, difficulties.difficulty_name, activities.activity_achive, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date FROM activities JOIN types on types.type_id = activities.activity_type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id JOIN users_activities ON users_activities.activity_id = activities.activity_id JOIN users ON users.user_id = users_activities.user_id WHERE users.user_id = user_id;
END$$

CREATE PROCEDURE `pr_pullallusers` ()   BEGIN
	SELECT users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users;
END$$

CREATE PROCEDURE `pr_pullevent` (IN `user_id` INT)   BEGIN
	SELECT events.event_name, DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS event_start_time , DATE_FORMAT(events.event_end_time, '%Y-%m-%d %H:%i') AS event_end_time FROM events JOIN users_events ON users_events.event_id = events.event_id JOIN users ON users_events.user_id = users.user_id WHERE users.user_id = user_id;
END$$

CREATE PROCEDURE `pr_pullhabits` (IN `user_id` INT)   BEGIN
	SELECT activities.activity_name, DATE_FORMAT(activities.activity_start_date, '%Y-%m-%d') AS activity_start_date, DATE_FORMAT(activities.activity_end_date, '%Y-%m-%d') AS activity_end_date, activities.activity_achive, users.username, types.type_name, difficulties.difficulty_name FROM activities JOIN users_activities ON activities.activity_id = users_activities.activity_id JOIN users ON users.user_id = users_activities.user_id JOIN types ON activities.activity_type_id = types.type_id JOIN difficulties ON difficulties.difficulty_id = activities.activity_difficulty_id WHERE users.user_id = user_id AND types.type_name LIKE 'szokas';
END$$

CREATE PROCEDURE `pr_pullprofile` (IN `user_id` INT)   BEGIN
	SELECT users.username, users.email, users.language, users.role, DATE_FORMAT(users.register_date, '%Y-%m-%d') AS register_date FROM users WHERE users.user_id = user_id;
END$$

CREATE FUNCTION `login` (`email` VARCHAR(100), `pwd` VARCHAR(100)) RETURNS INT(11) DETERMINISTIC BEGIN
declare ok integer;
set ok = 0;
select user_id into ok from users where users.email = email and users.password =  pwd_encrypt(pwd);
RETURN ok;
End$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE systemstatistic()
BEGIN
    SELECT 
        (SELECT COUNT(user_id) FROM users) AS total_users,
        (SELECT COUNT(activity_id) FROM activities WHERE DATE(activity_start_date) = CURDATE()) AS total_activity_today,
        (SELECT COUNT(activity_id) FROM activities) AS total_activity,
        (SELECT COUNT(a.activity_id) 
         FROM activities a 
         JOIN types t ON a.activity_type_id = t.type_id 
         WHERE t.type_name = 'szokás') AS total_habits;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE profile_statistic(IN p_user_id INT)
BEGIN
    SELECT
        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND activities.activity_start_date = CURDATE()) AS total_activity,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND a.activity_achive = 1 AND activities.activity_start_date = CURDATE()) AS completed,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND activities.activity_type_id != 4 AND a.activity_start_date = CURRENT_DATE()) AS daily_tasks_count,

        (SELECT COUNT(e.event_id)
         FROM events e
         JOIN users_events ue ON e.event_id = ue.event_id
         WHERE ue.user_id = p_user_id AND MONTH(e.event_start_time) = MONTH(CURDATE())) AS monthly_events_count,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND d.difficulty_name = 'Nehéz' AND activities.activity_start_date = CURDATE()) AS hard_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND d.difficulty_name = 'Közepes' AND activities.activity_start_date = CURDATE()) AS middle_tasks,

        (SELECT COUNT(a.activity_id)
         FROM activities a
         JOIN difficulties d ON a.activity_difficulty_id = d.difficulty_id
         JOIN users_activities ua ON a.activity_id = ua.activity_id
         WHERE ua.user_id = p_user_id AND d.difficulty_name = 'Könnyű' AND activities.activity_start_date = CURDATE()) AS easy_tasks,

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
END $$

DELIMITER ;

UPDATE users SET users.password =  pwd_encrypt("12345") WHERE users.user_id = 2;

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `overview`(IN p_user_id INT)
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
        JOIN users_activities ON users_activities.activity_id = activities.activity_id
        WHERE users_activities.user_id = p_user_id
        GROUP BY activities.activity_start_date

        UNION ALL
        
        SELECT
            DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i') AS date,
            0 AS activity_count,
            0 AS habit_count,
            COUNT(*) AS event_count
        FROM events
        JOIN users_events ON users_events.event_id = events.event_id
        WHERE users_events.user_id = p_user_id
        GROUP BY DATE_FORMAT(events.event_start_time, '%Y-%m-%d %H:%i')
    ) AS summary
    GROUP BY summary.date
    ORDER BY summary.date;
END$$

DELIMITER ;


INSERT INTO activities (activity_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(6, 'Napi vízfogyasztás', 4, 1, 1, '2025-09-01', '2025-09-08', 5),
(7, 'Reggeli olvasás', 4, 2, 0, '2025-09-15', '2025-10-15', 20),
(8, 'Esti meditáció', 4, 1, 1, '2025-10-01', '2025-10-08', 2),
(9, 'Napi naplóírás', 4, 1, 0, '2025-11-01', '2026-11-01', 100),
(10, 'Reggeli jóga', 4, 2, 1, '2025-12-01', '2026-12-01', 80);

INSERT INTO activities (activity_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(11, 'Szoba takarítás', 1, 1, 1, '2026-02-20', '2026-02-20', 1),
(12, 'Mosás', 1, 1, 0, '2026-02-20', '2026-02-20', 0),
(13, 'Matek vizsga', 2, 3, 1, '2026-02-20', '2026-02-20', 1),
(14, 'Projekt leadás', 3, 3, 0, '2026-02-21', '2026-02-21', 0),
(15, 'Reggeli futás 3km', 5, 2, 1, '2026-02-21', '2026-02-21', 1),
(16, 'Angol gyakorlás', 2, 2, 0, '2026-02-21', '2026-02-21', 0),
(17, 'Mosogatás', 1, 1, 1, '2026-02-22', '2026-02-22', 1),
(18, 'Heti riport készítés', 3, 2, 0, '2026-02-22', '2026-02-22', 0),
(19, 'Futás 5km', 5, 3, 1, '2026-02-22', '2026-02-22', 1),
(20, 'Mosogatás', 1, 1, 1, '2026-03-11', '2026-03-11', 1),
(21, 'Munka – heti összegzés', 3, 2, 0, '2026-03-11', '2026-03-11', 0),
(22, 'Futás 3km', 5, 1, 1, '2026-03-11', '2026-03-11', 1),
(23, 'Porszívózás', 1, 1, 1, '2026-03-09', '2026-03-09', 1),
(24, 'Tanulás – jegyzetelés', 2, 2, 0, '2026-03-09', '2026-03-09', 0),
(25, 'Munka – email válaszok', 3, 1, 1, '2026-03-08', '2026-03-08', 1),
(26, 'Futás 4km', 5, 2, 1, '2026-03-08', '2026-03-08', 1),
(27, 'Mosás', 1, 1, 0, '2026-03-06', '2026-03-06', 0),
(28, 'Tanulás – Python gyakorlás', 2, 3, 1, '2026-03-05', '2026-03-05', 1),
(29, 'Konyha takarítás', 1, 2, 0, '2026-03-05', '2026-03-05', 0),
(30, 'Futás 5km', 5, 2, 1, '2026-03-04', '2026-03-04', 1),
(31, 'Tanulás – matek feladatok', 2, 3, 1, '2026-03-02', '2026-03-02', 1),
(32, 'Munka – backlog rendezés', 3, 2, 0, '2026-03-02', '2026-03-02', 0),
(33, 'Porszívózás', 1, 1, 1, '2026-03-01', '2026-03-01', 1),
(34, 'Futás 6km', 5, 3, 1, '2026-02-28', '2026-02-28', 1),
(35, 'Munka – riport készítés', 3, 2, 0, '2026-02-28', '2026-02-28', 0),
(36, 'Mosás', 1, 1, 1, '2026-02-27', '2026-02-27', 1),
(37, 'Tanulás – angol szavak', 2, 2, 0, '2026-02-26', '2026-02-26', 0),
(38, 'Futás 3km', 5, 1, 1, '2026-02-26', '2026-02-26', 1),
(39, 'Munka – meeting jegyzet', 3, 1, 0, '2026-02-25', '2026-02-25', 0),
(40, 'Mosogatás', 1, 1, 1, '2026-02-24', '2026-02-24', 1),
(41, 'Futás 4km', 5, 2, 1, '2026-02-23', '2026-02-23', 1),
(42, 'Tanulás – fizika', 2, 3, 1, '2026-02-22', '2026-02-22', 1),
(43, 'Munka – email tisztítás', 3, 1, 1, '2026-02-20', '2026-02-20', 1),
(44, 'Futás 5km', 5, 2, 1, '2026-02-19', '2026-02-19', 1)
(45, 'Tanulás – jegyzet átnézés', 2, 2, 0, '2026-02-18', '2026-02-18', 0),
(46, 'Porszívózás', 1, 1, 1, '2026-02-17', '2026-02-17', 1),
(47, 'Munka – prezentáció készítés', 3, 3, 0, '2026-02-16', '2026-02-16', 0),
(48, 'Futás 3km', 5, 1, 1, '2026-02-15', '2026-02-15', 1),
(49, 'Mosogatás', 1, 1, 1, '2026-02-14', '2026-02-14', 1),
(50, 'Tanulás – programozás', 2, 3, 1, '2026-02-13', '2026-02-13', 1),
(51, 'Munka – heti tervezés', 3, 2, 0, '2026-02-12', '2026-02-12', 0),
(52, 'Futás 4km', 5, 2, 1, '2026-02-11', '2026-02-11', 1),
(53, 'Mosás', 1, 1, 0, '2026-02-10', '2026-02-10', 0),
(54, 'Tanulás – angol beszéd', 2, 2, 1, '2026-02-09', '2026-02-09', 1),
(55, 'Munka – riport frissítés', 3, 2, 1, '2026-02-08', '2026-02-08', 1),
(56, 'Futás 6km', 5, 3, 1, '2026-02-07', '2026-02-07', 1),
(57, 'Porszívózás', 1, 1, 1, '2026-02-06', '2026-02-06', 1),
(58, 'Tanulás – matek gyakorlás', 2, 3, 0, '2026-02-05', '2026-02-05', 0),
(59, 'Munka – email válaszok', 3, 1, 1, '2026-02-04', '2026-02-04', 1),
(60, 'Futás 3km', 5, 1, 1, '2026-02-03', '2026-02-03', 1),
(61, 'Mosogatás', 1, 1, 0, '2026-02-02', '2026-02-02', 0),
(62, 'Tanulás – földrajz', 2, 2, 1, '2026-02-01', '2026-02-01', 1),
(63, 'Munka – dokumentum szerkesztés', 3, 2, 0, '2026-01-30', '2026-01-30', 0),
(64, 'Futás 5km', 5, 2, 1, '2026-01-29', '2026-01-29', 1),
(65, 'Mosás', 1, 1, 1, '2026-01-28', '2026-01-28', 1),
(66, 'Tanulás – történelem', 2, 2, 0, '2026-01-27', '2026-01-27', 0),
(67, 'Munka – prezentáció frissítés', 3, 2, 1, '2026-01-26', '2026-01-26', 1),
(68, 'Futás 4km', 5, 2, 1, '2026-01-25', '2026-01-25', 1),
(69, 'Porszívózás', 1, 1, 1, '2026-01-24', '2026-01-24', 1);

INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES
(2, 6), (2, 7), (2, 8), (2, 9),(2, 10),(2, 11),(2, 12),(2, 13),(2, 14),(2, 15),(2, 16),(2, 17),(2, 18),(2, 19),(2, 20),(2, 21),(2, 22),(2, 23),(2, 24),(2, 25),(2, 26),(2, 27),(2, 28),(2, 29),(2, 30),(2, 31),(2, 32),(2, 33),(2, 34),(2, 35),(2, 36),(2, 37),(2, 38),(2, 39),(2, 40),(2, 41),(2, 42),(2, 43),(2, 44),(2, 45),(2, 46),(2, 47),(2, 48),(2, 49),(2, 50),(2, 51),(2, 52),(2, 53),(2, 54),(2, 55),(2, 56),(2, 57),(2, 58),(2, 59),(2, 60),(2, 61),(2, 62),(2, 63),(2, 64),(2, 65),(2, 66),(2, 67),(2, 68),(2, 69);

INSERT INTO `events` (`event_id`, `event_name`, `event_start_time`, `event_end_time`) VALUES
(5, 'Fogorvos', '2026-02-28 10:00:00', '2026-02-28 10:30:00'),
(6, 'Hétvégi bevásárlás', '2026-02-24 17:00:00', '2026-02-24 18:00:00'),
(7, 'Edzés – konditerem', '2026-02-21 19:00:00', '2026-02-21 20:15:00'),
(8, 'Munka meeting', '2026-02-18 09:00:00', '2026-02-18 10:00:00'),
(9, 'Baráti vacsora', '2026-02-14 18:30:00', '2026-02-14 21:00:00'),
(10, 'Autószerelő – olajcsere', '2026-02-10 14:00:00', '2026-02-10 15:00:00'),
(11, 'Családi ebéd', '2026-02-02 12:00:00', '2026-02-02 14:00:00'),
(12, 'Orvosi kontroll', '2026-01-27 08:30:00', '2026-01-27 09:00:00'),
(13, 'Mozizás', '2026-01-20 20:00:00', '2026-01-20 22:10:00'),
(14, 'Havi nagybevásárlás', '2026-01-12 17:00:00', '2026-01-12 18:30:00'),
(15, 'Szülinapi buli', '2026-01-05 19:00:00', '2026-01-05 23:30:00');


INSERT INTO `users_events` (`user_id`, `event_id`) VALUES
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
(2, 15);


-- ========================================================
-- DUMMY DATA FOR Abi (user_id = 3, dcba@gmail.com)
-- 2025 szeptember – 2026 szeptember
-- ========================================================

-- === ACTIVITIES (id 70–219) ===

-- 2025 szeptember
INSERT INTO activities (activity_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(70,  'Porszívózás',               1, 1, 1, '2025-09-01', '2025-09-01', 1),
(71,  'Tanulás – SQL alapok',      2, 2, 1, '2025-09-02', '2025-09-02', 1),
(72,  'Futás 3km',                 5, 1, 1, '2025-09-03', '2025-09-03', 1),
(73,  'Munka – riport készítés',   3, 2, 0, '2025-09-04', '2025-09-04', 0),
(74,  'Mosogatás',                 1, 1, 1, '2025-09-05', '2025-09-05', 1),
(75,  'Napi séta 30 perc',         4, 1, 0, '2025-09-01', '2025-09-30', 20),
(76,  'Tanulás – React alapok',    2, 3, 1, '2025-09-08', '2025-09-08', 1),
(77,  'Futás 5km',                 5, 2, 1, '2025-09-09', '2025-09-09', 1),
(78,  'Mosás',                     1, 1, 0, '2025-09-10', '2025-09-10', 0),
(79,  'Munka – meeting jegyzet',   3, 1, 1, '2025-09-11', '2025-09-11', 1),
(80,  'Konyha takarítás',          1, 2, 1, '2025-09-12', '2025-09-12', 1),
(81,  'Tanulás – angol nyelvtan',  2, 2, 0, '2025-09-15', '2025-09-15', 0),
(82,  'Futás 4km',                 5, 2, 1, '2025-09-16', '2025-09-16', 1),
(83,  'Munka – backlog rendezés',  3, 2, 0, '2025-09-17', '2025-09-17', 0),
(84,  'Szoba takarítás',           1, 1, 1, '2025-09-18', '2025-09-18', 1),
(85,  'Reggeli olvasás',           4, 1, 0, '2025-09-15', '2025-10-14', 15),
(86,  'Tanulás – JavaScript',      2, 3, 1, '2025-09-20', '2025-09-20', 1),
(87,  'Futás 6km',                 5, 3, 1, '2025-09-22', '2025-09-22', 1),
(88,  'Mosogatás',                 1, 1, 1, '2025-09-24', '2025-09-24', 1),
(89,  'Munka – prezentáció',       3, 3, 0, '2025-09-25', '2025-09-25', 0),
(90,  'Porszívózás',               1, 1, 1, '2025-09-28', '2025-09-28', 1),
(91,  'Tanulás – Python alapok',   2, 2, 1, '2025-10-01', '2025-10-01', 1),
(92,  'Futás 3km',                 5, 1, 1, '2025-10-02', '2025-10-02', 1),
(93,  'Mosás',                     1, 1, 0, '2025-10-03', '2025-10-03', 0),
(94,  'Munka – email válaszok',    3, 1, 1, '2025-10-06', '2025-10-06', 1),
(95,  'Konyha takarítás',          1, 2, 1, '2025-10-07', '2025-10-07', 1),
(96,  'Napi meditáció',            4, 1, 0, '2025-10-01', '2025-10-31', 18),
(97,  'Tanulás – adatbázisok',     2, 3, 1, '2025-10-09', '2025-10-09', 1),
(98,  'Futás 5km',                 5, 2, 1, '2025-10-10', '2025-10-10', 1),
(99,  'Munka – dokumentáció',      3, 2, 0, '2025-10-13', '2025-10-13', 0),
(100, 'Szoba takarítás',           1, 1, 1, '2025-10-14', '2025-10-14', 1),
(101, 'Tanulás – TypeScript',      2, 3, 1, '2025-10-16', '2025-10-16', 1),
(102, 'Futás 4km',                 5, 2, 0, '2025-10-17', '2025-10-17', 0),
(103, 'Mosogatás',                 1, 1, 1, '2025-10-20', '2025-10-20', 1),
(104, 'Munka – heti tervezés',     3, 2, 1, '2025-10-21', '2025-10-21', 1),
(105, 'Porszívózás',               1, 1, 1, '2025-10-23', '2025-10-23', 1),
(106, 'Tanulás – Node.js',         2, 2, 0, '2025-10-24', '2025-10-24', 0),
(107, 'Futás 6km',                 5, 3, 1, '2025-10-27', '2025-10-27', 1),
(108, 'Munka – riport frissítés',  3, 2, 1, '2025-10-28', '2025-10-28', 1),
(109, 'Mosás',                     1, 1, 0, '2025-10-30', '2025-10-30', 0),
(110, 'Tanulás – CSS haladó',      2, 2, 1, '2025-11-03', '2025-11-03', 1),
(111, 'Futás 3km',                 5, 1, 1, '2025-11-04', '2025-11-04', 1),
(112, 'Munka – standup jegyzet',   3, 1, 1, '2025-11-05', '2025-11-05', 1),
(113, 'Mosogatás',                 1, 1, 0, '2025-11-06', '2025-11-06', 0),
(114, 'Konyha takarítás',          1, 2, 1, '2025-11-07', '2025-11-07', 1),
(115, 'Napi vízfogyasztás 2L',     4, 1, 0, '2025-11-01', '2025-11-30', 22),
(116, 'Tanulás – Docker',          2, 3, 1, '2025-11-10', '2025-11-10', 1),
(117, 'Futás 5km',                 5, 2, 1, '2025-11-11', '2025-11-11', 1),
(118, 'Szoba takarítás',           1, 1, 1, '2025-11-13', '2025-11-13', 1),
(119, 'Munka – backlog átnézés',   3, 2, 0, '2025-11-14', '2025-11-14', 0),
(120, 'Porszívózás',               1, 1, 1, '2025-11-17', '2025-11-17', 1),
(121, 'Tanulás – Git haladó',      2, 2, 1, '2025-11-18', '2025-11-18', 1),
(122, 'Futás 4km',                 5, 2, 0, '2025-11-19', '2025-11-19', 0),
(123, 'Mosás',                     1, 1, 1, '2025-11-21', '2025-11-21', 1),
(124, 'Munka – email tisztítás',   3, 1, 1, '2025-11-24', '2025-11-24', 1),
(125, 'Tanulás – REST API-k',      2, 3, 0, '2025-11-25', '2025-11-25', 0),
(126, 'Futás 6km',                 5, 3, 1, '2025-11-27', '2025-11-27', 1),
(127, 'Mosogatás',                 1, 1, 1, '2025-11-28', '2025-11-28', 1),
(128, 'Munka – éves összefoglaló', 3, 3, 0, '2025-12-01', '2025-12-01', 0),
(129, 'Futás 3km',                 5, 1, 1, '2025-12-02', '2025-12-02', 1),
(130, 'Tanulás – Express.js',      2, 2, 1, '2025-12-03', '2025-12-03', 1),
(131, 'Porszívózás',               1, 1, 1, '2025-12-04', '2025-12-04', 1),
(132, 'Napi jóga 15 perc',         4, 2, 0, '2025-12-01', '2025-12-31', 24),
(133, 'Konyha takarítás',          1, 2, 0, '2025-12-05', '2025-12-05', 0),
(134, 'Futás 5km',                 5, 2, 1, '2025-12-08', '2025-12-08', 1),
(135, 'Tanulás – Cypress tesztek', 2, 3, 1, '2025-12-09', '2025-12-09', 1),
(136, 'Munka – sprint review',     3, 2, 1, '2025-12-10', '2025-12-10', 1),
(137, 'Mosogatás',                 1, 1, 1, '2025-12-11', '2025-12-11', 1),
(138, 'Szoba takarítás',           1, 1, 0, '2025-12-12', '2025-12-12', 0),
(139, 'Futás 4km',                 5, 2, 1, '2025-12-15', '2025-12-15', 1),
(140, 'Tanulás – MongoDB',         2, 3, 0, '2025-12-16', '2025-12-16', 0),
(141, 'Munka – heti riport',       3, 2, 1, '2025-12-17', '2025-12-17', 1),
(142, 'Mosás',                     1, 1, 1, '2025-12-18', '2025-12-18', 1),
(143, 'Porszívózás',               1, 1, 1, '2025-12-22', '2025-12-22', 1),
(144, 'Futás 6km',                 5, 3, 1, '2025-12-23', '2025-12-23', 1),
(145, 'Munka – éves zárás',        3, 3, 0, '2025-12-29', '2025-12-29', 0),
(146, 'Tanulás – React Router',    2, 2, 1, '2026-01-05', '2026-01-05', 1),
(147, 'Futás 3km',                 5, 1, 1, '2026-01-06', '2026-01-06', 1),
(148, 'Mosogatás',                 1, 1, 1, '2026-01-07', '2026-01-07', 1),
(149, 'Munka – sprint planning',   3, 2, 0, '2026-01-08', '2026-01-08', 0),
(150, 'Konyha takarítás',          1, 2, 1, '2026-01-09', '2026-01-09', 1),
(151, 'Napi naplóírás',            4, 1, 0, '2026-01-01', '2026-01-31', 25),
(152, 'Tanulás – Vite',            2, 2, 1, '2026-01-12', '2026-01-12', 1),
(153, 'Futás 5km',                 5, 2, 1, '2026-01-13', '2026-01-13', 1),
(154, 'Szoba takarítás',           1, 1, 0, '2026-01-14', '2026-01-14', 0),
(155, 'Munka – dokumentáció',      3, 2, 1, '2026-01-15', '2026-01-15', 1),
(156, 'Mosás',                     1, 1, 1, '2026-01-16', '2026-01-16', 1),
(157, 'Tanulás – JWT auth',        2, 3, 1, '2026-01-19', '2026-01-19', 1),
(158, 'Futás 4km',                 5, 2, 0, '2026-01-20', '2026-01-20', 0),
(159, 'Porszívózás',               1, 1, 1, '2026-01-22', '2026-01-22', 1),
(160, 'Munka – code review',       3, 2, 1, '2026-01-23', '2026-01-23', 1),
(161, 'Futás 6km',                 5, 3, 1, '2026-01-26', '2026-01-26', 1),
(162, 'Tanulás – unit tesztek',    2, 3, 0, '2026-01-27', '2026-01-27', 0),
(163, 'Mosogatás',                 1, 1, 1, '2026-01-29', '2026-01-29', 1),
(164, 'Munka – sprint retro',      3, 1, 1, '2026-02-02', '2026-02-02', 1),
(165, 'Futás 3km',                 5, 1, 1, '2026-02-03', '2026-02-03', 1),
(166, 'Tanulás – CSS Grid',        2, 2, 1, '2026-02-04', '2026-02-04', 1),
(167, 'Mosogatás',                 1, 1, 0, '2026-02-05', '2026-02-05', 0),
(168, 'Konyha takarítás',          1, 2, 1, '2026-02-06', '2026-02-06', 1),
(169, 'Napi stretching',           4, 1, 0, '2026-02-01', '2026-02-28', 20),
(170, 'Futás 5km',                 5, 2, 1, '2026-02-09', '2026-02-09', 1),
(171, 'Tanulás – Tailwind CSS',    2, 2, 0, '2026-02-10', '2026-02-10', 0),
(172, 'Munka – backlog grooming',  3, 2, 1, '2026-02-11', '2026-02-11', 1),
(173, 'Porszívózás',               1, 1, 1, '2026-02-12', '2026-02-12', 1),
(174, 'Szoba takarítás',           1, 1, 1, '2026-02-13', '2026-02-13', 1),
(175, 'Futás 4km',                 5, 2, 1, '2026-02-16', '2026-02-16', 1),
(176, 'Tanulás – SQL haladó',      2, 3, 1, '2026-02-17', '2026-02-17', 1),
(177, 'Mosás',                     1, 1, 0, '2026-02-18', '2026-02-18', 0),
(178, 'Munka – deploy script',     3, 3, 0, '2026-02-19', '2026-02-19', 0),
(179, 'Futás 6km',                 5, 3, 1, '2026-02-23', '2026-02-23', 1),
(180, 'Tanulás – GraphQL',         2, 3, 0, '2026-02-24', '2026-02-24', 0),
(181, 'Mosogatás',                 1, 1, 1, '2026-02-25', '2026-02-25', 1),
(182, 'Munka – heti összegzés',    3, 2, 1, '2026-02-26', '2026-02-26', 1),
(183, 'Futás 3km',                 5, 1, 1, '2026-03-02', '2026-03-02', 1),
(184, 'Tanulás – Docker Compose',  2, 3, 1, '2026-03-03', '2026-03-03', 1),
(185, 'Konyha takarítás',          1, 2, 0, '2026-03-04', '2026-03-04', 0),
(186, 'Munka – standup jegyzet',   3, 1, 1, '2026-03-05', '2026-03-05', 1),
(187, 'Napi víz 2.5L',            4, 1, 0, '2026-03-01', '2026-03-31', 10),
(188, 'Futás 5km',                 5, 2, 1, '2026-03-09', '2026-03-09', 1),
(189, 'Tanulás – CI/CD pipeline',  2, 3, 0, '2026-03-10', '2026-03-10', 0),
(190, 'Mosogatás',                 1, 1, 1, '2026-03-11', '2026-03-11', 1),
(191, 'Szoba takarítás',           1, 1, 1, '2026-03-12', '2026-03-12', 1),
(192, 'Futás 4km',                 5, 2, 1, '2026-03-16', '2026-03-16', 1),
(193, 'Munka – refactor',          3, 3, 0, '2026-03-17', '2026-03-17', 0),
(194, 'Porszívózás',               1, 1, 1, '2026-03-19', '2026-03-19', 1),
(195, 'Tanulás – Redis',           2, 3, 1, '2026-03-20', '2026-03-20', 1),
(196, 'Futás 6km',                 5, 3, 1, '2026-03-23', '2026-03-23', 1),
(197, 'Mosás',                     1, 1, 0, '2026-03-25', '2026-03-25', 0),
(198, 'Munka – code review',       3, 2, 1, '2026-03-26', '2026-03-26', 1),
(199, 'Tanulás – WebSocket',       2, 3, 1, '2026-04-01', '2026-04-01', 1),
(200, 'Futás 3km',                 5, 1, 1, '2026-04-02', '2026-04-02', 1),
(201, 'Mosogatás',                 1, 1, 1, '2026-04-03', '2026-04-03', 1),
(202, 'Munka – planning',          3, 2, 0, '2026-04-06', '2026-04-06', 0),
(203, 'Konyha takarítás',          1, 2, 1, '2026-04-07', '2026-04-07', 1),
(204, 'Napi olvasás 20 perc',      4, 1, 0, '2025-04-01', '2025-04-30', 18),
(205, 'Futás 5km',                 5, 2, 1, '2026-04-09', '2026-04-09', 1),
(206, 'Tanulás – Linux alapok',    2, 2, 0, '2026-04-10', '2026-04-10', 0),
(207, 'Porszívózás',               1, 1, 1, '2026-04-13', '2026-04-13', 1),
(208, 'Munka – demo prep',         3, 2, 1, '2026-04-14', '2026-04-14', 1),
(209, 'Futás 4km',                 5, 2, 1, '2026-04-16', '2026-04-16', 1),
(210, 'Szoba takarítás',           1, 1, 0, '2026-04-17', '2026-04-17', 0),
(211, 'Tanulás – Nginx',           2, 3, 1, '2026-04-20', '2026-04-20', 1),
(212, 'Futás 6km',                 5, 3, 1, '2026-04-22', '2026-04-22', 1),
(213, 'Mosás',                     1, 1, 1, '2026-04-24', '2026-04-24', 1),
(214, 'Munka – retro',             3, 1, 1, '2026-04-28', '2026-04-28', 1),
(215, 'Tanulás – Kubernetes',      2, 3, 0, '2026-05-04', '2026-05-04', 0),
(216, 'Futás 3km',                 5, 1, 1, '2026-05-05', '2026-05-05', 1),
(217, 'Mosogatás',                 1, 1, 1, '2026-05-06', '2026-05-06', 1),
(218, 'Munka – sprint review',     3, 2, 1, '2026-05-07', '2026-05-07', 1),
(219, 'Konyha takarítás',          1, 2, 0, '2026-05-08', '2026-05-08', 0);

INSERT INTO activities (activity_id, activity_name, activity_type_id, activity_difficulty_id, activity_achive, activity_start_date, activity_end_date, progress_counter) VALUES
(220, 'Napi meditáció 10 perc',    4, 1, 0, '2025-05-01', '2025-05-31', 16),
(221, 'Futás 5km',                 5, 2, 1, '2026-05-11', '2026-05-11', 1),
(222, 'Tanulás – AWS alapok',      2, 3, 1, '2026-05-12', '2026-05-12', 1),
(223, 'Porszívózás',               1, 1, 1, '2026-05-14', '2026-05-14', 1),
(224, 'Munka – deploy',            3, 3, 0, '2026-05-15', '2026-05-15', 0),
(225, 'Futás 4km',                 5, 2, 1, '2026-05-18', '2026-05-18', 1),
(226, 'Szoba takarítás',           1, 1, 1, '2026-05-19', '2026-05-19', 1),
(227, 'Tanulás – Firebase',        2, 2, 0, '2026-05-20', '2026-05-20', 0),
(228, 'Futás 6km',                 5, 3, 1, '2026-05-22', '2026-05-22', 1),
(229, 'Mosás',                     1, 1, 0, '2026-05-25', '2026-05-25', 0),
(230, 'Munka – heti összegzés',    3, 2, 1, '2026-05-26', '2026-05-26', 1),
(231, 'Tanulás – OAuth 2.0',       2, 3, 1, '2026-06-01', '2026-06-01', 1),
(232, 'Futás 3km',                 5, 1, 1, '2026-06-02', '2026-06-02', 1),
(233, 'Mosogatás',                 1, 1, 1, '2026-06-03', '2026-06-03', 1),
(234, 'Munka – standup jegyzet',   3, 1, 0, '2026-06-04', '2026-06-04', 0),
(235, 'Konyha takarítás',          1, 2, 1, '2026-06-05', '2026-06-05', 1),
(236, 'Napi futás 2km',            4, 1, 0, '2025-06-01', '2025-06-30', 22),
(237, 'Futás 5km',                 5, 2, 1, '2026-06-09', '2026-06-09', 1),
(238, 'Tanulás – Prisma ORM',      2, 2, 1, '2026-06-10', '2026-06-10', 1),
(239, 'Porszívózás',               1, 1, 0, '2026-06-11', '2026-06-11', 0),
(240, 'Munka – refactor',          3, 3, 1, '2026-06-12', '2026-06-12', 1),
(241, 'Szoba takarítás',           1, 1, 1, '2026-06-15', '2026-06-15', 1),
(242, 'Futás 4km',                 5, 2, 1, '2026-06-16', '2026-06-16', 1),
(243, 'Tanulás – tesztelés',       2, 2, 0, '2026-06-17', '2026-06-17', 0),
(244, 'Mosás',                     1, 1, 1, '2026-06-19', '2026-06-19', 1),
(245, 'Futás 6km',                 5, 3, 1, '2026-06-22', '2026-06-22', 1),
(246, 'Munka – prezentáció',       3, 2, 0, '2026-06-23', '2026-06-23', 0),
(247, 'Mosogatás',                 1, 1, 1, '2026-06-25', '2026-06-25', 1),
(248, 'Tanulás – Socket.IO',       2, 3, 1, '2026-07-01', '2026-07-01', 1),
(249, 'Futás 3km',                 5, 1, 1, '2026-07-02', '2026-07-02', 1),
(250, 'Konyha takarítás',          1, 2, 0, '2026-07-03', '2026-07-03', 0),
(251, 'Munka – planning',          3, 2, 1, '2026-07-06', '2026-07-06', 1),
(252, 'Napi nyújtás',              4, 1, 0, '2025-07-01', '2025-07-31', 19),
(253, 'Futás 5km',                 5, 2, 1, '2026-07-08', '2026-07-08', 1),
(254, 'Tanulás – Next.js',         2, 3, 0, '2026-07-09', '2026-07-09', 0),
(255, 'Porszívózás',               1, 1, 1, '2026-07-10', '2026-07-10', 1),
(256, 'Mosogatás',                 1, 1, 1, '2026-07-13', '2026-07-13', 1),
(257, 'Futás 4km',                 5, 2, 1, '2026-07-15', '2026-07-15', 1),
(258, 'Szoba takarítás',           1, 1, 0, '2026-07-16', '2026-07-16', 0),
(259, 'Munka – demo',              3, 2, 1, '2026-07-17', '2026-07-17', 1),
(260, 'Tanulás – Zustand',         2, 2, 1, '2026-07-20', '2026-07-20', 1),
(261, 'Futás 6km',                 5, 3, 1, '2026-07-22', '2026-07-22', 1),
(262, 'Mosás',                     1, 1, 1, '2026-07-24', '2026-07-24', 1),
(263, 'Munka – retro',             3, 1, 0, '2026-07-28', '2026-07-28', 0),
(264, 'Tanulás – Vitest',          2, 2, 1, '2026-08-03', '2026-08-03', 1),
(265, 'Futás 3km',                 5, 1, 1, '2026-08-04', '2026-08-04', 1),
(266, 'Mosogatás',                 1, 1, 0, '2026-08-05', '2026-08-05', 0),
(267, 'Munka – sprint review',     3, 2, 1, '2026-08-06', '2026-08-06', 1),
(268, 'Konyha takarítás',          1, 2, 1, '2026-08-07', '2026-08-07', 1),
(269, 'Napi víz 3L',              4, 1, 0, '2025-08-01', '2025-08-31', 21),
(270, 'Futás 5km',                 5, 2, 1, '2026-08-11', '2026-08-11', 1),
(271, 'Tanulás – Markdown',        2, 1, 1, '2026-08-12', '2026-08-12', 1),
(272, 'Porszívózás',               1, 1, 1, '2026-08-14', '2026-08-14', 1),
(273, 'Munka – deploy',            3, 3, 0, '2026-08-17', '2026-08-17', 0),
(274, 'Futás 4km',                 5, 2, 1, '2026-08-18', '2026-08-18', 1),
(275, 'Szoba takarítás',           1, 1, 1, '2026-08-19', '2026-08-19', 1),
(276, 'Tanulás – Python Flask',    2, 2, 0, '2026-08-20', '2026-08-20', 0),
(277, 'Futás 6km',                 5, 3, 1, '2026-08-24', '2026-08-24', 1),
(278, 'Mosás',                     1, 1, 1, '2026-08-26', '2026-08-26', 1),
(279, 'Munka – meeting jegyzet',   3, 1, 1, '2026-08-27', '2026-08-27', 1),
(280, 'Tanulás – React 19',        2, 2, 1, '2026-09-01', '2026-09-01', 1),
(281, 'Futás 3km',                 5, 1, 1, '2026-09-02', '2026-09-02', 1),
(282, 'Mosogatás',                 1, 1, 1, '2026-09-03', '2026-09-03', 1),
(283, 'Munka – sprint planning',   3, 2, 0, '2026-09-04', '2026-09-04', 0),
(284, 'Konyha takarítás',          1, 2, 1, '2026-09-05', '2026-09-05', 1),
(285, 'Napi séta 45 perc',         4, 1, 0, '2025-09-01', '2025-09-30', 12),
(286, 'Futás 5km',                 5, 2, 1, '2026-09-08', '2026-09-08', 1),
(287, 'Tanulás – Astro',           2, 2, 0, '2026-09-09', '2026-09-09', 0),
(288, 'Porszívózás',               1, 1, 1, '2026-09-11', '2026-09-11', 1),
(289, 'Szoba takarítás',           1, 1, 1, '2026-09-15', '2026-09-15', 1),
(290, 'Futás 4km',                 5, 2, 0, '2026-09-16', '2026-09-16', 0),
(291, 'Munka – heti riport',       3, 2, 1, '2026-09-17', '2026-09-17', 1),
(292, 'Tanulás – Bun runtime',     2, 3, 1, '2026-09-18', '2026-09-18', 1),
(293, 'Futás 6km',                 5, 3, 1, '2026-09-22', '2026-09-22', 1),
(294, 'Mosás',                     1, 1, 0, '2026-09-24', '2026-09-24', 0),
(295, 'Munka – retro',             3, 1, 1, '2026-09-25', '2026-09-25', 1);

-- === USERS_ACTIVITIES (user_id=3 → activity 70–295) ===
INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES
(3,70),(3,71),(3,72),(3,73),(3,74),(3,75),(3,76),(3,77),(3,78),(3,79),
(3,80),(3,81),(3,82),(3,83),(3,84),(3,85),(3,86),(3,87),(3,88),(3,89),
(3,90),(3,91),(3,92),(3,93),(3,94),(3,95),(3,96),(3,97),(3,98),(3,99),
(3,100),(3,101),(3,102),(3,103),(3,104),(3,105),(3,106),(3,107),(3,108),(3,109),
(3,110),(3,111),(3,112),(3,113),(3,114),(3,115),(3,116),(3,117),(3,118),(3,119),
(3,120),(3,121),(3,122),(3,123),(3,124),(3,125),(3,126),(3,127),
(3,128),(3,129),(3,130),(3,131),(3,132),(3,133),(3,134),(3,135),(3,136),(3,137),
(3,138),(3,139),(3,140),(3,141),(3,142),(3,143),(3,144),(3,145),
(3,146),(3,147),(3,148),(3,149),(3,150),(3,151),(3,152),(3,153),(3,154),(3,155),
(3,156),(3,157),(3,158),(3,159),(3,160),(3,161),(3,162),(3,163),
(3,164),(3,165),(3,166),(3,167),(3,168),(3,169),(3,170),(3,171),(3,172),(3,173),
(3,174),(3,175),(3,176),(3,177),(3,178),(3,179),(3,180),(3,181),(3,182),
(3,183),(3,184),(3,185),(3,186),(3,187),(3,188),(3,189),(3,190),(3,191),(3,192),
(3,193),(3,194),(3,195),(3,196),(3,197),(3,198),
(3,199),(3,200),(3,201),(3,202),(3,203),(3,204),(3,205),(3,206),(3,207),(3,208),
(3,209),(3,210),(3,211),(3,212),(3,213),(3,214),
(3,215),(3,216),(3,217),(3,218),(3,219),(3,220),(3,221),(3,222),(3,223),(3,224),
(3,225),(3,226),(3,227),(3,228),(3,229),(3,230),
(3,231),(3,232),(3,233),(3,234),(3,235),(3,236),(3,237),(3,238),(3,239),(3,240),
(3,241),(3,242),(3,243),(3,244),(3,245),(3,246),(3,247),
(3,248),(3,249),(3,250),(3,251),(3,252),(3,253),(3,254),(3,255),(3,256),(3,257),
(3,258),(3,259),(3,260),(3,261),(3,262),(3,263),
(3,264),(3,265),(3,266),(3,267),(3,268),(3,269),(3,270),(3,271),(3,272),(3,273),
(3,274),(3,275),(3,276),(3,277),(3,278),(3,279),
(3,280),(3,281),(3,282),(3,283),(3,284),(3,285),(3,286),(3,287),(3,288),(3,289),
(3,290),(3,291),(3,292),(3,293),(3,294),(3,295);

-- === EVENTS for Abi (id 16–55) ===
INSERT INTO `events` (`event_id`, `event_name`, `event_start_time`, `event_end_time`) VALUES
(16, 'Szülinapi buli',               '2025-09-05 18:00:00', '2025-09-05 23:00:00'),
(17, 'Fogorvos',                      '2025-09-10 09:00:00', '2025-09-10 09:30:00'),
(18, 'Családi ebéd',                  '2025-09-14 12:00:00', '2025-09-14 14:00:00'),
(19, 'Koncert',                       '2025-09-20 20:00:00', '2025-09-20 23:00:00'),
(20, 'Orvosi kontroll',               '2025-10-03 08:30:00', '2025-10-03 09:00:00'),
(21, 'Egyetemi nyílt nap',            '2025-10-11 10:00:00', '2025-10-11 14:00:00'),
(22, 'Mozizás',                       '2025-10-18 19:00:00', '2025-10-18 21:30:00'),
(23, 'Bevásárlás IKEA',               '2025-10-25 15:00:00', '2025-10-25 18:00:00'),
(24, 'Baráti vacsora',                '2025-11-01 18:30:00', '2025-11-01 21:00:00'),
(25, 'Konferencia – Frontend Summit', '2025-11-08 09:00:00', '2025-11-08 17:00:00'),
(26, 'Autószerelő – fékcsere',        '2025-11-14 14:00:00', '2025-11-14 15:30:00'),
(27, 'Családi vacsora',               '2025-11-22 18:00:00', '2025-11-22 20:00:00'),
(28, 'Karácsonyi vásár',              '2025-12-06 16:00:00', '2025-12-06 19:00:00'),
(29, 'Szilveszteri buli',             '2025-12-31 20:00:00', '2026-01-01 02:00:00'),
(30, 'Karácsonyi ebéd',               '2025-12-25 12:00:00', '2025-12-25 15:00:00'),
(31, 'Újévi brunch',                  '2026-01-04 10:00:00', '2026-01-04 12:00:00'),
(32, 'Edzés – konditerem',            '2026-01-10 17:00:00', '2026-01-10 18:30:00'),
(33, 'Munka meeting – Q1 tervezés',   '2026-01-15 09:00:00', '2026-01-15 11:00:00'),
(34, 'Mozizás',                       '2026-01-24 20:00:00', '2026-01-24 22:00:00'),
(35, 'Valentin napi vacsora',         '2026-02-14 19:00:00', '2026-02-14 22:00:00'),
(36, 'Fogorvos kontroll',             '2026-02-18 10:00:00', '2026-02-18 10:30:00'),
(37, 'Baráti bowling',                '2026-02-22 16:00:00', '2026-02-22 18:00:00'),
(38, 'Tavaszi nagytakarítás',         '2026-03-07 09:00:00', '2026-03-07 13:00:00'),
(39, 'Családi ebéd',                  '2026-03-15 12:00:00', '2026-03-15 14:00:00'),
(40, 'Edzés – úszás',                 '2026-03-21 07:00:00', '2026-03-21 08:00:00'),
(41, 'Húsvéti ebéd',                  '2026-04-06 12:00:00', '2026-04-06 15:00:00'),
(42, 'Túra – Mátra',                  '2026-04-12 08:00:00', '2026-04-12 16:00:00'),
(43, 'Munka meetup',                  '2026-04-20 18:00:00', '2026-04-20 20:00:00'),
(44, 'Anyák napi ünnepség',           '2026-05-03 11:00:00', '2026-05-03 14:00:00'),
(45, 'Koncert – Akvárium',            '2026-05-16 20:00:00', '2026-05-16 23:30:00'),
(46, 'Barát szülinap',                '2026-05-23 18:00:00', '2026-05-23 22:00:00'),
(47, 'Nyári fesztivál nap 1',         '2026-06-12 14:00:00', '2026-06-12 23:00:00'),
(48, 'Nyári fesztivál nap 2',         '2026-06-13 14:00:00', '2026-06-13 23:00:00'),
(49, 'Edzés – outdoor',               '2026-06-20 07:00:00', '2026-06-20 08:30:00'),
(50, 'Balaton hétvége',               '2026-07-04 08:00:00', '2026-07-05 18:00:00'),
(51, 'Grillparti',                    '2026-07-18 16:00:00', '2026-07-18 21:00:00'),
(52, 'Sziget fesztivál',              '2026-08-10 12:00:00', '2026-08-13 23:00:00'),
(53, 'Családi nyaralás',              '2026-08-20 06:00:00', '2026-08-27 20:00:00'),
(54, 'Szüret – borvidék',             '2026-09-12 10:00:00', '2026-09-12 17:00:00'),
(55, 'Őszi konferencia – DevOps',     '2026-09-26 09:00:00', '2026-09-26 17:00:00');

-- === USERS_EVENTS (user_id=3 → event 16–55) ===
INSERT INTO `users_events` (`user_id`, `event_id`) VALUES
(3,16),(3,17),(3,18),(3,19),(3,20),(3,21),(3,22),(3,23),(3,24),(3,25),
(3,26),(3,27),(3,28),(3,29),(3,30),(3,31),(3,32),(3,33),(3,34),(3,35),
(3,36),(3,37),(3,38),(3,39),(3,40),(3,41),(3,42),(3,43),(3,44),(3,45),
(3,46),(3,47),(3,48),(3,49),(3,50),(3,51),(3,52),(3,53),(3,54),(3,55);