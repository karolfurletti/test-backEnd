import express from 'express'
const app = express()
const cors = require('cors')
const PORT_NUMBER = 3700
const bodyParser = require('body-parser')
require('dotenv-safe').config()

// app configs
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (request, response) => {
  return response.send(`it's running`)
})

// add routes
app.use('/', require('./routes/routes'))

if(!process.env.JEST_WORKER_ID) {
	app.listen(PORT_NUMBER, () => {
	  console.log(`Server Online on Port ${PORT_NUMBER}`)
	});
}

module.exports = app
export {}
