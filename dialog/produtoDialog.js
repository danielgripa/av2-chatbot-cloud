const { MessageFactory } = require('botbuilder');
const {
    AttachmentPrompt,
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');
const { Channels } = require('botbuilder-core');
const { ProdutoProfile } = require('../produtoProfile');
const {Produto} = require("../produto");
const { Extrato } = require('../extrato');
const { Orders } = require('../orders');


const NAME_PROMPT = 'NAME_PROMPT';
const CARTAO_NUMBER_PROMPT = 'CARTAO_NUMBER_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const PRODUCT_PROFILE = 'PRODUCT_PROFILE';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';


class ProductDialog extends ComponentDialog {
    constructor(userState) {
        super('productDialog');

        function validarCPF(cpf) {
            const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // Formato 123.456.789-00
            return regex.test(cpf);
        }

        this.productProfile = userState.createProperty(PRODUCT_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(CARTAO_NUMBER_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt('textPrompt'));


        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.menuStep.bind(this),
            this.productNameStep.bind(this),
            this.captureCPFStep.bind(this),
            this.cartaoNumberStep.bind(this),
            this.confirmStep.bind(this),
            this.captureCPFStep.bind(this),
            this.captureCardStep.bind(this),
            this.confirmProductStep.bind(this),
            this.finalizeCheckoutStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async menuStep(step) {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Escolha a opção desejada',
            choices: ChoiceFactory.toChoices(['Consultar Pedidos', 'Consultar Produtos', 'Extrato de Compras'])
        });
    }

    async productNameStep(step) {
        step.values.choice = step.result.value;

        switch (step.values.choice) {
            case "Consultar Pedidos":
                return await step.prompt(NAME_PROMPT, 'Digite o seu CPF (formato: 123.456.789-00):');
            case "Consultar Produtos":
                return await step.prompt(NAME_PROMPT, 'Digite o nome do produto:');
            case "Extrato de Compras":
                return await step.prompt(NAME_PROMPT, 'Digite o número do seu cartão:');
        }
    }


    async cartaoNumberStep(step) {
        step.values.id = step.result; // Nome ou CPF capturado
        console.log(`CartaoNumberStep: Valor capturado (ID ou nome) - ${step.values.id}`);
        step.values.numeroCartao = step.result; // Salva para uso no checkout
        return await step.prompt(CARTAO_NUMBER_PROMPT, 'Digite o número do cartão:');
    }
    
    

    async confirmStep(step) {
        console.log(`ConfirmStep: Opção escolhida - ${step.values.choice}`);
        console.log(`ConfirmStep: Resultado anterior - ${step.result}`);

        switch (step.values.choice) {
            case "Consultar Pedidos": {
                const { Orders } = require('../orders');
                let cpf = step.values.id; // CPF digitado pelo usuário
                let numeroCartaoDigitado = step.result; // Número do cartão digitado
    
                let orders = new Orders();
                try {
                    // Etapa 1: Buscar ID do cliente pelo CPF.
                    let userId = await orders.getUserIdByCPF(cpf);
    
                    // Etapa 2: Buscar lista de cartões do cliente pelo ID.
                    let cartoes = await orders.getCardsByUserId(userId);
    
                    // Etapa 3: Localizar o ID do cartão correspondente ao número digitado.
                    let cartaoEncontrado = cartoes.find(cartao => cartao.numeroCartao.toString() === numeroCartaoDigitado);
                    if (!cartaoEncontrado) {
                        throw new Error('Cartão não encontrado na lista de cartões do cliente.');
                    }
                    let cardId = cartaoEncontrado.id;
    
                    // Etapa 4: Buscar pedidos pelo ID do cartão encontrado.
                    let response = await orders.getOrdersByCardId(cardId);
    
                    // Formatar e exibir os pedidos.
                    let message = await orders.formatOrders(response);
                    await step.context.sendActivity(message);
                } catch (error) {
                    // Exibe a mensagem de erro no chat
                    console.error('Erro no fluxo de consulta de pedidos:', error.message);
                    await step.context.sendActivity(`Erro ao processar sua solicitação: ${error.message}`);
                }
                break;
            }
    
            case "Extrato de Compras": {
                const { Extrato } = require('../extrato');
                let id = step.values.id;
                let cardNumber = step.result;
                let extrato = new Extrato();
                let response = await extrato.getExtrato(id, cardNumber);
                let result = extrato.formatExtrato(response.data);
                let message = MessageFactory.text(result);
                await step.context.sendActivity(message);
                break;
            }
            case "Consultar Produtos": {
                console.log('ConfirmStep: Fluxo de Consultar Produtos');
                const produto = new Produto();
                
                try {
                    const response = await produto.getProduto(step.values.id);
                    if (!response || response.length === 0) {
                        throw new Error('Produto não encontrado.');
                    }
            
                    const produtoSelecionado = response[0]; // Pega o primeiro produto da lista retornada
                    step.values.productId = produtoSelecionado.productId; // Salva o ID do produto
                    console.log(`ConfirmStep: Produto encontrado com ID - ${step.values.productId}`);
                    const productId = step.values.productId;
            
                    const card = produto.createProductCard(produtoSelecionado);
                    await step.context.sendActivity({ attachments: [card] });
            
                    return await step.prompt('CHOICE_PROMPT', {
                        prompt: 'Deseja comprar este produto?',
                        choices: ChoiceFactory.toChoices(['Sim', 'Não']),
                    });
                } catch (error) {
                    console.error('Erro no fluxo de produtos:', error.message);
                    await step.context.sendActivity(`Erro: ${error.message}`);
                    return await step.endDialog();
                }
            }
                       
            
        }
    
        // Processar a escolha do cliente
        if (step.result.value.toLowerCase() === 'sim') {
            console.log('ConfirmStep: Cliente deseja comprar. Redirecionando para checkout...');
            return await step.next(); // Passa para o próximo passo (checkout)
        } else {
            console.log('ConfirmStep: Cliente não deseja comprar. Finalizando diálogo.');
            await step.context.sendActivity('Compra cancelada.');
            return await step.endDialog();
        }
    }


    /**
     * Método run para gerenciar os diálogos.
     */
    async run(context, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(context);

        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }



    async captureCPFStep(step) {
        console.log('CaptureCPFStep: Solicitando CPF...');
        return await step.prompt('textPrompt', 'Digite o seu CPF (formato: 123.456.789-00):');
    }

    async captureCardStep(step) {
        // Salva o CPF capturado na etapa anterior
        const cpf = step.result.trim();
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
            await step.context.sendActivity('CPF inválido. Certifique-se de que o formato está correto.');
            return await step.replaceDialog(this.id); // Reinicia o diálogo
        }
        step.values.cpf = cpf;
        console.log(`CaptureCardStep: CPF capturado e validado - ${cpf}`);

        // Solicita o número do cartão
        return await step.prompt('textPrompt', 'Digite o número do cartão:');
    }

    async confirmProductStep(step) {
        // Salva o número do cartão capturado
        const numeroCartao = step.result.trim();
        step.values.numeroCartao = numeroCartao;
        console.log(`ConfirmProductStep: Número do cartão capturado - ${numeroCartao}`);

        // Confirma o produto (se aplicável, ou avance direto para o checkout)
        return await step.prompt('CHOICE_PROMPT', {
            prompt: 'Deseja confirmar este produto?',
            choices: ChoiceFactory.toChoices(['Sim', 'Não']),
        });
    }


    async finalizeCheckoutStep(step) {
        const { Orders } = require('../orders');
        const orders = new Orders();
    
        try {
            const { cpf, numeroCartao } = step.values;
            console.log(`FinalizeCheckoutStep: CPF - ${cpf}, Número do Cartão - ${numeroCartao}`);
    
            const userId = await orders.getUserIdByCPF(cpf);
            const cartoes = await orders.getCardsByUserId(userId);
            const cartaoEncontrado = cartoes.find(c => c.numeroCartao.toString() === numeroCartao);
            if (!cartaoEncontrado) throw new Error('Cartão não encontrado.');
    
            if (!step.values.productId) {
                await step.context.sendActivity('Erro ao processar a compra. Produto não encontrado.');
                return await step.endDialog();
            }
    
            const checkoutResponse = await orders.checkout(userId, step.values.productId, cartaoEncontrado.id);
            if (checkoutResponse.success) {
                await step.context.sendActivity(checkoutResponse.message);
            } else {
                const validationErrors = checkoutResponse.details.validationErrors;
                let detailedErrorMessage = checkoutResponse.message;
            
                if (validationErrors && validationErrors.length > 0) {
                    // Extrai a mensagem detalhada e limpa os dados desnecessários
                    const detailedError = validationErrors[0].message || 'Erro desconhecido.';
                    // Extração limpa da mensagem específica
                    const cleanError = detailedError.match(/"message":"(.*?)"/)?.[1] || detailedError;
                    detailedErrorMessage = cleanError;
                }
            
                await step.context.sendActivity(`Compra não realizada. Motivo: ${detailedErrorMessage}`);
                console.error('Detalhes do erro:', checkoutResponse.details);
            }
            
            
        } catch (error) {
            await step.context.sendActivity(`Erro ao processar o checkout: ${error.message}`);
            console.error('Erro no checkout:', error.message);
        }
    
        return await step.endDialog();
    }
    
    

}

module.exports.ProductDialog = ProductDialog;