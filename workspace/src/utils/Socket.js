import socketIOClient from "socket.io-client"
import env from '../Environment'

class Socket {
	static instace

	conn = null

	constructor() {
		this.conn = socketIOClient(env.ENDPOINT)
	}

	getInstance () {
		if (!this.instace) {
			Socket.instace = new Socket()
		}

		return Socket.instace
	}
}

export default new Socket().getInstance()