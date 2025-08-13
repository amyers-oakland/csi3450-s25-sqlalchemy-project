USE `maru`;

INSERT INTO `Student` (StudentID, FirstName, LastName, DateOfBirth, JoinDate) VALUES
(1001, 'John', 'Doe', '2000-05-10', '2022-01-15'),
(1002, 'Jane', 'Smith', '2004-03-20', '2023-06-01'),
(1003, 'Michael', 'Brown', '1988-11-02', '2019-08-20'),
(1004, 'Emily', 'Chen', '2002-12-30', '2024-02-14'),
(1005, 'David', 'Lee', '1995-07-07', '2018-05-10');

INSERT INTO `Rank` (RankID, RankName, BeltColor) VALUES
(1, 'White Belt', 'White'),
(2, 'Yellow Belt', 'Yellow'),
(3, 'Green Belt', 'Green'),
(4, 'Blue Belt', 'Blue'),
(5, 'Brown Belt', 'Brown');

INSERT INTO `Rank_Requirement` (RankID, RequirementDescription) VALUES
(2, 'Perform 5 basic strikes'),
(3, 'Demonstrate sparring control'),
(4, 'Teach a technique to a junior student'),
(5, 'Board break demonstration'),
(3, 'Endurance: 3 rounds');

INSERT INTO `Instructor` (StudentID, StartDate, Status) VALUES
(1001, '2019-01-01', 'Compensated'),
(1003, '2020-06-15', 'Volunteer'),
(1005, '2018-09-01', 'Compensated');

INSERT INTO `Class` (Level, DayOfWeek, Time, Location, InstructorID) VALUES
('Beginner', 'Monday', '17:00:00', 'Room 1', 1001),
('Intermediate', 'Monday', '18:00:00', 'Room 1', 1003),
('Advanced', 'Tuesday', '17:00:00', 'Room 2', 1005),
('Beginner', 'Wednesday', '18:00:00', 'Room 1', 1001),
('Intermediate', 'Thursday', '19:00:00', 'Room 2', 1003);

INSERT INTO `Class_Meeting` (ClassID, MeetingDate) VALUES
(1, '2025-08-04'),
(2, '2025-08-04'),
(3, '2025-08-05'),
(4, '2025-08-06'),
(5, '2025-08-07');

INSERT INTO `Student_Rank` (StudentID, RankID, DateAwarded) VALUES
(1001, 5, '2024-05-01'),
(1002, 2, '2024-09-01'),
(1003, 4, '2022-11-10'),
(1004, 1, '2024-02-14'),
(1005, 3, '2021-06-20');

INSERT INTO `Class_Attendance` (StudentID, MeetingID) VALUES
(1002, 1),
(1004, 1),
(1003, 2),
(1005, 3),
(1001, 4);

INSERT INTO `Instructor_Attendance` (StudentID, MeetingID, Role) VALUES
(1001, 1, 'Head'),
(1003, 2, 'Head'),
(1005, 3, 'Head'),
(1001, 4, 'Head'),
(1003, 5, 'Head');
