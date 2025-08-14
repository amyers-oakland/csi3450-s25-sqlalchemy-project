<?php
namespace App\Controllers;
use App\Models\Student;
use App\Utils\Validation;

class StudentController {
    public function index() {
        $rows = Student::all();
        echo json_encode($rows);
    }

    public function showByName(string $name) {
        $decodedName = trim(urldecode($name));
        $rows = Student::findByName($decodedName);
        echo json_encode($rows);
    }

    public function showSchedule(string $id) {
        $numericId = (int)$id;
        $rows = Student::getSchedule($numericId);
        echo json_encode($rows);
    }

    public function showById(string $id) {
        $numericId = (int) $id;
        $row = Student::findById($numericId);
        if ($row === null) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }
        echo json_encode($row);
    }

    public function showRank(string $id) {
        $numericId = (int)$id;
        $result = Student::getRank($numericId);
        if ($result === null) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }
        echo json_encode($result);
    }

    public function showRanks() {
        $rows = Student::getRanks();
        if (empty($rows)) {
            http_response_code(404);
            echo json_encode(['error' => 'No ranks found']);
            return;
        }
        echo json_encode($rows);
    }

    public function store() {
        // read the JSON data from the request body (php://input)
        // file_get_contents() reads the file stream
        // json_decode() decodes the JSON data into a PHP array
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $firstName = trim((string)($data['FirstName'] ?? ''));
        $lastName = trim((string)($data['LastName'] ?? ''));
        $dateOfBirth = trim((string)($data['DateOfBirth'] ?? ''));
        $joinDate = trim((string)($data['JoinDate'] ?? ''));
        $rankId = (int)($data['RankID'] ?? 0);
        $instructorRaw = strtolower(trim((string)($data['instructor'] ?? 'false')));
        $isInstructor = in_array($instructorRaw, ['true', '1', 'yes', 'y'], true);
        $statusRaw = $isInstructor ? trim((string)($data['Status'] ?? '')) : null;

        $errors = Validation::validateStudent($data);

        if ($errors) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        if ($isInstructor) {
            if ($statusRaw === null || $statusRaw === '') {
                http_response_code(400);
                echo json_encode(['errors' => ['Status' => 'Status is required when instructor=true']]);
                return;
            }
            $statusLower = strtolower($statusRaw);
            $normalizedStatus = match ($statusLower) {
                'compensated' => 'Compensated',
                'volunteer' => 'Volunteer',
                default => null,
            };
            if ($normalizedStatus === null) {
                http_response_code(400);
                echo json_encode(['errors' => ['Status' => 'Status must be either Compensated or Volunteer']]);
                return;
            }
        }

        $created = Student::create(
            $firstName,
            $lastName,
            $dateOfBirth,
            $joinDate,
            $rankId,
            $isInstructor,
            $isInstructor ? ($normalizedStatus ?? $statusRaw) : null
        );
        if ($created === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create student']);
            return;
        }

        http_response_code(201);
        echo json_encode($created);
    }

    public function update(string $id) {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        // validating only the fields that user is trying to update
        $errors = Validation::validateStudentPartial($data);
        if ($errors) {
            http_response_code(400);
            echo json_encode(['errors' => $errors]);
            return;
        }

        // get clean strings for the fields that user is trying to update
        $allowed = ['FirstName', 'LastName', 'DateOfBirth', 'JoinDate'];
        $clean = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $clean[$field] = trim((string)$data[$field]);
            }
        }

        $numericId = (int)$id;
        $updated = Student::update($numericId, $clean);
        if ($updated === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update student']);
            return;
        }

        http_response_code(200);
        echo json_encode($updated);
    }

    public function destroy(string $id) {
        $numericId = (int)$id;
        $deleted = Student::delete($numericId);
        if ($deleted === null) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete student']);
            return;
        }
        if ($deleted === false) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }
        http_response_code(204);
    }
}