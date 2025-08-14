<?php
namespace App\Controllers;
use App\Models\Course;
use App\Utils\Validation;

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

    public function update(int $id) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $errors = Validation::validateCoursePartial($data);
        if ($errors) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        $updated = Course::update($id, $data);
        if ($updated === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update meeting time']);
            return;
        }
        if ($updated['success'] === false) {
            http_response_code(400);
            echo json_encode(['error' => $updated['error']]);
            return;
        }
        http_response_code(200);
        echo json_encode($updated);
    }
}