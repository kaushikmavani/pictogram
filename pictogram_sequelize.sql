-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 23, 2023 at 09:12 PM
-- Server version: 5.7.31
-- PHP Version: 7.3.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pictogram_sequelize`
--

-- --------------------------------------------------------

--
-- Table structure for table `block_list`
--

DROP TABLE IF EXISTS `block_list`;
CREATE TABLE IF NOT EXISTS `block_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `block_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `block_user_id` (`block_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `follow_list`
--

DROP TABLE IF EXISTS `follow_list`;
CREATE TABLE IF NOT EXISTS `follow_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `follow_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `follow_user_id` (`follow_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `follow_list`
--

INSERT INTO `follow_list` (`id`, `created_at`, `updated_at`, `user_id`, `follow_user_id`) VALUES
(2, '2023-04-23 06:11:00', '2023-04-23 06:11:00', 1, 3),
(3, '2023-04-23 06:13:36', '2023-04-23 06:13:36', 2, 1),
(5, '2023-04-23 07:39:30', '2023-04-23 07:39:30', 1, 4);

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
CREATE TABLE IF NOT EXISTS `likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `post_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `image`, `title`, `description`, `created_at`, `updated_at`, `user_id`) VALUES
(1, '1682230304279.jpg', 'This is the title.', 'This is the description.', '2023-04-23 06:11:44', '2023-04-23 06:11:44', 3),
(2, '1682230340441.jpg', 'This is the title.', 'This is the description.', '2023-04-23 06:12:20', '2023-04-23 06:12:20', 4),
(3, '1682230454286.jpg', 'This is the title.', 'This is the description.', '2023-04-23 06:14:14', '2023-04-23 06:14:14', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
CREATE TABLE IF NOT EXISTS `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `mobile_number` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT '1',
  `email_verified` int(11) DEFAULT '0',
  `token` text,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `password`, `gender`, `dob`, `mobile_number`, `avatar`, `status`, `email_verified`, `token`, `created_at`, `updated_at`) VALUES
(1, 'test', 'test', 'test', 'test@yopmail.com', '$2a$10$0LV7wJwz6lQhgivorIOjUu/40.zEpKBSI90W5c44jbGcCqTdLiAWC', 'male', '2000-01-01', '1234567890', '1682230170094.jpg', 1, 1, NULL, '2023-04-23 06:09:30', '2023-04-23 06:09:30'),
(2, 'testa', 'testa', 'testa', 'testa@yopmail.com', '$2a$10$lI.9Aay9rgk8ct3XCWFd5e/zNi/.3qk054QJpmCbEgsEvDB1ajvbm', 'male', '2000-01-01', '1234567890', '1682230192091.jpg', 1, 1, NULL, '2023-04-23 06:09:52', '2023-04-23 06:09:52'),
(3, 'testb', 'testb', 'testb', 'testb@yopmail.com', '$2a$10$YrFXFvxm3V/MJNTDg3q.V.ffzH41Hw6/X3cMGa6Y4AAy/eUHm8ZOO', 'male', '2000-01-01', '1234567890', '1682230201171.jpg', 1, 1, NULL, '2023-04-23 06:10:01', '2023-04-23 06:10:01'),
(4, 'testc', 'testc', 'testc', 'testc@yopmail.com', '$2a$10$UEI.x1RlYIjz9aRUjNuE6.tUbRkZO5WOb.1b/.9rjFx90fvi3aT3a', 'male', '2000-01-01', '1234567890', '1682230205309.jpg', 1, 1, NULL, '2023-04-23 06:10:05', '2023-04-23 06:10:05');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `block_list`
--
ALTER TABLE `block_list`
  ADD CONSTRAINT `block_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `block_list_ibfk_2` FOREIGN KEY (`block_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `follow_list`
--
ALTER TABLE `follow_list`
  ADD CONSTRAINT `follow_list_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `follow_list_ibfk_2` FOREIGN KEY (`follow_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tokens`
--
ALTER TABLE `tokens`
  ADD CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
