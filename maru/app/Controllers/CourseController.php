<?php
namespace App\Controllers;
use App\Models\Course;

class CourseController {
    public function index() {
        $rows = Course::all();
        if ($rows === null) {
            http_response_code(404);
            echo json_encode(['error' => 'No meeting times found']);
            return;
        }
        echo json_encode($rows);
    }
}