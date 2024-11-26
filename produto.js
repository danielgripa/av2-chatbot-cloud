const axios = require('axios').default;
const { CardFactory } = require('botbuilder');

class Produto {
    constructor() {
        this.urlApi = "http://localhost:8081/products"; // Substitua pelo valor correto, se necessário.
        this.apiKey = process.env.GATEWAY_ACCESS_KEY;
    }

    async getProduto(productName) {
        try {
            // Chamada à API com validação de headers (se necessário no futuro)
            const response = await axios.get(`${this.urlApi}?productName=${productName}`);
            
            // Verifica se a resposta contém dados válidos
            if (response.status === 200 && response.data && response.data.length > 0) {
                console.log('Produtos retornados:', response.data);
                return response.data; // Retorna a lista de produtos
            }
            throw new Error('Nenhum produto encontrado com o nome fornecido.');
        } catch (error) {
            console.error('Erro ao buscar produto:', error.message);
            throw new Error('Erro ao buscar produto. Verifique o nome fornecido.');
        }
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
