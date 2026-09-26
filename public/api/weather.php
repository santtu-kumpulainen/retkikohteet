<?php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'error' => 'Method not allowed'
    ]);

    exit;
}

$latitude = $_GET['latitude'] ?? null;
$longitude = $_GET['longitude'] ?? null;

// Validate coordinates
if ($latitude === null || $longitude === null) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Latitude and longitude are required'
    ]);

    exit;
}

if (!is_numeric($latitude) || !is_numeric($longitude)) {
    http_response_code(400);

    echo json_encode([
        'error' => 'Invalid coordinates'
    ]);

    exit;
}

// Build Open-Meteo API URL
$url = 'https://api.open-meteo.com/v1/forecast?' . http_build_query([
    'latitude' => $latitude,
    'longitude' => $longitude,
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

// Return Open-Meteo response
echo $response;
