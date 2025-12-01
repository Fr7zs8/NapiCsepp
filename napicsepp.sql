-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1
-- Létrehozás ideje: 2025. Dec 01. 18:19
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `napicsepp`
--

DELIMITER $$
--
-- Függvények
--
CREATE DEFINER=`root`@`localhost` FUNCTION `pwd_encrypt` (`pwd` VARCHAR(100)) RETURNS VARCHAR(255) CHARSET utf8 COLLATE utf8_general_ci DETERMINISTIC RETURN SHA2(concat(pwd,'sozas'),256)$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `activities`
--

CREATE TABLE `activities` (
  `activity_id` int(11) NOT NULL,
  `activity_name` varchar(255) DEFAULT NULL,
  `activity_type_id` int(11) DEFAULT NULL,
  `activity_difficulty_id` int(11) DEFAULT NULL,
  `activity_achive` int(11) DEFAULT NULL,
  `activity_start_date` date DEFAULT NULL,
  `activity_end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `activities`
--

INSERT INTO `activities` (`activity_id`, `activity_name`, `activity_type_id`, `activity_difficulty_id`, `activity_achive`, `activity_start_date`, `activity_end_date`) VALUES
(1, 'Levinni a szemetet', 1, 1, 1, '2025-11-10', '2025-11-10'),
(2, 'Mosás', 1, 1, 0, '2025-11-12', '2025-11-12'),
(3, 'Angol tz tanulni', 2, 2, 1, '2025-11-01', '2025-11-01'),
(4, '2 liter viz', 4, 1, 0, '2025-12-01', '2025-12-30'),
(5, 'Diétá követés', 4, 3, 0, '2025-11-10', '2025-12-10');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `difficulties`
--

CREATE TABLE `difficulties` (
  `difficulty_id` int(11) NOT NULL,
  `difficulty_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `difficulties`
--

INSERT INTO `difficulties` (`difficulty_id`, `difficulty_name`) VALUES
(1, 'Könnyű'),
(2, 'Közepes'),
(3, 'Nehéz');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `event_name` varchar(255) DEFAULT NULL,
  `event_start_time` datetime DEFAULT NULL,
  `event_end_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `events`
--

INSERT INTO `events` (`event_id`, `event_name`, `event_start_time`, `event_end_time`) VALUES
(1, 'Anya szülinap', '2025-10-15 15:00:00', '2025-10-15 16:00:00'),
(2, 'Vezetés', '2025-11-20 15:00:00', '2025-11-20 16:40:00'),
(3, 'Nyaralás', '2025-06-25 08:00:00', '2025-07-01 16:00:00');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `types`
--

CREATE TABLE `types` (
  `type_id` int(11) NOT NULL,
  `type_name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `types`
--

INSERT INTO `types` (`type_id`, `type_name`) VALUES
(1, 'Házimunka'),
(2, 'Tanulás'),
(3, 'Munka'),
(4, 'Szokás'),
(5, 'Mozgás');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `register_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `language`, `role`, `register_date`) VALUES
(1, 'admin', 'admin@gmail.com', '7da6fb34401a7d9e84aac4cdd3de80dc143659abb076a0e2436984979384d8ca', 'hu', 'admin', '2025-11-27'),
(2, 'Fruzsi', 'abcd@gmail.com', '1f081b104b2cf2134082725b8aec7e003c543c6d6717e88a1e3aa0ac65a24113', 'hu', 'user', '2025-11-27'),
(3, 'Abi', 'dcba@gmail.com', 'c0128663fc71bc0eb700b038f8a80cf3d8306b24a1948d28025b039acf83cd63', 'hu', 'user', '2025-11-27');

--
-- Eseményindítók `users`
--
DELIMITER $$
CREATE TRIGGER `insert_user` BEFORE INSERT ON `users` FOR EACH ROW set new.password = pwd_encrypt(new.password)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users_activities`
--

CREATE TABLE `users_activities` (
  `user_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `users_activities`
--

INSERT INTO `users_activities` (`user_id`, `activity_id`) VALUES
(2, 1),
(2, 3),
(2, 4),
(3, 2),
(3, 5);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `users_events`
--

CREATE TABLE `users_events` (
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- A tábla adatainak kiíratása `users_events`
--

INSERT INTO `users_events` (`user_id`, `event_id`) VALUES
(2, 1),
(2, 2),
(3, 3);

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `activity_type_id` (`activity_type_id`),
  ADD KEY `activity_difficulty_id` (`activity_difficulty_id`);

--
-- A tábla indexei `difficulties`
--
ALTER TABLE `difficulties`
  ADD PRIMARY KEY (`difficulty_id`);

--
-- A tábla indexei `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`);

--
-- A tábla indexei `types`
--
ALTER TABLE `types`
  ADD PRIMARY KEY (`type_id`);

--
-- A tábla indexei `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- A tábla indexei `users_activities`
--
ALTER TABLE `users_activities`
  ADD PRIMARY KEY (`user_id`,`activity_id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- A tábla indexei `users_events`
--
ALTER TABLE `users_events`
  ADD PRIMARY KEY (`user_id`,`event_id`),
  ADD KEY `event_id` (`event_id`);

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `activities`
--
ALTER TABLE `activities`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `difficulties`
--
ALTER TABLE `difficulties`
  MODIFY `difficulty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT a táblához `types`
--
ALTER TABLE `types`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT a táblához `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `activities`
--
ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`activity_type_id`) REFERENCES `types` (`type_id`),
  ADD CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`activity_difficulty_id`) REFERENCES `difficulties` (`difficulty_id`);

--
-- Megkötések a táblához `users_activities`
--
ALTER TABLE `users_activities`
  ADD CONSTRAINT `users_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_activities_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`activity_id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `users_events`
--
ALTER TABLE `users_events`
  ADD CONSTRAINT `users_events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `users_events_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
