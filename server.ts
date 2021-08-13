import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const http = createServer(app)
const io = new Server(http)

app.use(express.json())

export { io, http }