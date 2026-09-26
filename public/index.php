<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retkikohteet</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <main>
        <h1>Lisää retkikohde</h1>

        <form id="destination-form">
            <label for="name">Nimi</label>
            <input type="text" id="name" name="name" required>

            <label for="location">Sijainti</label>
            <input type="text" id="location" name="location" required>

            <label for="description">Kuvaus</label>
            <textarea id="description" name="description"></textarea>

            <label for="latitude">Leveysaste</label>
            <input type="number" id="latitude" name="latitude" step="any" required>

            <label for="longitude">Pituusaste</label>
            <input type="number" id="longitude" name="longitude" step="any" required>

            <label for="type">Tyyppi</label>
            <input type="text" id="type" name="type" required>

            <label for="difficulty">Vaikeustaso</label>
            <input type="text" id="difficulty" name="difficulty" required>

            <label for="planned_date">Suunniteltu päivämäärä</label>
            <input type="date" id="planned_date" name="planned_date">

            <button type="submit">Lisää retkikohde</button>
        </form>

        <p id="message"></p>
    </main>

    <script src="js/app.js"></script>
</body>
</html>