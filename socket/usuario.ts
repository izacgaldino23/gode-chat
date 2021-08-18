import { Socket } from 'socket.io'
import { io } from '../server'

let users: { [key: string]: any } = {}
let rooms: Array<string> = []

io.on('connect', (socket: Socket) => {

	socket.on('in', ({ name }) => {
		users[name] = socket.id
	})

	socket.on('list_rooms', (params, callback) => {
		callback(rooms)
	})

	socket.on('join', (params, callback) => {
		const { name, room } = params
		var msg = `Entrou na sala ${room}`

		if (room in io.sockets.adapter.rooms) {
			msg = `Entrou na sala ${room}`
		}

		socket.to(room).emit('join_msg', { msg: `${name} entrou na sala` })

		socket.join(room)

		if (rooms.indexOf(room) === -1) {
			rooms.push(room)
		}

		callback({ msg, k: io.sockets.adapter.rooms.get(room)?.values().next().value })
	})

	socket.on('leave', (params) => {
		const { user, room } = params

		socket.to(room).emit('leave_msg', { msg: `${user} saiu da sala` })

		socket.leave(room)
	})

	socket.on('to_room', (params, callback) => {
		const { user, msg, room } = params

		if (msg.length > 256) {
			callback({ erro_msg: 'Mensagem não pode ter mais de 256 caracteres' })
			return
		}

		if (!verifyUserLogin(user)) {
			callback({ erro_msg: 'Você não está em nenhuma sala!' })
			return
		}

		socket.to(room).emit('room_msg', { msg, user })
		callback({})
	})

	socket.on('image_to_room', (params, callback) => {
		const { user, link, room } = params

		if (!verifyUserLogin(user)) {
			callback({ erro_msg: 'Você não está em nenhuma sala!' })
			return
		}

		socket.to(room).emit('room_image', { link, user })
		callback({})
	})

	socket.on('to_user', (params) => {
		const { user, to, msg } = params

		if (!verifyUserLogin(user)) {
			return { msg: 'Você não está em nenhuma sala!' }
		}

		if (!verifyUserLogin(to)) {
			return { msg: "Usuário não encontrado" }
		}

		socket.to(users[to]).emit('private_msg', { msg })
	})

	socket.on('change_name', ({ old_name, name, room }, callback) => {
		if (old_name) {
			delete users[old_name]
		}
		users[name] = socket.id

		if (room && room != '') {
			socket.to(room).emit('change_name', { msg: `${old_name} agora é ${name}` })
		}

		callback()
	})

	socket.on('disconnecting', () => {
		let socket_id = socket.id
		let user: string = ''

		for (let i in users) {
			if (users[i] == socket_id) {
				user = i
				break
			}
		}

		if (user != '') {
			delete users[user]

			let tempRooms = Array.from(socket.rooms)

			tempRooms.forEach(r => {
				socket.to(r).emit('leave_msg', { msg: `${user} saiu` })
			})
		}
	})
})

function verifyUserLogin(user_name: string) {
	if (!(user_name in users)) {
		return false
	}

	return true
}