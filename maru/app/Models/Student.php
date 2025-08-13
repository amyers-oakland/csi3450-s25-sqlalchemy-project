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

    public static function create(string $firstName, string $lastName, string $dateOfBirth, string $joinDate): ?array {
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

            // Allow only known, updatable columns
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
}