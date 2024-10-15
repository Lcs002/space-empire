export function setupSocketHandlers(socket) {
    // Handle game state updates from server
    socket.on('updateGameState', (data) => {
        // Update game state
    });

    // Handle WebSocket authentication error
    socket.on('connect_error', (err) => {
        console.error('Authentication error:', err.message);
        alert('Session expired or invalid token. Please log in again.');
        window.location.href = '/login.html'; // Redirect to login page
    });

    // Handle found planets data
    socket.on('foundPlanets', (planets) => {
        // Handle planets found
    });

    // Handle nearby planets response
    socket.on('foundNearbyPlanets', (planets) => {
        // Logic to display the nearby planets on the client side
    });

    // Handle planet conquered event
    socket.on('planetConquered', (uuid) => {
        // Update UI when a planet is conquered
    });
}
