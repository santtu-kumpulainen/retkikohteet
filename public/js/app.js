const form = document.querySelector('#destination-form');
const message = document.querySelector('#message');
const destinationsList = document.querySelector('#destinations-list');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');

let map;
let marker;

/* Escape user data before adding it to HTML */
function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* Format database date for Finnish UI */
function formatDate(date) {
    if (!date) {
        return 'Ei määritetty';
    }

    const parts = date.split('-');

    if (parts.length !== 3) {
        return date;
    }

    return `${Number(parts[2])}.${Number(parts[1])}.${parts[0]}`;
}

/* Show a message below the form */
function showMessage(text, type = '') {
    message.textContent = text;
    message.className = `message ${type}`;
}

/* Return a CSS class for difficulty */
function difficultyClass(difficulty) {
    if (difficulty === 'Helppo') {
        return 'easy';
    }

    if (difficulty === 'Keskivaikea') {
        return 'medium';
    }

    if (difficulty === 'Vaativa') {
        return 'hard';
    }

    return '';
}

/* Initialize Leaflet map */
function initializeMap() {
    map = L.map('map').setView([62.2426, 25.7473], 5.5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', async (event) => {
        await selectLocation(
            event.latlng.lat,
            event.latlng.lng,
            'Valittu sijainti'
        );
    });
}

/* Set marker and hidden coordinates */
async function selectLocation(latitude, longitude, fallbackName = 'Valittu sijainti') {
    document.querySelector('#latitude').value = latitude.toFixed(6);
    document.querySelector('#longitude').value = longitude.toFixed(6);

    if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(map);
    } else {
        marker.setLatLng([latitude, longitude]);
    }

    map.setView([latitude, longitude], Math.max(map.getZoom(), 10));

    const status = document.querySelector('#location-status');
    status.textContent = `${fallbackName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    // Try to find a readable place name from the coordinates.
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fi`
        );

        if (response.ok) {
            const result = await response.json();
            const locationName = result.display_name || fallbackName;

            document.querySelector('#location').value = locationName;
            status.textContent = `Valittu sijainti: ${locationName}`;
        }
    } catch (error) {
        document.querySelector('#location').value = fallbackName;
    }
}

