<?php
declare(strict_types=1);

namespace App\Utils;
use App\Config\Database;
use PDO;
use PDOException;

class Validation {
    
    public static function isValidDate(string $date) : bool {
        if (empty($date)) {
            return false;
        }
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }

    public static function validateStudent(array $data) : array {
        $errors = [];
        $firstName = trim((string)($data['FirstName'] ?? ''));
        $lastName = trim((string)($data['LastName'] ?? ''));
        $dateOfBirth = trim((string)($data['DateOfBirth'] ?? ''));
        $joinDate = trim((string)($data['JoinDate'] ?? ''));
        
        if (empty($firstName) || mb_strlen($firstName) > 50) {
            $errors['FirstName'] = 'First name is required and must be <= 50 characters';
        }
        if (empty($lastName) || mb_strlen($lastName) > 50) {
            $errors['LastName'] = 'Last name is required and must be <= 50 characters';
        }
        if (!self::isValidDate($dateOfBirth)) {
            $errors['DateOfBirth'] = 'Date of birth must be YYYY-MM-DD';
        }
        if (!self::isValidDate($joinDate)) {
            $errors['JoinDate'] = 'Join date must be YYYY-MM-DD';
        }
        return $errors;
    }

    public static function validateStudentPartial(array $data) : array {
        $errors = [];
        if (array_key_exists('FirstName', $data)) {
            $firstName = trim((string)$data['FirstName']);
            if ($firstName === '' || mb_strlen($firstName) > 50) {
                $errors['FirstName'] = 'First name must be non-empty and <= 50 characters';
            }
        }
        if (array_key_exists('LastName', $data)) {
            $lastName = trim((string)$data['LastName']);
            if ($lastName === '' || mb_strlen($lastName) > 50) {
                $errors['LastName'] = 'Last name must be non-empty and <= 50 characters';
            }
        }
        if (array_key_exists('DateOfBirth', $data)) {
            $dob = trim((string)$data['DateOfBirth']);
            if (!self::isValidDate($dob)) {
                $errors['DateOfBirth'] = 'Date of birth must be YYYY-MM-DD';
            }
        }
        if (array_key_exists('JoinDate', $data)) {
            $join = trim((string)$data['JoinDate']);
            if (!self::isValidDate($join)) {
                $errors['JoinDate'] = 'Join date must be YYYY-MM-DD';
            }
        }
        return $errors;
    }

    public static function validateCoursePartial(array $data): array {
        $errors = [];
        if (array_key_exists('ClassID', $data)) {
            $classId = (int)($data['ClassID'] ?? 0);
            if ($classId <= 0) {
                $errors['ClassID'] = 'Course does not exist';
            } else {
                try {
                    $pdo = (new Database())->connect();
                    $stmt = $pdo->prepare('SELECT 1 FROM `Class` WHERE `ClassID` = :id');
                    $stmt->bindValue(':id', $classId, PDO::PARAM_INT);
                    $stmt->execute();
                    $exists = $stmt->fetchColumn() !== false;
                    if (!$exists) {
                        $errors['ClassID'] = 'Course does not exist';
                    }
                } catch (PDOException $e) {
                    error_log($e->getMessage());
                    $errors['ClassID'] = 'Unable to verify ClassID';
                }
            }
        }

        if (array_key_exists('MeetingDate', $data)) {
            $meetingDate = trim((string)$data['MeetingDate']);
            if (!self::isValidDate($meetingDate)) {
                $errors['MeetingDate'] = 'Meeting date must be YYYY-MM-DD';
            }
        }

        return $errors;
    }
}