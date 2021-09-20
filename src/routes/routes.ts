const routes = require('express').Router()

const BoletoController = require('@controllers/BoletoController')
routes.get('/boleto/:barCode', BoletoController.getBoleto)

module.exports = routes
export {}
