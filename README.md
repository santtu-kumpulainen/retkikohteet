# Retkikohteet-sovellus

Web-sovellus retkikohteiden hallintaan. Sovelluksessa voidaan lisätä, tarkastella, muokata ja poistaa retkikohteita sekä näyttää kohteeseen liittyviä säätietoja.

## Teknologiat

- PHP
- HTML
- CSS
- JavaScript
- MariaDB / MySQL
- PDO
- Docker
- Docker Compose
- Open-Meteo API
- Git ja GitHub

## Projektin rakenne

```text
retkikohteet/
├── api/
│   └── Backendin API-toiminnot
├── config/
│   └── Tietokannan yhteysasetukset
├── database/
│   └── Tietokannan alustukseen liittyvät tiedostot
├── public/
│   ├── index.php
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── Dockerfile
├── docker-compose.yml
├── README.md
└── .dockerignore

## Kansioiden tarkoitus

- api/ sisältää backendin API-toiminnot.
- config/ sisältää sovelluksen asetukset ja tietokantayhteyden.
- database/ sisältää tietokannan alustamiseen liittyvät tiedostot.
- public/ sisältää selaimelle näkyvän frontendin.
- public/css/ sisältää CSS-tyylit.
- public/js/ sisältää JavaScript-koodin.

## Tietokanta

Sovelluksen retkikohteet tallennetaan `destinations`-tauluun.

| Kenttä | Tyyppi | Kuvaus |
|---|---|---|
| `id` | INT UNSIGNED | Yksilöllinen tunniste |
| `name` | VARCHAR(150) | Retkikohteen nimi |
| `location` | VARCHAR(150) | Kohteen sijainti |
| `description` | TEXT | Kohteen kuvaus |
| `latitude` | DECIMAL(9,6) | Leveysaste |
| `longitude` | DECIMAL(9,6) | Pituusaste |
| `type` | VARCHAR(50) | Kohteen tyyppi |
| `difficulty` | VARCHAR(50) | Vaikeustaso |
| `planned_date` | DATE | Suunniteltu retkipäivä |
| `created_at` | TIMESTAMP | Tietueen luontiaika |