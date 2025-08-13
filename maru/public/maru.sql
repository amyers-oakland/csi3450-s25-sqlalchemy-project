CREATE DATABASE IF NOT EXISTS `maru`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `maru`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Class_Attendance`;
DROP TABLE IF EXISTS `Instructor_Attendance`;
DROP TABLE IF EXISTS `Student_Rank`;
DROP TABLE IF EXISTS `Class_Meeting`;
DROP TABLE IF EXISTS `Rank_Requirement`;
DROP TABLE IF EXISTS `Class`;
DROP TABLE IF EXISTS `Instructor`;
DROP TABLE IF EXISTS `Student`;
DROP TABLE IF EXISTS `Rank`;

SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE `Student` (
  `StudentID`    INT             NOT NULL AUTO_INCREMENT,
  `FirstName`    VARCHAR(50)     NOT NULL,
  `LastName`     VARCHAR(50)     NOT NULL,
  `DateOfBirth`  DATE            NOT NULL,
  `JoinDate`     DATE            NOT NULL,
  PRIMARY KEY (`StudentID`)
) ENGINE=InnoDB;

CREATE TABLE `Instructor` (
  `StudentID`    INT             NOT NULL,
  `StartDate`    DATE            NOT NULL,
  `Status`       ENUM('Compensated','Volunteer') NOT NULL,
  PRIMARY KEY (`StudentID`),
  FOREIGN KEY (`StudentID`)
    REFERENCES `Student`(`StudentID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Class` (
  `ClassID`       INT             NOT NULL AUTO_INCREMENT,
  `Level`         VARCHAR(20)     NOT NULL,
  `DayOfWeek`     VARCHAR(10)     NOT NULL,
  `Time`          TIME            NOT NULL,
  `Location`      VARCHAR(50)     NOT NULL,
  `InstructorID`  INT             NOT NULL,
  PRIMARY KEY (`ClassID`),
  FOREIGN KEY (`InstructorID`)
    REFERENCES `Instructor`(`StudentID`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Class_Meeting` (
  `MeetingID`    INT             NOT NULL AUTO_INCREMENT,
  `ClassID`      INT             NOT NULL,
  `MeetingDate`  DATE            NOT NULL,
  PRIMARY KEY (`MeetingID`),
  FOREIGN KEY (`ClassID`)
    REFERENCES `Class`(`ClassID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Class_Attendance` (
  `StudentID`    INT             NOT NULL,
  `MeetingID`    INT             NOT NULL,
  PRIMARY KEY (`StudentID`,`MeetingID`),
  FOREIGN KEY (`StudentID`)
    REFERENCES `Student`(`StudentID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`MeetingID`)
    REFERENCES `Class_Meeting`(`MeetingID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Instructor_Attendance` (
  `StudentID`    INT             NOT NULL,
  `MeetingID`    INT             NOT NULL,
  `Role`         ENUM('Head','Assistant') NOT NULL,
  PRIMARY KEY (`StudentID`,`MeetingID`),
  FOREIGN KEY (`StudentID`)
    REFERENCES `Instructor`(`StudentID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`MeetingID`)
    REFERENCES `Class_Meeting`(`MeetingID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Rank` (
  `RankID`       INT             NOT NULL AUTO_INCREMENT,
  `RankName`     VARCHAR(50)     NOT NULL,
  `BeltColor`    VARCHAR(20)     NOT NULL,
  PRIMARY KEY (`RankID`)
) ENGINE=InnoDB;

CREATE TABLE `Rank_Requirement` (
  `RequirementID`         INT     NOT NULL AUTO_INCREMENT,
  `RankID`                INT     NOT NULL,
  `RequirementDescription` TEXT    NOT NULL,
  PRIMARY KEY (`RequirementID`),
  FOREIGN KEY (`RankID`)
    REFERENCES `Rank`(`RankID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `Student_Rank` (
  `StudentID`    INT             NOT NULL,
  `RankID`       INT             NOT NULL,
  `DateAwarded`  DATE            NOT NULL,
  PRIMARY KEY (`StudentID`,`RankID`),
  FOREIGN KEY (`StudentID`)
    REFERENCES `Student`(`StudentID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  FOREIGN KEY (`RankID`)
    REFERENCES `Rank`(`RankID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;