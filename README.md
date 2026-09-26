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