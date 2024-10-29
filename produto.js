const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Produto {

    urlApi = 'http://localhost:8080/products';

    async getProduto(context, productName) {
        const headers = {
            'ocp-apim-subscription-key': '8ef0a7b573104f31bbdc17d838c76a2a'
        };

        productName = "Smart TV Crystal Samsung 50"
        return await axios.get(`${this.urlApi}?productName=${productName}`, {headers: headers});
    }
    createProductCard(response) {
        return CardFactory.thumbnailCard(
            response.productName,
            [{ url: response.urlFoto }],
            [],
            {
                subtitle: `Preço do produto: ${response.price}`,
                text: response.productDescription
            }
        );
    }
}

module.exports.Produto = Produto;