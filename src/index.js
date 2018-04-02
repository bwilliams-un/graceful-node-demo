const http = require('http');
const Koa = require('koa');

const PORT = process.env.PORT || 8080;
const app = new Koa();

// Default server error handler
app.on('error', err => {
    // connection aborted
    if (err.code === 'ECONNRESET') return;
    console.error('Error (%s): %s', err.code || err.errno || '', err.stack || err.message || err);
});

// Simple test endpoint
app.use(async ctx => {
    // Pause for 2s + 0-1s
    await new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, Math.random() * 1000 + 2000);
    });
    ctx.body = `
    <!doctype html>
    <html>
        <head>
            <title>HTTP Status</title>
        </head>
        <body>
            <p>Open connections: ${connections}
        </body>
    </html>
    `;
});

// create server. doing it manually instead of app.listen lets you setup for TLS or HTTP2
const server = http.createServer(app.callback());

// Server's do not expose a simple connection-close event
// If you want to keep track of sockets you have to track them yourself
// server does expose an async getConnections() for total count, it's not very performant
let connections = 0;
server.on('connection', socket => {
    connections++;
    console.log('New connection (%d)', connections);
    socket.on('close', () => {
        connections--;
        console.log('Closed connection (%d)', connections);
    });
});

// start listening for incoming connections
server.listen(PORT, () => {
    console.log('Server listening on port', PORT);
    // properties.state(STATE.RUNNING);
});

// When you receive a SIGINT start the shutdown process
process.on('SIGINT', () => {
    console.log('Received SIGINT. Initiating graceful shutdown');
    // Set your app state to shutting down so other parts of the application can act accordingly
    // properties.state(STATE.SHUTDOWN);

    // Initiate shutdown
    gracefulShutdown();
});

// server.close() will stop listening but won't close existing connections
// if there's a keep-alive it might stay open longer than you want
// solution is to track sockets yourself and then close them if they are idle
const gracefulShutdown = () => {
    console.log('Graceful Shutdown started. Open connections: %d', connections);
    // Remove yourself from service discovery
    // discovery.stop();
    // Stop listening for incoming connections
    server.close();
};

// When the server closes with no open connections, end process
server.on('close', (err) => {
    if (err) {
        console.error('Server not running.\n', err.stack || err);
        return process.exit(1);
    }
    console.log('Server shutdown.');
    process.exit(0);
});



// async get the connections from the server
// seems to not be very performant, not using it right now
const getServerConnections = async () => { // eslint-disable-line no-unused-vars
    return new Promise((resolve, reject) => {
        server.getConnections((err, count) => {
            if (err) reject(err);
            resolve(count);
        });
    });
};