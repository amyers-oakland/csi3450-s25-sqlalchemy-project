<?php
namespace App\Models;

use PDO;
use PDOException;
use App\Config\Database;

class Course {
    public static function all(): ?array {
        try {
        $db = (new Database())->connect();
        $sql = "
            SELECT 
                c.`ClassID`, 
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
}