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

    public function destroy(int $id) {
        $numericId = (int)$id;
        $deleted = Course::delete($numericId);
        if ($deleted === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete meeting time']);
            return;
        }
        if ($deleted === false) {
            http_response_code(404);
            echo json_encode(['error' => 'Meeting not found']);
            return;
        }
        http_response_code(204);
    }
}