<?php
namespace App\Config;

use PDO;
use PDOException;

class Database {
    private $host = '127.0.0.1';
    private $db_name = 'maru';
    private $username = 'root';
    private $password = '';
    private $conn;
    private $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4",
                $this->username,
                $this->password,
                $this->options
            );
        } catch (PDOException $e) {
            echo "Connection Error: {$e->getMessage()}";
            exit;
        }

        return $this->conn;
    }
}


