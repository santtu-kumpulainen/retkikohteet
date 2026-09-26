const form = document.querySelector('#destination-form');
const message = document.querySelector('#message');

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Collect form values
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        // Send destination to API
        const response = await fetch('/api/destinations.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Retkikohteen lisääminen epäonnistui.');
        }

        // Show success message
        message.textContent = 'Retkikohde lisätty onnistuneesti.';
        form.reset();
    } catch (error) {
        // Show error message
        message.textContent = error.message;
    }
});

const destinationsList = document.querySelector('#destinations-list');

async function loadDestinations() {
    try {
        // Fetch all destinations from API
        const response = await fetch('/api/destinations.php');

        if (!response.ok) {
            throw new Error('Retkikohteiden lataaminen epäonnistui.');
        }

        const destinations = await response.json();

        // Clear loading message
        destinationsList.innerHTML = '';

        if (destinations.length === 0) {
            destinationsList.innerHTML = '<p>Ei retkikohteita.</p>';
            return;
        }

        // Create a list of destinations
        destinations.forEach((destination) => {
            const article = document.createElement('article');

            article.innerHTML = `
    <h3>${destination.name}</h3>
    <p><strong>Sijainti:</strong> ${destination.location}</p>
    <p><strong>Tyyppi:</strong> ${destination.type}</p>
    <p><strong>Vaikeustaso:</strong> ${destination.difficulty}</p>
    <p>${destination.description ?? ''}</p>
    <button onclick="showDestination(${destination.id})">
        Näytä tiedot
    </button>
`;

            destinationsList.appendChild(article);
        });
    } catch (error) {
        // Show loading error
        destinationsList.innerHTML = `<p>${error.message}</p>`;
    }
}

async function showDestination(id) {
    try {
        // Fetch destination by ID
        const response = await fetch(`/api/destinations.php?id=${id}`);

        if (!response.ok) {
            throw new Error('Retkikohteen tietojen hakeminen epäonnistui.');
        }

        const destination = await response.json();

        // Show destination details
        destinationsList.innerHTML = `
            <article>
    <h2>${destination.name}</h2>
    <p><strong>Sijainti:</strong> ${destination.location}</p>
    <p><strong>Kuvaus:</strong> ${destination.description ?? ''}</p>
    <p><strong>Leveysaste:</strong> ${destination.latitude}</p>
    <p><strong>Pituusaste:</strong> ${destination.longitude}</p>
    <p><strong>Tyyppi:</strong> ${destination.type}</p>
    <p><strong>Vaikeustaso:</strong> ${destination.difficulty}</p>
    <p><strong>Suunniteltu päivämäärä:</strong> ${destination.planned_date ?? 'Ei määritetty'}</p>

    <button onclick="editDestination(${destination.id})">
    Muokkaa
</button>

<button onclick="deleteDestination(${destination.id})">
    Poista
</button>

<button onclick="loadDestinations()">
    Takaisin listaan
</button>
</article>

            
        `;
    } catch (error) {
        // Show error message
        destinationsList.innerHTML = `<p>${error.message}</p>`;
    }
}

async function editDestination(id) {
    try {
        // Fetch destination data
        const response = await fetch(`/api/destinations.php?id=${id}`);

        if (!response.ok) {
            throw new Error('Retkikohteen tietojen hakeminen epäonnistui.');
        }

        const destination = await response.json();

        // Show edit form
        destinationsList.innerHTML = `
            <h2>Muokkaa retkikohdetta</h2>

            <form id="edit-form">
                <label>Nimi</label>
                <input id="edit-name" value="${destination.name}" required>

                <label>Sijainti</label>
                <input id="edit-location" value="${destination.location}" required>

                <label>Kuvaus</label>
                <textarea id="edit-description">${destination.description ?? ''}</textarea>

                <label>Leveysaste</label>
                <input type="number" id="edit-latitude" value="${destination.latitude}" step="any" required>

                <label>Pituusaste</label>
                <input type="number" id="edit-longitude" value="${destination.longitude}" step="any" required>

                <label>Tyyppi</label>
                <input id="edit-type" value="${destination.type}" required>

                <label>Vaikeustaso</label>
                <input id="edit-difficulty" value="${destination.difficulty}" required>

                <label>Suunniteltu päivämäärä</label>
                <input type="date" id="edit-planned-date" value="${destination.planned_date ?? ''}">

                <button type="submit">Tallenna muutokset</button>
                <button type="button" onclick="showDestination(${id})">
                    Peruuta
                </button>
            </form>

            <p id="edit-message"></p>
        `;

        document.querySelector('#edit-form').addEventListener('submit', (event) => {
            updateDestination(event, id);
        });
    } catch (error) {
        destinationsList.innerHTML = `<p>${error.message}</p>`;
    }
}

async function updateDestination(event, id) {
    event.preventDefault();

    const data = {
        name: document.querySelector('#edit-name').value,
        location: document.querySelector('#edit-location').value,
        description: document.querySelector('#edit-description').value,
        latitude: document.querySelector('#edit-latitude').value,
        longitude: document.querySelector('#edit-longitude').value,
        type: document.querySelector('#edit-type').value,
        difficulty: document.querySelector('#edit-difficulty').value,
        planned_date: document.querySelector('#edit-planned-date').value
    };

    try {
        // Send updated destination to API
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

        // Return to updated destination
        await showDestination(id);
    } catch (error) {
        document.querySelector('#edit-message').textContent = error.message;
    }
}

async function deleteDestination(id) {
    // Ask for confirmation before deleting
    const confirmed = confirm('Haluatko varmasti poistaa tämän retkikohteen?');

    if (!confirmed) {
        return;
    }

    try {
        // Send delete request to API
        const response = await fetch(`/api/destinations.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Retkikohteen poistaminen epäonnistui.');
        }

        // Return to destination list
        await loadDestinations();
    } catch (error) {
        // Show delete error
        destinationsList.innerHTML = `<p>${error.message}</p>`;
    }
}

loadDestinations();