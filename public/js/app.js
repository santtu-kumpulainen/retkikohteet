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
            </article>

            <button onclick="loadDestinations()">
                Takaisin listaan
            </button>
        `;
    } catch (error) {
        // Show error message
        destinationsList.innerHTML = `<p>${error.message}</p>`;
    }
}

loadDestinations();