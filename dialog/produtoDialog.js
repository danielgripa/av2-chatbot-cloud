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

        this.productProfile = userState.createProperty(PRODUCT_PROFILE);

        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new TextPrompt(CARTAO_NUMBER_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.menuStep.bind(this),
            this.productNameStep.bind(this),
            this.cartaoNumberStep.bind(this),
            this.confirmStep.bind(this)
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
        step.values.id = step.result;
        return await step.prompt(CARTAO_NUMBER_PROMPT, 'Digite o número do cartão:');
    }

    async confirmStep(step) {
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
                const { Produto } = require('../produto');
                let productName = step.values.id;
                let produto = new Produto();
                let response = await produto.getProduto(productName);
                let card = produto.createProductCard(response.data[0]);
                await step.context.sendActivity({ attachments: [card] });
                break;
            }
        }

        return await step.endDialog();
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
}

module.exports.ProductDialog = ProductDialog;
