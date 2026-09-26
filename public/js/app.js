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