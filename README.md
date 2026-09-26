# Retkikohteet-sovellus

Web-sovellus retkikohteiden hallintaan. Sovelluksella voidaan lisätä, tarkastella, muokata ja poistaa retkikohteita sekä hakea kohteelle säätietoja Open-Meteo-rajapinnasta.

## Projektin tarkoitus

Projektin tavoitteena on toteuttaa toimiva web-sovellus, jossa harjoitellaan:

- PHP-backendin rakentamista
- MySQL/MariaDB-tietokannan käyttöä
- API-rajapinnan rakentamista
- JavaScriptin käyttöä frontendissä
- ulkoisen API-rajapinnan käyttöä
- lomakkeiden validointia ja virheenkäsittelyä
- Docker-ympäristön käyttöä
- GitHub-issueiden, branchien ja pull requestien käyttöä

## Teknologiat

- PHP
- HTML
- CSS
- JavaScript
- MariaDB / MySQL
- PDO
- Docker
- Docker Compose
- Leaflet
- OpenStreetMap
- Nominatim
- Open-Meteo API
- Git
- GitHub

## Projektin rakenne

```text
retkikohteet/
├── config/
│   └── database.php
├── database/
│   └── init.sql
├── public/
│   ├── api/
│   │   ├── destinations.php
│   │   ├── destination-weather.php
│   │   └── weather.php
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.php
├── Dockerfile
├── docker-compose.yml
├── README.md
└── .dockerignore
```

### Kansioiden tarkoitus

- `config/` sisältää tietokantayhteyden asetukset.
- `database/` sisältää tietokannan alustamiseen tarvittavan SQL-tiedoston.
- `public/` sisältää selaimelle näkyvän sovelluksen.
- `public/api/` sisältää backendin API-reitit.
- `public/css/` sisältää käyttöliittymän CSS-tyylit.
- `public/js/` sisältää frontendin JavaScript-koodin.

## Asennus

### Vaatimukset

Projektin suorittamiseen tarvitaan:

- Docker
- Docker Compose
- Git

Kloonaa repository:

```bash
git clone <repository-url>
cd retkikohteet
```

Luo projektin juureen `.env`-tiedosto:

```env
MARIADB_ROOT_PASSWORD=<root-password>
MARIADB_DATABASE=retkikohteet
MARIADB_USER=retkikohteet
MARIADB_PASSWORD=<database-password>
```

`.env`-tiedostoa ei lisätä GitHubiin.

## Käynnistäminen

Käynnistä Docker-palvelut:

```bash
docker compose up -d --build
```

Tarkista palveluiden tila:

```bash
docker compose ps
```

Sovellus avautuu esimerkiksi osoitteessa:

```text
http://localhost:8001
```

Portti riippuu `docker-compose.yml`-tiedoston asetuksista.

Sammuta projektin Docker-palvelut:

```bash
docker compose down
```

Tietokannan sisältö säilyy Docker-volumessa, ellei volumetä poisteta erikseen.

## Tietokannan alustaminen

Tietokanta alustetaan projektin `database/init.sql`-tiedostolla.

Tietokannan `destinations`-taulu sisältää seuraavat kentät:

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

Tietokanta alustetaan Docker-ympäristön ensimmäisellä käynnistyskerralla, jos tietokantavolumessa ei ole vielä alustettua tietokantaa.

## API

Frontend käyttää PHP-backendin API-reittejä.

### Kaikkien retkikohteiden hakeminen

```http
GET /api/destinations.php
```

Palauttaa kaikki tallennetut retkikohteet.

### Yksittäisen retkikohteen hakeminen

```http
GET /api/destinations.php?id=1
```

Jos kohdetta ei löydy, API palauttaa `404`-vastauksen.

### Retkikohteen lisääminen

```http
POST /api/destinations.php
```

Esimerkkipyyntö:

```json
{
    "name": "Koli",
    "location": "Lieksa",
    "description": "Retkikohde Pohjois-Karjalassa",
    "latitude": 63.099,
    "longitude": 29.798,
    "type": "Kansallispuisto",
    "difficulty": "Keskivaikea",
    "planned_date": "2026-10-01"
}
```

### Retkikohteen muokkaaminen

```http
PUT /api/destinations.php?id=1
```

Pyyntö sisältää kohteen päivitettävät tiedot.

### Retkikohteen poistaminen

```http
DELETE /api/destinations.php?id=1
```

### Säätietojen hakeminen

```http
GET /api/destination-weather.php?id=1
```

Backend hakee kohteen koordinaatit tietokannasta ja käyttää niitä Open-Meteo-rajapinnan kutsussa.

## Validointi ja virheenkäsittely

Backend tarkistaa käyttäjän lähettämät tiedot ennen niiden tallentamista.

Tarkistuksia ovat esimerkiksi:

- pakolliset kentät eivät saa puuttua
- JSON-syötteen pitää olla kelvollinen
- leveysasteen pitää olla välillä `-90...90`
- pituusasteen pitää olla välillä `-180...180`
- kohteen pitää löytyä tietokannasta ennen muokkausta tai poistamista

Virhetilanteissa API palauttaa tarkoituksenmukaisen HTTP-statuskoodin ja JSON-muotoisen virheilmoituksen.

Esimerkiksi:

