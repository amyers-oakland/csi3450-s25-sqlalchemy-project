<?php
namespace App\Controllers;
use App\Models\Student;

class StudentController {
    public function index() {
        header('Content-Type: application/json');
        $rows = Student::all();
        echo json_encode($rows);
    }

    public function showByName(string $name) {
        header('Content-Type: application/json');
        $decodedName = trim(urldecode($name));
        $rows = Student::findByName($decodedName);
        echo json_encode($rows);
    }
}