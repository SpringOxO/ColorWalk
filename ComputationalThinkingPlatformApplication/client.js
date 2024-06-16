const socket = new WebSocket('ws://localhost:3000/ws');

socket.onopen = function(event) {
    console.log('WebSocket is open now.');
    
    // Send init message
    socket.send(JSON.stringify({
        type: 'init',
        x: 100,
        y: 100,
        z: 100,
    }));
};

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Message from server ', data);
    
    // Example of sending update message periodically
    setInterval(() => {
        socket.send(JSON.stringify({
            type: 'update',
            x: Math.random() * 100,
            y: Math.random() * 100,
            z: Math.random() * 100,
        }));
    }, 5000);
};

socket.onclose = function(event) {
    console.log('WebSocket is closed now.');
};

socket.onerror = function(error) {
    console.log('WebSocket Error: ', error);
};
