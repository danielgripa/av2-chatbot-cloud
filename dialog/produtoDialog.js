const { ComponentDialog, ChoicePrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { ChoiceFactory, MessageFactory } = require('botbuilder-dialogs'); // Certo

const { Produto } = require('../produto'); // Classe para lidar com produtos

const NAME_PROMPT = 'NAME_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class ProductDialog extends ComponentDialog {
    constructor(userState) {
        super('productDialog');

        // Adiciona os prompts necessários
        this.addDialog(new TextPrompt(NAME_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt('textPrompt'));

        // Configura o fluxo do diálogo
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.promptProductNameStep.bind(this),
            this.displayProductDetailsStep.bind(this),
            this.confirmPurchaseStep.bind(this),
            this.captureCPFStep.bind(this),
            this.captureCardStep.bind(this),
            this.confirmProductStep.bind(this),
            this.confirmPurchaseStep.bind(this),
            this.finalizeCheckoutStep.bind(this),
            this.finalizeCheckoutStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async promptProductNameStep(step) {
        return await step.prompt(NAME_PROMPT, 'Digite o nome do produto que você deseja consultar:');
    }

    async displayProductDetailsStep(step) {
        const produto = new Produto();
        const productName = step.result.trim(); // Nome do produto fornecido pelo usuário
        step.values.productName = productName;

        try {
            const response = await produto.getProduto(productName);

            if (!response || response.length === 0) {
                await step.context.sendActivity('Produto não encontrado. Por favor, tente novamente.');
                return await step.replaceDialog(this.id); // Reinicia o diálogo
            }

            const produtoSelecionado = response[0];
            step.values.productId = produtoSelecionado.productId;

            const card = produto.createProductCard(produtoSelecionado);
            await step.context.sendActivity({ attachments: [card] });

            return await step.prompt(CHOICE_PROMPT, {
                prompt: 'Deseja comprar este produto?',
                choices: ChoiceFactory.toChoices(['Sim', 'Não']),
            });
        } catch (error) {
            console.error('Erro ao buscar produto:', error.message);
            await step.context.sendActivity(`Erro ao processar sua solicitação: ${error.message}`);
            return await step.endDialog();
        }
    }

    async confirmPurchaseStep(step) {
        const choice = step.result.value.toLowerCase();

        if (choice === 'sim') {
            return await step.next(); // Avança para o checkout
        } else {
            await step.context.sendActivity('Compra cancelada.');
            return await step.endDialog();
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

    async confirmPurchaseStep(step) {
        const choice = step.result.value.toLowerCase();
    
        if (choice === 'sim') {
            return await step.next(); // Avança para o checkout
        } else {
            await step.context.sendActivity('Compra cancelada. Voltando ao menu principal.');
            return await step.endDialog(); // Encerra o diálogo atual
        }
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
