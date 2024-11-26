const { ComponentDialog, ChoicePrompt, WaterfallDialog, DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const { ChoiceFactory } = require('botbuilder');
const { ProductDialog } = require('./produtoDialog'); // Diálogo de produto
const { OrderDialog } = require('./orderDialog'); // Diálogo de pedidos
const { ExtratoDialog } = require('./extratoDialog'); // Diálogo de extratos

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const NAME_PROMPT = 'NAME_PROMPT';
const CARTAO_NUMBER_PROMPT = 'CARTAO_NUMBER_PROMPT';
const PRODUCT_PROFILE = 'PRODUCT_PROFILE';


class MainDialog extends ComponentDialog {
    constructor(userState) {
        super('mainDialog');

        // Adicionando prompts e diálogos filhos
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ProductDialog(userState)); // Registro do ProductDialog
        this.addDialog(new OrderDialog(userState)); // Registro do OrderDialog
        this.addDialog(new ExtratoDialog(userState)); // Registro do ExtratoDialog

        // Adicionando o fluxo principal
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.showMenuStep.bind(this),
            this.routeToDialogStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * Etapa 1: Mostrar o menu principal ao usuário.
     */
    async showMenuStep(step) {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Bem-vindo! O que você gostaria de fazer?',
            choices: ['Consultar Produtos', 'Consultar Pedidos', 'Extrato de Compras']
        });
    }

    /**
     * Etapa 2: Roteia o usuário para o diálogo apropriado.
     */
    async routeToDialogStep(step) {
        const choice = step.result.value; // Escolha do usuário
        switch (choice) {
            case 'Consultar Produtos':
                return await step.beginDialog('productDialog');
            case 'Consultar Pedidos':
                return await step.beginDialog('orderDialog');
            case 'Extrato de Compras':
                return await step.beginDialog('extratoDialog');
            default:
                await step.context.sendActivity('Opção inválida. Tente novamente.');
                return await step.replaceDialog(this.id); // Reinicia o diálogo principal
        }
    }

    /**
     * Método para gerenciar o ciclo de vida do diálogo.
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

module.exports.MainDialog = MainDialog;
