import { Socket } from 'socket.io'
import { io } from '../server'

io.on('connection', (socket: Socket) => {
	socket.on('', () => { })
})