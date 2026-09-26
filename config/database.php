<?php

$host = 'db';
$dbname = getenv('MARIADB_DATABASE');
$username = getenv('MARIADB_USER');
$password = getenv('MARIADB_PASSWORD');

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $username, $password);

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Tietokantayhteys epäonnistui.");
}
