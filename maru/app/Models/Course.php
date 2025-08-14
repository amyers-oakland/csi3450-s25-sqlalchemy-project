<?php
namespace App\Models;

use PDO;
use PDOException;
use App\Config\Database;
use App\Utils\Validation;

class Course {
    public static function all(): ?array {
        try {
        $db = (new Database())->connect();
        $sql = "
            SELECT 
                c.`ClassID`, 
                cm.`MeetingID`,
                c.`Level`, 
                c.`DayOfWeek`,
                c.`Time`, 
                c.`Location`, 
                cm.`MeetingDate`,
                CONCAT(s.`FirstName`, ' ', s.`LastName`) AS `InstructorName`
            FROM `Class` c
            JOIN `Class_Meeting` cm ON c.`ClassID` = cm.`ClassID`
            LEFT JOIN `Instructor_Attendance` ia 
                ON ia.`MeetingID` = cm.`MeetingID` AND ia.`Role` = 'Head'
            LEFT JOIN `Student` s ON s.`StudentID` = ia.`StudentID`
            ORDER BY cm.`MeetingDate`, c.`Time`
        ";
        $stmt = $db->query($sql);
        return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public static function delete(int $id): ?bool {
        try {
            $pdo = (new Database())->connect();
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("DELETE FROM Class_Meeting WHERE MeetingID = :id");
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

    public static function update(int $id, array $data): ?array {
        try {
            $date = trim((string)$data['MeetingDate']);
            if (!Validation::isValidDate($date)) {
                return ['MeetingDate' => 'Invalid date'];
            }
            $pdo = (new Database())->connect();
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE Class_Meeting SET MeetingDate = :date WHERE MeetingID = :id");
            $stmt->bindValue(':date', $data['MeetingDate'], PDO::PARAM_STR);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $updatedRows = $stmt->rowCount();

            $getClassStmt = $pdo->prepare("SELECT ClassID FROM Class_Meeting WHERE MeetingID = :id");
            $getClassStmt->bindValue(':id', $id, PDO::PARAM_INT);
            $getClassStmt->execute();
            $classId = $getClassStmt->fetchColumn();

            if ($classId) {
                $newDow = (new \DateTime($date))->format('l');
                $upd = $pdo->prepare("UPDATE Class SET DayOfWeek = :dow WHERE ClassID = :cid");
                $upd->bindValue(':dow', $newDow, PDO::PARAM_STR);
                $upd->bindValue(':cid', $classId, PDO::PARAM_INT);
                $upd->execute();
            }

            $pdo->commit();
            return ['success' => true, 'updatedRows' => $updatedRows, 'ClassID' => $classId ?: null];
        } catch (PDOException $e) {
            error_log($e->getMessage());
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            return ['success' => false, 'error' => 'Failed to update meeting time'];
        }
    }

}