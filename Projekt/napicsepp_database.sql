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
