const axios = require('axios').default;
const { Produto } = require('./produto'); 

class Orders {
    async getUserIdByCPF(cpf) {
        const url = `https://ibmec-transacoes-eff6aberc9atagev.canadacentral-01.azurewebsites.net/clientes/cpf/${cpf}`;
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data.id;
            }
            throw new Error('Usuário não encontrado');
        } catch (error) {
            console.error('Erro ao buscar ID do cliente:', error);
            throw new Error('Erro ao buscar cliente. Verifique o CPF.');
        }
    }
    async getCardsByUserId(userId) {
        const url = `https://ibmec-transacoes-eff6aberc9atagev.canadacentral-01.azurewebsites.net/clientes/${userId}`;
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data.cartoes; // Retorna a lista de cartões
            }
            throw new Error('Nenhum cartão encontrado para este cliente.');
        } catch (error) {
            console.error('Erro ao buscar cartões:', error);
            throw new Error('Erro ao buscar cartões do cliente.');
        }
    }
    
    async getOrdersByCardId(cardId) {
        const url = https://ecommerce-app-av2-fbfrc3hhaxakhhh0.canadacentral-01.azurewebsites.net/orders/cartao/${cardId};
        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return response.data; // Retorna os pedidos.
            }
            throw new Error('Nenhum pedido encontrado para este cartão.');
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            throw new Error('Erro ao buscar pedidos. Verifique o cartão.');
        }
    }

    async formatOrders(orders) {
        if (!orders || orders.length === 0) {
            console.log('Nenhum pedido encontrado.');
            return 'Nenhum pedido encontrado.';
        }
    
        const produto = new Produto();
        let result = '### Seus Pedidos:\n\n';
    
        for (let order of orders) {
            try {
                console.log(`Buscando produto para orderId: ${order.orderId}, productId: ${order.productId}`);
                const productData = await produto.getProdutoById(order.productId);
    
                if (!productData || !productData.productName) {
                    console.warn(`Produto não encontrado para productId: ${order.productId}`);
                    result += `**Pedido:** ${order.orderId}\n`;
                    result += `**Status:** ${order.status}\n`;
                    result += `**Data:** ${new Date(order.dataOrder).toLocaleString()}\n`;
                    result += `**Produto:** Informações não disponíveis\n\n`;
                    continue;
                }
    
                result += `**Pedido:** ${order.orderId}\n`;
                result += `**Status:** ${order.status}\n`;
                result += `**Data:** ${new Date(order.dataOrder).toLocaleString()}\n`;
                result += `**Produto:** ${productData.productName}\n`;
                result += `**Descrição:** ${productData.productDescription || 'Descrição não disponível'}\n\n`;
            } catch (error) {
                console.error(`Erro ao buscar produto para orderId: ${order.orderId}`, error.message);
                result += `**Pedido:** ${order.orderId}\n`;
                result += `**Status:** ${order.status}\n`;
                result += `**Data:** ${new Date(order.dataOrder).toLocaleString()}\n`;
                result += `**Produto:** Informações não disponíveis\n\n`;
            }
        }
    
        console.log('Mensagem gerada para o chat:', result); // Log da mensagem final
        return result;
    }

    async checkout(userId, productId, cardId) {
        const url = 'https://ecommerce-app-av2-fbfrc3hhaxakhhh0.canadacentral-01.azurewebsites.net/checkout';
        const payload = {
            idUsuario: userId,
            productId: productId,
            numeroCartao: cardId
        };
    
        try {
            console.log('Valores recebidos no checkout:', { userId, productId, cardId });
            const response = await axios.post(url, payload);
            console.log('Resposta da API:', response.data, response.status);
    
            if (response.status === 201 || response.data.status === 'Produto Comprado') {
                return { 
                    success: true, 
                    message: `Compra realizada com sucesso! Pedido ID: ${response.data.orderId}`, 
                    details: response.data 
                };
            }
    
            return { 
                success: false, 
                message: response.data.mensagem || 'Não foi possível realizar a compra.',
                details: response.data 
            };
        } catch (error) {
            console.error('Erro ao realizar checkout:', error.message);
            const errorDetails = error.response?.data || { mensagem: 'Erro desconhecido no checkout.' };
            return { 
                success: false, 
                message: errorDetails.mensagem, 
                details: errorDetails 
            };
        }
    }
    
    
    
    
}

module.exports.Orders = Orders;