/* Search a place with OpenStreetMap Nominatim */
async function searchLocation() {
    const input = document.querySelector('#location-search');
    const status = document.querySelector('#location-status');
    const query = input.value.trim();

    if (!query) {
        status.textContent = 'Kirjoita ensin paikan tai retkikohteen nimi.';
        status.className = 'form-hint error';
        return;
    }

    status.className = 'form-hint';
    status.textContent = 'Haetaan sijaintia...';

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&countrycodes=fi&limit=1&accept-language=fi`
        );

        if (!response.ok) {
            throw new Error('Sijainnin hakeminen epäonnistui.');
        }

        const results = await response.json();

        if (results.length === 0) {
            throw new Error('Sijaintia ei löytynyt.');
        }

        const result = results[0];
        const latitude = Number(result.lat);
        const longitude = Number(result.lon);

        document.querySelector('#location').value = result.display_name;
        document.querySelector('#latitude').value = latitude.toFixed(6);
        document.querySelector('#longitude').value = longitude.toFixed(6);

        if (!marker) {
            marker = L.marker([latitude, longitude]).addTo(map);
        } else {
            marker.setLatLng([latitude, longitude]);
        }

        map.setView([latitude, longitude], 12);

        status.textContent = `Valittu sijainti: ${result.display_name}`;
    } catch (error) {
        status.className = 'form-hint error';
        status.textContent = error.message;
    }
}

/* Load all destinations */
async function loadDestinations() {
    destinationsList.innerHTML = '<p class="loading">Ladataan retkikohteita...</p>';

    try {
        const response = await fetch('/api/destinations.php');

        if (!response.ok) {
            throw new Error('Retkikohteiden lataaminen epäonnistui.');
        }

        const destinations = await response.json();

        renderDestinations(destinations);
    } catch (error) {
        destinationsList.innerHTML =
            `<p class="error-state">${escapeHtml(error.message)}</p>`;
    }
}

/* Render destination cards */
function renderDestinations(destinations) {
    destinationsList.innerHTML = '';

    updateDestinationCount(destinations.length);

    if (destinations.length === 0) {
        destinationsList.innerHTML =
            '<p class="empty-state">Ei vielä tallennettuja retkikohteita.</p>';
        return;
    }

    destinations.forEach((destination) => {
        const article = document.createElement('article');
        article.className = 'destination-card';
        article.dataset.name =
            `${destination.name} ${destination.location}`.toLowerCase();
        article.dataset.type = destination.type;

        const difficulty = escapeHtml(destination.difficulty);
        const type = escapeHtml(destination.type);

        article.innerHTML = `
            <div class="destination-top">
                <div>
                    <div class="badges">
                        <span class="badge">${type}</span>
                        <span class="badge ${difficultyClass(destination.difficulty)}">
                            ${difficulty}
                        </span>
                    </div>

                    <h3>${escapeHtml(destination.name)}</h3>

                    <p class="destination-location">
                        📍 ${escapeHtml(destination.location)}
                    </p>
                </div>

                <span class="destination-date">
                    ${formatDate(destination.planned_date)}
                </span>
            </div>

            <p class="destination-description">
                ${escapeHtml(destination.description || 'Ei lisättyä kuvausta.')}
            </p>

            <div class="destination-footer">
                <div class="weather-summary">
                    Säätiedot saatavilla kohteen koordinaattien perusteella.
                </div>

                <div class="destination-actions">
                    <button
                        class="link-button"
                        type="button"
                        onclick="showWeather(${destination.id})"
                    >
                        Sää
                    </button>

                    <button
                        class="link-button"
                        type="button"
                        onclick="editDestination(${destination.id})"
                    >
                        Muokkaa
                    </button>

                    <button
                        class="link-button delete"
                        type="button"
                        onclick="deleteDestination(${destination.id})"
                    >
                        Poista
                    </button>
                </div>
            </div>
        `;

        destinationsList.appendChild(article);
    });

    filterDestinations();
}

// Filter destination cards
function filterDestinations() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedType = typeFilter.value.trim().toLowerCase();

    const cards = destinationsList.querySelectorAll('.destination-card');
    let visibleCount = 0;

    cards.forEach((card) => {
        const name = (card.dataset.name || '').toLowerCase();
        const type = (card.dataset.type || '').trim().toLowerCase();

        const matchesSearch = name.includes(searchTerm);
        const matchesType =
            selectedType === 'kaikki' || type === selectedType;

        const visible = matchesSearch && matchesType;

        // Show or hide the card
        if (visible) {
            card.style.setProperty('display', 'flex', 'important');
            visibleCount++;
        } else {
            card.style.setProperty('display', 'none', 'important');
        }
    });

    updateDestinationCount(visibleCount);
}

/* Update destination counter */
function updateDestinationCount(count) {
    const counter = document.querySelector('#destination-counter');

    if (counter) {
        counter.textContent =
            `${count} ${count === 1 ? 'kohde' : 'kohdetta'}`;
    }
}

/* Show one destination */
async function showDestination(id) {
    try {
        const response = await fetch(`/api/destinations.php?id=${id}`);

        if (!response.ok) {
            throw new Error('Retkikohteen tietojen hakeminen epäonnistui.');
        }

        const destination = await response.json();

        document.querySelector('#name').value = destination.name;
        document.querySelector('#location').value = destination.location;
        document.querySelector('#description').value =
            destination.description || '';
        document.querySelector('#latitude').value = destination.latitude;
        document.querySelector('#longitude').value = destination.longitude;
        document.querySelector('#type').value = destination.type;
        document.querySelector('#difficulty').value = destination.difficulty;
        document.querySelector('#planned_date').value =
            destination.planned_date || '';

        if (map && destination.latitude && destination.longitude) {
            const latitude = Number(destination.latitude);
            const longitude = Number(destination.longitude);

            if (!marker) {
                marker = L.marker([latitude, longitude]).addTo(map);
            } else {
                marker.setLatLng([latitude, longitude]);
            }

            map.setView([latitude, longitude], 12);
        }

        document.querySelector('#add-destination-section')
            .scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

/* Edit destination */
async function editDestination(id) {
    try {
        const response = await fetch(`/api/destinations.php?id=${id}`);

        if (!response.ok) {
            throw new Error('Retkikohteen tietojen hakeminen epäonnistui.');
        }

        const destination = await response.json();

        document.querySelector('#name').value = destination.name;
        document.querySelector('#location').value = destination.location;
        document.querySelector('#description').value =
            destination.description || '';
        document.querySelector('#latitude').value = destination.latitude;
        document.querySelector('#longitude').value = destination.longitude;
        document.querySelector('#type').value = destination.type;
        document.querySelector('#difficulty').value = destination.difficulty;
        document.querySelector('#planned_date').value =
            destination.planned_date || '';

        const formButton = form.querySelector('button[type="submit"]');
        formButton.textContent = 'Tallenna muutokset';
        form.dataset.editingId = id;

        if (map && destination.latitude && destination.longitude) {
            const latitude = Number(destination.latitude);
            const longitude = Number(destination.longitude);

            if (!marker) {
                marker = L.marker([latitude, longitude]).addTo(map);
            } else {
                marker.setLatLng([latitude, longitude]);
            }

            map.setView([latitude, longitude], 12);
        }

        document.querySelector('#add-destination-section')
            .scrollIntoView({ behavior: 'smooth' });

        showMessage(`Muokataan kohdetta "${destination.name}".`);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

/* Save edited destination */
async function updateDestination(id) {
    const data = {
        name: document.querySelector('#name').value.trim(),
        location: document.querySelector('#location').value.trim(),
        description: document.querySelector('#description').value.trim(),
        latitude: document.querySelector('#latitude').value,
        longitude: document.querySelector('#longitude').value,
        type: document.querySelector('#type').value,
        difficulty: document.querySelector('#difficulty').value,
        planned_date: document.querySelector('#planned_date').value
    };

    try {
        const response = await fetch(`/api/destinations.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Muokkaus epäonnistui.');
        }

        resetFormState();
        showMessage('Retkikohde päivitetty onnistuneesti.', 'success');
        await loadDestinations();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

