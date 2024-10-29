const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Produto {

    urlApi = 'https://projeto-cloud-ecommerce-rc.azure-api.net/products';

    getProduto(context, productName) {
        const headers = {
            'ocp-apim-subscription-key': '8ef0a7b573104f31bbdc17d838c76a2a'
        };

        productName = "Smart TV Crystal Samsung 50"
        return axios.get(`${this.urlApi}?productName=${productName}`, {headers: headers});
    }
    createProductCard(response) {
        return CardFactory.thumbnailCard(
            response.productName,
            [{ url: response.urlFoto }],
            [{
                type: 'openUrl',
                title: 'Quero Comprar',
                value: 'https://www.magazineluiza.com.br/smart-tv-tcl-50-polegadas-50p755-4k-uhd-led-hdr10-google-tv/p/fa3f7f91ee/et/tv4k/'
            }],
            {
                subtitle: `Preço do produto: ${response.price}`,
                text: response.productDescription
            }
        );
    }
}

module.exports.Produto = Produto;