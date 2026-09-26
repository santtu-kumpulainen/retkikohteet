<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed'
    ]);

    exit;
}

$id = $_GET['id'] ?? null;

// Validate destination ID
if ($id === null || !ctype_digit($id) || (int)$id <= 0) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Invalid destination ID'
    ]);

    exit;
}

// Find destination
$stmt = $pdo->prepare(
    'SELECT id, name, latitude, longitude FROM destinations WHERE id = :id'
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

// Build Open-Meteo API URL
$url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
    'latitude' => $destination['latitude'],
    'longitude' => $destination['longitude'],
    'current' => 'temperature_2m,wind_speed_10m',
    'timezone' => 'auto'
]);

// Fetch weather data
$response = file_get_contents($url);

if ($response === false) {
    http_response_code(502);

    echo json_encode([
        'error' => 'Weather service unavailable'
    ]);

    exit;
}

$weather = json_decode($response, true);

// Return destination and weather data
echo json_encode([
    'destination' => $destination,
    'weather' => $weather
]);
