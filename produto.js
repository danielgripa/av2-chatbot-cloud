const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Produto {

    urlApi = "http://localhost:8081/products" ///process.env.PRODUTO_URL_API;
    apiKey = process.env.GATEWAY_ACCESS_KEY;

    async getProduto(productName) {
        /*const headers = {
            'ocp-apim-subscription-key': this.apiKey
        };*/
        return await axios.get(`${this.urlApi}?productName=${productName}`); //, {headers: headers});
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

    async getProdutoById(productId) {
        try {
            const response = await axios.get(`${this.urlApi}/${productId}`);
            if (response.status === 200) {
                console.log('Resposta da API de Produto:', response.data);
                return response.data; // Retorna os detalhes do produto.
                
            }
            throw new Error('Produto não encontrado.');
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            throw new Error('Erro ao buscar produto. Verifique o ID do produto.');
        }
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