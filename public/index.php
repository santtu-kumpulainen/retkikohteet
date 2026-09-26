<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retkikohteet</title>

    <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossorigin=""
    >
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="#">
            <span class="brand-icon">▲</span>
            <span>Retkikohteet</span>
        </a>

        <nav class="main-nav" aria-label="Päänavigaatio">
            <a href="#destinations-section">Kohteet</a>
            <a href="#add-destination-section">Lisää kohde</a>
            <a href="#map-section">Kartta</a>
        </nav>
    </div>
</header>

<main class="container page-content">

    <section class="hero">
        <img
            src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2200&q=85"
            alt="Metsäinen retkeilyreitti"
        >

        <div class="hero-overlay">
            <div class="container hero-content">
                <p class="hero-kicker">Suomalaiset luontokohteet</p>
                <h1>Retkikohteet</h1>
                <p>Löydä ja tallenna retkikohteita.</p>
            </div>
        </div>
    </section>

    <section class="panel" id="map-section">
        <div class="section-heading">
            <div>
                <h2>Etsi retkikohde</h2>
                <p>Hae paikka tai valitse sijainti kartalta.</p>
            </div>
        </div>

        <div class="location-search">
            <label for="location-search">Hae paikkaa tai retkikohdetta</label>

            <div class="search-row">
                <input
                    type="search"
                    id="location-search"
                    placeholder="esim. Repovesi tai Koli"
                >
                <button type="button" class="button secondary" id="search-location-button">
                    Hae
                </button>
            </div>

            <div id="location-status" class="form-hint">
                Valitse kohde hakemalla tai klikkaamalla karttaa.
            </div>
        </div>

        <div id="map" class="map" aria-label="Retkikohteen sijainnin kartta"></div>

        <input type="hidden" id="latitude" name="latitude">
        <input type="hidden" id="longitude" name="longitude">

        <p class="map-help">
            Klikkaa karttaa valitaksesi sijainnin.
        </p>
    </section>

    <section class="panel" id="add-destination-section">
        <div class="section-heading">
            <div>
                <h2>Retkikohteen tiedot</h2>
                <p>Anna kohteelle nimi ja muut perustiedot.</p>
            </div>
        </div>

        <form id="destination-form">
            <div class="form-grid">

                <div class="form-column">
                    <div class="form-group">
                        <label for="name">Kohteen nimi *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="esim. Repoveden kansallispuisto"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="location">Sijainti *</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            placeholder="Valitse sijainti kartalta"
                            required
                        >
                    </div>

                    <div class="two-columns">
                        <div class="form-group">
                            <label for="type">Tyyppi *</label>
                            <select id="type" name="type" required>
                                <option value="">Valitse tyyppi</option>
                                <option value="Kansallispuisto">Kansallispuisto</option>
                                <option value="Päiväreitti">Päiväreitti</option>
                                <option value="Erämaa-alue">Erämaa-alue</option>
                                <option value="Luonnonsuojelualue">Luonnonsuojelualue</option>
                                <option value="Lähiluontokohde">Lähiluontokohde</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="difficulty">Vaikeustaso *</label>
                            <select id="difficulty" name="difficulty" required>
                                <option value="">Valitse taso</option>
                                <option value="Helppo">Helppo</option>
                                <option value="Keskivaikea">Keskivaikea</option>
                                <option value="Vaativa">Vaativa</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="planned_date">Suunniteltu päivämäärä</label>
                        <input type="date" id="planned_date" name="planned_date">
                    </div>
                </div>

                <div class="form-column">
                    <div class="form-group full-height">
                        <label for="description">Kuvaus ja muistiinpanot</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="9"
                            placeholder="Kuvaile reittiä, maastoa, taukopaikkoja tai muita huomioita..."
                        ></textarea>
                    </div>
                </div>

            </div>

            <div class="form-actions">
                <button type="reset" class="button secondary" id="reset-form-button">
                    Tyhjennä
                </button>
                <button type="submit" class="button primary">
                    Tallenna retkikohde
                </button>
            </div>

            <p id="message" class="message" role="status"></p>
        </form>
    </section>

    <section id="destinations-section">
        <div class="destinations-header">
            <div>
                <h2>Tallennetut retkikohteet</h2>
                <span id="destination-counter" class="counter">0 kohdetta</span>
            </div>

            <div class="filters">
                <input
                    type="search"
                    id="search-input"
                    placeholder="Hae nimellä tai paikkakunnalla..."
                    aria-label="Hae retkikohteita"
                >

                <select id="type-filter" aria-label="Suodata tyypin mukaan">
                    <option value="Kaikki">Kaikki tyypit</option>
                    <option value="Kansallispuisto">Kansallispuisto</option>
                    <option value="Päiväreitti">Päiväreitti</option>
                    <option value="Erämaa-alue">Erämaa-alue</option>
                    <option value="Luonnonsuojelualue">Luonnonsuojelualue</option>
                    <option value="Lähiluontokohde">Lähiluontokohde</option>
                </select>
            </div>
        </div>

        <div id="destinations-list" class="destinations-list">
            <p class="loading">Ladataan retkikohteita...</p>
        </div>
    </section>

</main>

<footer class="site-footer">
    <div class="container footer-inner">
        <span><strong>Retkikohteet</strong> — Suomalaiset luontokohteet ja retkisuunnitelmat</span>
        <span>© 2026 Retkikohteet</span>
    </div>
</footer>

<script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
></script>
<script src="js/app.js"></script>
</body>
</html>
