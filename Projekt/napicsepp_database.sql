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