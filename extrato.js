const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

const format = require('date-format');

class Extrato {

    urlApi = "https://ibmec-transacoes-eff6aberc9atagev.canadacentral-01.azurewebsites.net/transacoes/cliente/"; //process.env.EXTRATO_URL_API;
    //apiKey = process.env.GATEWAY_ACCESS_KEY;

    async getExtrato(idUser, numeroCartao) {
        const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };
        console.log("Usuário:", idUser, "Cartao:", numeroCartao)

        return await axios.get(`${this.urlApi}/${idUser}?numeroCartao=${numeroCartao}`);
        }

    formatExtrato(response) {
        let table = `| **DATA COMPRA** | **DESCRICAO** | **VALOR** |\n\n
        `;
        response.forEach(element => {
            table += `\n\n| **${format("dd/MM/yyyy", new Date(element.dataTransacao))}** | **${element.comerciante}** | **R$ ${element.valor}** |\n\n`
        });

        return table;
    }
}

module.exports.Extrato = Extrato;