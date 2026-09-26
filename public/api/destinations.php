<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed'
    ]);

    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$requiredFields = [
    'name',
    'location',
    'latitude',
    'longitude',
    'type',
    'difficulty'
];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
        http_response_code(400);

        echo json_encode([
            'error' => "Missing required field: $field"
        ]);

        exit;
    }
}

$sql = "
    INSERT INTO destinations
    (name, location, description, latitude, longitude, type, difficulty, planned_date)
    VALUES
    (:name, :location, :description, :latitude, :longitude, :type, :difficulty, :planned_date)
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ':name' => trim($data['name']),
    ':location' => trim($data['location']),
    ':description' => $data['description'] ?? null,
    ':latitude' => $data['latitude'],
    ':longitude' => $data['longitude'],
    ':type' => trim($data['type']),
    ':difficulty' => trim($data['difficulty']),
    ':planned_date' => $data['planned_date'] ?? null
]);

http_response_code(201);

echo json_encode([
    'message' => 'Destination created',
    'id' => $pdo->lastInsertId()
]);
