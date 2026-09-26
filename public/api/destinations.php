<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;

    if ($id !== null) {
        if (!ctype_digit($id) || (int)$id <= 0) {
            http_response_code(400);

            echo json_encode([
                'error' => 'Invalid destination ID'
            ]);

            exit;
        }

        $stmt = $pdo->prepare(
            'SELECT * FROM destinations WHERE id = :id'
        );

        $stmt->execute([
            ':id' => $id
        ]);

        $destination = $stmt->fetch();

        if (!$destination) {
            http_response_code(404);

            echo json_encode([
                'error' => 'Destination not found'
            ]);

            exit;
        }

        echo json_encode($destination);
        exit;
    }

    $stmt = $pdo->query(
        'SELECT * FROM destinations ORDER BY id DESC'
    );

    $destinations = $stmt->fetchAll();

    echo json_encode($destinations);
    exit;
}

if ($method === 'POST') {
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

    exit;
}

if ($method === 'PUT') {
    // Get and validate destination ID
    $id = $_GET['id'] ?? null;

    if ($id === null || !ctype_digit($id) || (int)$id <= 0) {
        http_response_code(400);

        echo json_encode([
            'error' => 'Invalid destination ID'
        ]);

        exit;
    }

    // Read JSON data from request
    $data = json_decode(file_get_contents('php://input'), true);

    $requiredFields = [
        'name',
        'location',
        'latitude',
        'longitude',
        'type',
        'difficulty'
    ];

    // Check required fields
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            http_response_code(400);

            echo json_encode([
                'error' => "Missing required field: $field"
            ]);

            exit;
        }
    }

    // Check that destination exists
    $stmt = $pdo->prepare(
        'SELECT id FROM destinations WHERE id = :id'
    );

    $stmt->execute([
        ':id' => $id
    ]);

    if (!$stmt->fetch()) {
        http_response_code(404);

        echo json_encode([
            'error' => 'Destination not found'
        ]);

        exit;
    }

    // Update destination
    $sql = "
        UPDATE destinations
        SET
            name = :name,
            location = :location,
            description = :description,
            latitude = :latitude,
            longitude = :longitude,
            type = :type,
            difficulty = :difficulty,
            planned_date = :planned_date
        WHERE id = :id
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':id' => $id,
        ':name' => trim($data['name']),
        ':location' => trim($data['location']),
        ':description' => $data['description'] ?? null,
        ':latitude' => $data['latitude'],
        ':longitude' => $data['longitude'],
        ':type' => trim($data['type']),
        ':difficulty' => trim($data['difficulty']),
        ':planned_date' => $data['planned_date'] ?? null
    ]);

    echo json_encode([
        'message' => 'Destination updated',
        'id' => $id
    ]);

    exit;
}

if ($method === 'DELETE') {
    // Get and validate destination ID
    $id = $_GET['id'] ?? null;

    if ($id === null || !ctype_digit($id) || (int)$id <= 0) {
        http_response_code(400);

        echo json_encode([
            'error' => 'Invalid destination ID'
        ]);

        exit;
    }

    // Check that destination exists
    $stmt = $pdo->prepare(
        'SELECT id FROM destinations WHERE id = :id'
    );

    $stmt->execute([
        ':id' => $id
    ]);

    if (!$stmt->fetch()) {
        http_response_code(404);

        echo json_encode([
            'error' => 'Destination not found'
        ]);

        exit;
    }

    // Delete destination
    $stmt = $pdo->prepare(
        'DELETE FROM destinations WHERE id = :id'
    );

    $stmt->execute([
        ':id' => $id
    ]);

    echo json_encode([
        'message' => 'Destination deleted',
        'id' => $id
    ]);

    exit;
}

http_response_code(405);

echo json_encode([
    'error' => 'Method not allowed'
]);