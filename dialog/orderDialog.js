const { ComponentDialog, TextPrompt, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { Orders } = require('../orders'); // Classe para lidar com pedidos

const CPF_PROMPT = 'CPF_PROMPT';
const CARD_NUMBER_PROMPT = 'CARD_NUMBER_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class OrderDialog extends ComponentDialog {
    constructor(userState) {
        super('orderDialog');

        // Adiciona os prompts necessários
        this.addDialog(new TextPrompt(CPF_PROMPT, this.validateCPF));
        this.addDialog(new TextPrompt(CARD_NUMBER_PROMPT));

        // Configura o fluxo do diálogo
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptCPFStep.bind(this),
            this.promptCardNumberStep.bind(this),
            this.displayOrdersStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Valida o CPF informado pelo usuário.
     */
    async validateCPF(promptContext) {
        const cpf = promptContext.recognized.value.trim();
        const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // Formato: 123.456.789-00
        if (regex.test(cpf)) {
            return true;
        } else {
            await promptContext.context.sendActivity('CPF inválido. Certifique-se de que o formato está correto (123.456.789-00).');
            return false;
        }
    }

    /**
     * Passo 1: Solicita o CPF do usuário.
     */
    async promptCPFStep(step) {
        return await step.prompt(CPF_PROMPT, 'Digite o seu CPF (formato: 123.456.789-00):');
    }

    /**
     * Passo 2: Solicita o número do cartão.
     */
    async promptCardNumberStep(step) {
        step.values.cpf = step.result; // Salva o CPF para uso posterior
        return await step.prompt(CARD_NUMBER_PROMPT, 'Digite o número do cartão associado ao pedido:');
    }

    /**
     * Passo 3: Busca e exibe os pedidos associados.
     */
    async displayOrdersStep(step) {
        const orders = new Orders();
        const cpf = step.values.cpf;
        const cardNumber = step.result;

        try {
            // Etapa 1: Buscar ID do cliente pelo CPF.
            const userId = await orders.getUserIdByCPF(cpf);

            // Etapa 2: Buscar cartões associados ao cliente.
            const cartoes = await orders.getCardsByUserId(userId);

            // Etapa 3: Localizar o cartão correspondente.
            const cartaoEncontrado = cartoes.find(cartao => cartao.numeroCartao.toString() === cardNumber);
            if (!cartaoEncontrado) {
                throw new Error('Cartão não encontrado na lista de cartões do cliente.');
            }

            const cardId = cartaoEncontrado.id;

            // Etapa 4: Buscar pedidos associados ao cartão.
            const response = await orders.getOrdersByCardId(cardId);

            if (response && response.length > 0) {
                // Formatar e exibir os pedidos
                const message = await orders.formatOrders(response);
                await step.context.sendActivity(message);
            } else {
                await step.context.sendActivity('Nenhum pedido encontrado para este cartão.');
            }
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error.message);
            await step.context.sendActivity(`Erro ao processar sua solicitação: ${error.message}`);
        }

        return await step.endDialog();
    }
}

module.exports.OrderDialog = OrderDialog;
