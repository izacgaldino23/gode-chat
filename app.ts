import { http } from './server'

http.listen(process.env.PORT, () => {
	console.log(`Servidor rodando na porta ${process.env.PORT}`)
})