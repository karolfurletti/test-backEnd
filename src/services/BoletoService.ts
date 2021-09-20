import {HTTP, TYPE_BOLETO} from "@utils/consts";

const moment = require('moment-timezone');

class BoletoService {


    //aceita apenas codigos com 47 e 48 digitos
    //OBS: codigos de barras com 44 digitos não aceitos. o codigo com 47 ou 48 é convertido em um codigo de barras.


    async getBoleto(barCode: string) {


        //valida para aceitar somente numeros
        if (!this.validateCharacter(barCode)) {
            return this.errorCharacter()
        }

        //validate quantidade de digitos
        if (!this.validateLimitBarCode(barCode)) {
            return this.errorLimitBarCode()
        }

        //se tudo der certo com as validações exibe as informações
        return this.getInfoBoleto(barCode)
    }

    validateCharacter(barCode: string) {
        return !isNaN(parseFloat(barCode)) && isFinite(Number(barCode));
    }

    validateLimitBarCode(barCode: string) {
        const count = Math.max(Math.floor(Math.log10(Math.abs(Number(barCode)))), 0) + 1
        return count === 47 || count === 48
    }

    getTypeBoleto(barCode: any) {
        //define o tipo de boleto para uso posterior
        const isString = String(barCode)
        const type = isString.substr(1, 1);
        const digits = '00000000000000';

        if (isString.substr(-14) === digits || isString.substr(5, 14) === digits) {
            return TYPE_BOLETO.CARTAO_CREDITO;
        } else if (isString.substr(0, 1) == '8') {
            switch (type) {
                case '1':
                    return TYPE_BOLETO.PREFEITURA
                case '2':
                    return TYPE_BOLETO.SANEAMENTO
                case '3':
                    return TYPE_BOLETO.ENERGIA_ELETRICA
                case '4':
                    return TYPE_BOLETO.TELECOMUNICACOES
                case '5':
                    return TYPE_BOLETO.ORGAOS_GOVERNAMENTAIS
                case '7':
                    return TYPE_BOLETO.MULTAS_TRANSITO
                case '6':
                case '9':
                    return TYPE_BOLETO.OUTROS
                default:
                    break;
            }
        } else {
            return TYPE_BOLETO.USO_BANCO;
        }
    }


    getInfoBoleto(barCode: string) {
        return {
            barCode: this.getCodeBarras(barCode),
            amount: this.getValue(barCode),
            expirationDate: this.getDate(barCode)
        }
    }


    getDate(barCode) {
        //pega somente a data do boleto se existir
        let dataBoleto = moment.tz("1997-10-07 20:54:59.000Z", "UTC"); // data base da metologia de calculo de vencimento
        const date = this.isTypeThatGenerateData(barCode) ? barCode.substr(33, 4) : 0;
        dataBoleto.add(Number(date), 'days');
        const newDate = dataBoleto.toDate()
        return date > 0 ? moment(newDate).format('YYYY-MM-DD') : null
    }

    getValue(barCode) {
        //pega o valor do boleto se existir
        const value = this.isTypeThatGenerateData(barCode) ?
            this.getValueThatGenerationData(barCode) :
            this.getOthersValue(barCode)
        return parseFloat(value);
    }

    getValueThatGenerationData(barCode) {
        //essa funcao pega o valor quando tipo for banco ou cartao de credito.
        let value = '';
        let finalValue;

        value = barCode.substr(37);
        finalValue = value.substr(0, 8) + '.' + value.substr(8, 2);

        let char = finalValue.substr(1, 1);
        while (char === '0') {
            finalValue = this.substringReplace(finalValue, '', 0, 1);
            char = finalValue.substr(1, 1);
        }
        return finalValue
    }


    getOthersValue(barCode) {

       //quando o boleto cai em outro caso.
        let value = null;
        let finalValue;

        value = barCode.split('');
        value.splice(11, 1);
        value = value.join('');
        value = value.substr(4, 11);
        finalValue = value.substr(0, 9) + '.' + value.substr(9, 2);
        let char = finalValue.substr(1, 1);
        while (char === '0') {
            finalValue = this.substringReplace(finalValue, '', 0, 1);
            char = finalValue.substr(1, 1);
        }
        return finalValue;
    }

    substringReplace(str, repl, init, size) {

        const newInit = init < 0 && init + str.length
        size = size !== undefined ? size : str.length;

        if (size < 0) {
            size = size + str.length - newInit;
        }

        return [
            str.slice(0, init),
            repl.substr(0, size),
            repl.slice(size),
            str.slice(init + size)
        ].join('');
    }


    getCodeBarras(barCode) {
        return this.isTypeThatGenerateData(barCode) ?
            this.codeTypeThatGenerateData(barCode) :
            this.codeOthersTypeGenerateData(barCode)
    }


    isTypeThatGenerateData(barCode: number) {
        const type = this.getTypeBoleto(barCode);
        return type === TYPE_BOLETO.USO_BANCO || type === TYPE_BOLETO.CARTAO_CREDITO;
    }

    codeTypeThatGenerateData(barCode: string) {
        let newCode = '';
        newCode = barCode.substr(0, 4) +
            barCode.substr(32, 1) +
            barCode.substr(33, 14) +
            barCode.substr(4, 5) +
            barCode.substr(10, 10) +
            barCode.substr(21, 10);
        return newCode
    }

    codeOthersTypeGenerateData(barCode) {
        let newCode = '';
        barCode = barCode.split('');
        barCode.splice(11, 1);
        barCode.splice(22, 1);
        barCode.splice(33, 1);
        barCode.splice(44, 1);
        barCode = barCode.join('');
        newCode = barCode;
        return newCode
    }


    errorCharacter() {
        return {
            TAG_DESCRICAO: 'O campo bar code aceita somente numeros!',
            TAG: 'errorCharacter',
            STATUS: HTTP.BAD_REQUEST
        }
    }


    errorLimitBarCode() {
        return {
            TAG_DESCRICAO: 'Código invalido',
            TAG: 'errorLimitBarCode',
            STATUS: HTTP.BAD_REQUEST
        }
    }


}

module.exports = new BoletoService()
export {}
