const { ComponentDialog, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { Extrato } = require('../extrato');
const { Orders } = require('../orders');

const CPF_PROMPT = 'CPF_PROMPT';
const CARD_NUMBER_PROMPT = 'CARD_NUMBER_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ExtratoDialog extends ComponentDialog {
    constructor(userState) {
        super('extratoDialog');

        // Adiciona os prompts necessários
        this.addDialog(new TextPrompt(CPF_PROMPT, this.validateCPF));
        this.addDialog(new TextPrompt(CARD_NUMBER_PROMPT));

        // Configura o fluxo do diálogo
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptCPFStep.bind(this),
            this.promptCardNumberStep.bind(this),
            this.displayExtratoStep.bind(this)
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
        return await step.prompt(CARD_NUMBER_PROMPT, 'Digite o número do cartão associado ao extrato:');
    }

    /**
     * Passo 3: Busca e exibe o extrato.
     */
    async displayExtratoStep(step) {
        const extrato = new Extrato();
        const cpf = step.values.cpf;
        const cardNumber = step.result;
        const orders = new Orders();

        try {

            // Busca o id a partir do CPF
            const userId = await orders.getUserIdByCPF(cpf);
            // Confere se o cartão pertence aquela pessoa

            // Busca o extrato utilizando os dados fornecidos
            const response = await extrato.getExtrato(userId, cardNumber);
   
            if (response && response.data && response.data.length > 0) {
                // Formatar e exibir o extrato
                const formattedExtrato = extrato.formatExtrato(response.data);
                await step.context.sendActivity(formattedExtrato);
            } else {
                await step.context.sendActivity('Nenhum extrato encontrado para este CPF e cartão.');
            }
        } catch (error) {
            console.error('Erro ao buscar extrato:', error.message);
            await step.context.sendActivity(`Erro ao processar sua solicitação: ${error.message}`);
        }

        return await step.endDialog();
    }
}

module.exports.ExtratoDialog = ExtratoDialog;
