import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

const app = express()
const http = createServer(app)
const io = new Server(http)

app.use(express.static(path.resolve('client')));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'client/'))
})

app.use(express.json())

export { io, http }