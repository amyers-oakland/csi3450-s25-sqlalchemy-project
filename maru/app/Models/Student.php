<?php
namespace App\Models;
use App\Config\Database;
use PDO;
use PDOException;

Class Student {
    public static function all(): array {
        try {
            $pdo = (new Database())->connect();
            return $pdo->query("SELECT * FROM Student")->fetchAll();

        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public static function getSchedule(int $id): ?array {
        try {
            $pdo = (new Database())->connect();
            $sql = "
                SELECT 
                    c.`ClassID`,
                    cm.`MeetingID`,
                    c.`Level`,
                    c.`DayOfWeek`,
                    c.`Time`,
                    c.`Location`,
                    cm.`MeetingDate`
                FROM `Class_Attendance` ca
                JOIN `Class_Meeting` cm ON cm.`MeetingID` = ca.`MeetingID`
                JOIN `Class` c ON c.`ClassID` = cm.`ClassID`
                WHERE ca.`StudentID` = :id
                ORDER BY cm.`MeetingDate`, c.`Time`
            ";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public static function findByName(string $name): array {
        try {
            $pdo = (new Database())->connect();
            $stmt = $pdo->prepare("SELECT * FROM Student WHERE FirstName LIKE :first OR LastName LIKE :last OR CONCAT(FirstName, ' ', LastName) LIKE :full");
            $like = "%{$name}%";
            $stmt->execute([':first' => $like, ':last' => $like, ':full' => $like]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public static function findById(int $id): ?array {
        try {
            $pdo = (new Database())->connect();
            $stmt = $pdo->prepare("SELECT * FROM Student WHERE StudentID = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch();
            return $row ?: null;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public static function create(string $firstName, string $lastName, string $dateOfBirth, string $joinDate, int $rankId, bool $isInstructor = false, ?string $instructorStatus = null): ?array {
        try {
            $pdo = (new Database())->connect();
            $pdo->beginTransaction();
            $stmt = $pdo->prepare(
                "INSERT INTO Student (FirstName, LastName, DateOfBirth, JoinDate)
                 VALUES (:firstName, :lastName, :dateOfBirth, :joinDate)"
            );
            $stmt->execute([
                ':firstName' => $firstName,
                ':lastName' => $lastName,
                ':dateOfBirth' => $dateOfBirth,
                ':joinDate' => $joinDate,
            ]);
            $id = (int)$pdo->lastInsertId();
            $currentDate = (new \DateTime('now', new \DateTimeZone(date_default_timezone_get())))->format('Y-m-d');
            $stmtRank = $pdo->prepare("INSERT INTO Student_Rank (StudentID, RankID, DateAwarded) VALUES (:sid, :rid, :awarded)");
            $stmtRank->bindValue(':sid', $id, PDO::PARAM_INT);
            $stmtRank->bindValue(':rid', (int)$rankId, PDO::PARAM_INT);
            $stmtRank->bindValue(':awarded', $currentDate, PDO::PARAM_STR);
            $stmtRank->execute();
            if ($isInstructor) {
                $status = $instructorStatus === null ? null : trim((string)$instructorStatus);
                if ($status === null || $status === '') {
                    throw new PDOException('Instructor status is required when instructor=true');
                }
                $statusLower = strtolower($status);
                $normalized = match ($statusLower) {
                    'compensated' => 'Compensated',
                    'volunteer' => 'Volunteer',
                    default => null,
                };
                if ($normalized === null) {
                    throw new PDOException('Invalid instructor status');
                }

                $currentDate = (new \DateTime('now', new \DateTimeZone(date_default_timezone_get())))->format('Y-m-d');
                $ins = $pdo->prepare("INSERT INTO Instructor (StudentID, StartDate, Status) VALUES (:sid, :startDate, :status)");
                $ins->bindValue(':sid', $id, PDO::PARAM_INT);
                $ins->bindValue(':startDate', $currentDate, PDO::PARAM_STR);
                $ins->bindValue(':status', $normalized, PDO::PARAM_STR);
                $ins->execute();
            }
            $pdo->commit();
            return self::findById($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return null;
        }
    }

    public static function update(int $id, array $data): ?array {
        try {
            $pdo = (new Database())->connect();
            $pdo->beginTransaction();

            // don't change DB structure
            $allowedColumns = ['FirstName', 'LastName', 'DateOfBirth', 'JoinDate'];
            $fieldsToUpdate = array_intersect_key($data, array_flip($allowedColumns));

            if (empty($fieldsToUpdate)) {
                $pdo->commit();
                return self::findById($id);
            }

            $setParts = [];
            $params = [':id' => $id];
            foreach ($fieldsToUpdate as $column => $value) {
                $paramName = ':' . $column;
                $setParts[] = "$column = $paramName";
                $params[$paramName] = $value;
            }

            $sql = 'UPDATE Student SET ' . implode(', ', $setParts) . ' WHERE StudentID = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            $pdo->commit();
            return self::findById($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return null;
        }
    }

    public static function delete(int $id): ?bool {
        try {
            $pdo = (new Database())->connect();
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("DELETE FROM Student WHERE StudentID = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $deletedRows = $stmt->rowCount();
            $pdo->commit();
            return $deletedRows > 0;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return null;
        }
    }

    public static function getRank(int $id): ?array {
        try {
            $pdo = (new Database())->connect();

            // get the student row
            $studentStmt = $pdo->prepare("SELECT * FROM Student WHERE StudentID = :id");
            $studentStmt->bindValue(':id', $id, PDO::PARAM_INT);
            $studentStmt->execute();
            $student = $studentStmt->fetch();
            if (!$student) {
                return null;
            }

            // get all awarded ranks for StudentID
            $rankStmt = $pdo->prepare(
                "SELECT r.RankID, r.RankName, r.BeltColor, sr.DateAwarded
                 FROM Student_Rank sr
                 JOIN Rank r ON r.RankID = sr.RankID
                 WHERE sr.StudentID = :id
                 ORDER BY sr.DateAwarded DESC"
            );
            $rankStmt->bindValue(':id', $id, PDO::PARAM_INT);
            $rankStmt->execute();
            $ranks = $rankStmt->fetchAll();


            // combine data
            // array_map uses anon function to cast RankID as an int
            // also not mutating the original object
            return [
                'StudentID' => (int)$student['StudentID'],
                'FirstName' => $student['FirstName'],
                'LastName' => $student['LastName'],
                'DateOfBirth' => $student['DateOfBirth'],
                'JoinDate' => $student['JoinDate'],
                'ranks' => array_map(function($r) {
                    return [
                        'RankID' => (int)$r['RankID'],
                        'RankName' => $r['RankName'],
                        'BeltColor' => $r['BeltColor'],
                        'DateAwarded' => $r['DateAwarded'],
                    ];
                }, $ranks),
            ];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public static function getRanks(): array {
        try {
            $pdo = (new Database())->connect();

            $sql = "
                SELECT 
                    s.`StudentID`,
                    s.`FirstName`,
                    s.`LastName`,
                    s.`DateOfBirth`,
                    s.`JoinDate`,
                    r.`RankID`,
                    r.`RankName`,
                    r.`BeltColor`,
                    sr.`DateAwarded`
                FROM `Student` s
                LEFT JOIN `Student_Rank` sr ON sr.`StudentID` = s.`StudentID`
                LEFT JOIN `Rank` r ON r.`RankID` = sr.`RankID`
                ORDER BY s.`StudentID`, sr.`DateAwarded` DESC
            ";

            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll();

            $byStudent = [];
            foreach ($rows as $row) {
                $sid = (int)$row['StudentID'];
                if (!isset($byStudent[$sid])) {
                    $byStudent[$sid] = [
                        'StudentID' => $sid,
                        'FirstName' => $row['FirstName'],
                        'LastName' => $row['LastName'],
                        'DateOfBirth' => $row['DateOfBirth'],
                        'JoinDate' => $row['JoinDate'],
                        'ranks' => [],
                    ];
                }

                if ($row['RankID'] !== null) {
                    $byStudent[$sid]['ranks'][] = [
                        'RankID' => (int)$row['RankID'],
                        'RankName' => $row['RankName'],
                        'BeltColor' => $row['BeltColor'],
                        'DateAwarded' => $row['DateAwarded'],
                    ];
                }
            }

            return array_values($byStudent);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return [];
        }
    }
}