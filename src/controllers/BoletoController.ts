const BoletoService = require('@services/BoletoService')

class BoletoController {
  async getBoleto (req, res) {
    try {
      const barCode = req.params.barCode;
      const response = await BoletoService.getBoleto(barCode)
      res.status( response.STATUS || 200 ).send({...response})
    } catch (err) {
      res.status(501).send(err)
    }
  }

}
module.exports = new BoletoController()
export {}
