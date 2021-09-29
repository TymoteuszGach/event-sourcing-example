import app from './app';
import http from 'http';

const server = http.createServer(app);

const port = 3000;

server.listen(port);

server.on('listening', () => {
  console.info(`server listening on port ${port}`);
});