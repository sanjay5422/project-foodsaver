import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
    autoConnect: false, // We'll connect manually after login
});

export default socket;
