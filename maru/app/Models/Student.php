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
}