```json
{
    "error": "Invalid coordinates"
}
```

## Kartta ja sijainnin haku

Sovelluksessa käytetään Leaflet-kirjastoa ja OpenStreetMap-kartta-aineistoa.

Käyttäjä voi:

- klikata sijainnin kartalta
- hakea paikan nimellä
- tallentaa sijainnin leveys- ja pituusasteet retkikohteen tietoihin

Paikan tekstihaku ja koordinaattien perusteella tehtävä paikannimi perustuvat OpenStreetMapin Nominatim-palveluun.

## Open-Meteo

Säätiedot haetaan Open-Meteo Weather API -rajapinnasta.

Frontend ei kutsu säärajapintaa suoraan, vaan pyyntö kulkee oman PHP-backendin kautta:

```text
Frontend
   ↓
destination-weather.php
   ↓
Open-Meteo
   ↓
PHP-backend
   ↓
Frontend
```

Säärajapinta käyttää retkikohteen leveys- ja pituusasteita säädatan hakemiseen.

Open-Meteo ei vaadi API-avainta tämän projektin käyttötavassa.

## Käyttöliittymä

Käyttöliittymässä käyttäjä voi:

- tarkastella tallennettuja retkikohteita
- hakea kohteita nimellä tai paikkakunnalla
- suodattaa kohteita tyypin perusteella
- lisätä uuden retkikohteen
- valita sijainnin kartalta
- muokata kohdetta
- poistaa kohteen
- hakea kohteen säätiedot

Retkikohteet esitetään korteissa ja käyttöliittymä mukautuu pienemmille näytöille.

## Testaus

Projektin tärkeimmät toiminnot testataan ennen projektin palauttamista.

Testauslista:

- [x] Retkikohteen lisääminen
- [x] Retkikohteiden listaaminen
- [x] Yksittäisen kohteen hakeminen
- [x] Retkikohteen muokkaaminen
- [x] Retkikohteen poistaminen
- [x] Virheellisten tietojen validointi
- [x] Koordinaattien validointi
- [x] Kartan toiminta
- [x] Sijainnin haku
- [x] Retkikohteiden tekstihaku
- [x] Retkikohteiden tyypin suodatus
- [x] Responsiivinen käyttöliittymä
- [x] Säätietojen hakeminen

Virhetilanteita testataan esimerkiksi virheellisellä JSON-syötteellä ja virheellisillä koordinaateilla.

## GitHub-työskentely

Projektissa käytettiin GitHub Issueita ja brancheja eri ominaisuuksien toteuttamiseen.

Työvaiheet:

```text
Issue
  ↓
Feature branch
  ↓
Toteutus
  ↓
Commit
  ↓
Pull Request
  ↓
Testaus
  ↓
Squash and merge
```

Eri toiminnallisuudet toteutettiin omissa brancheissaan ja yhdistettiin `main`-haaraan pull requestien kautta.

Pull requestit linkitettiin niihin liittyviin issueihin esimerkiksi `Closes #18` -merkinnällä.

## Työnjako

Projekti toteutettiin yksin opettajan luvalla.

Työ tehtiin GitHub Issueiden avulla ja eri toiminnallisuudet toteutettiin erillisissä brancheissa. Pull requestit tarkistettiin ennen mergeämistä itse.

Koska projekti toteutettiin yksin, toisen työparin jäsenen tekemää code reviewta ei ollut mahdollista tehdä.

## Tekoälyn hyödyntäminen

Tekoälyä käytettiin ohjelmoinnin tukena projektin aikana.

Tekoälyä hyödynnettiin esimerkiksi:

- koodin rakenteen suunnittelussa
- virheilmoitusten tulkitsemisessa
- SQL-rakenteiden suunnittelussa
- API-toimintojen suunnittelussa
- JavaScript-koodin ongelmien selvittämisessä
- validoinnin suunnittelussa
- käyttöliittymän suunnittelussa
- testitapausten suunnittelussa
- README-dokumentaation rakenteen suunnittelussa

Tekoälyn ehdottama koodi tarkistettiin ja muokattiin projektin tarpeisiin. Koodin toiminta käytiin itse läpi ja muutokset testattiin ennen käyttöönottoa.

## Tunnetut rajoitukset

- Sovelluksessa ei ole käyttäjätunnuksia tai kirjautumista.
- Retkikohteet eivät ole käyttäjäkohtaisia.
- Säätiedot haetaan käyttäjän pyynnöstä.
- Sovellus on tarkoitettu kouluprojektiksi eikä tuotantokäyttöön.
- Nominatim- ja OpenStreetMap-palveluiden käyttöön liittyvät palvelukohtaiset rajoitukset tulee huomioida suuremmassa käytössä.
- Projektissa ei ole erillistä automaattista testausjärjestelmää.

## Projektin tavoitteet

Projektissa harjoiteltiin erityisesti:

- CRUD-toimintoja
- PHP:n ja PDO:n käyttöä
- MySQL/MariaDB-tietokantaa
- API-toimintoja
- JavaScriptin ja backendin välistä tiedonsiirtoa
- ulkoisten API-rajapintojen käyttöä
- Docker-kehitysympäristöä
- GitHub-issueita ja pull requesteja
- validointia ja virheenkäsittelyä
- käyttöliittymän suunnittelua ja responsiivisuutta