/* Delete destination */
async function deleteDestination(id) {
    const confirmed = confirm(
        'Haluatko varmasti poistaa tämän retkikohteen?'
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/destinations.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || 'Retkikohteen poistaminen epäonnistui.'
            );
        }

        await loadDestinations();
        showMessage('Retkikohde poistettu.', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

/* Show weather */
async function showWeather(id) {
    try {
        const response = await fetch(
            `/api/destination-weather.php?id=${id}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || 'Säätietojen hakeminen epäonnistui.'
            );
        }

        const current = result.weather.current;

        destinationsList.innerHTML = `
            <article class="destination-card">
                <div class="destination-top">
                    <div>
                        <div class="badges">
                            <span class="badge">Sää</span>
                        </div>
                        <h3>${escapeHtml(result.destination.name)}</h3>
                        <p class="destination-location">
                            ${escapeHtml(result.destination.location)}
                        </p>
                    </div>
                </div>

                <p class="destination-description">
                    Lämpötila:
                    <strong>${escapeHtml(current.temperature_2m)} °C</strong><br>
                    Tuulen nopeus:
                    <strong>${escapeHtml(current.wind_speed_10m)} km/h</strong>
                </p>

                <div class="destination-actions">
                    <button
                        class="link-button"
                        type="button"
                        onclick="loadDestinations()"
                    >
                        Takaisin kohteisiin
                    </button>
                </div>
            </article>
        `;
    } catch (error) {
        destinationsList.innerHTML =
            `<p class="error-state">${escapeHtml(error.message)}</p>`;
    }
}

/* Reset form and map state */
function resetFormState() {
    form.reset();
    delete form.dataset.editingId;

    const formButton = form.querySelector('button[type="submit"]');
    formButton.textContent = 'Tallenna retkikohde';

    document.querySelector('#latitude').value = '';
    document.querySelector('#longitude').value = '';

    document.querySelector('#location-status').textContent =
        'Valitse kohde hakemalla tai klikkaamalla karttaa.';

    if (marker && map) {
        map.removeLayer(marker);
        marker = null;
    }
}

/* Handle form reset */
document.querySelector('#reset-form-button').addEventListener(
    'click',
    () => {
        resetFormState();
        showMessage('');
    }
);

/* Search and filters */
document.querySelector('#search-location-button')
    .addEventListener('click', searchLocation);

document.querySelector('#location-search')
    .addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchLocation();
        }
    });

document.querySelector('#search-input')
    .addEventListener('input', filterDestinations);

document.querySelector('#type-filter')
    .addEventListener('change', filterDestinations);

/* Submit either a new destination or an edit */
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const editingId = form.dataset.editingId;

    if (editingId) {
        await updateDestination(editingId);
        return;
    }

    const data = {
        name: document.querySelector('#name').value.trim(),
        location: document.querySelector('#location').value.trim(),
        description: document.querySelector('#description').value.trim(),
        latitude: document.querySelector('#latitude').value,
        longitude: document.querySelector('#longitude').value,
        type: document.querySelector('#type').value,
        difficulty: document.querySelector('#difficulty').value,
        planned_date: document.querySelector('#planned_date').value
    };

    if (!data.latitude || !data.longitude) {
        showMessage(
            'Valitse retkikohteen sijainti kartalta ennen tallentamista.',
            'error'
        );
        return;
    }

    try {
        const response = await fetch('/api/destinations.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || 'Retkikohteen lisääminen epäonnistui.'
            );
        }

        resetFormState();
        showMessage('Retkikohde lisätty onnistuneesti.', 'success');
        await loadDestinations();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

/* Initialize application */
initializeMap();
loadDestinations();
