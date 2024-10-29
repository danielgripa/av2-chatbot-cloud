const { ActivityHandler, MessageFactory, ActionTypes } = require('botbuilder');
const { Produto } = require("./produto");

class MainBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const command = `${context.activity.text}`;
            const textCommand = `Voce deseja fazer isso: ${command}`;
            switch (command) {
                case 'pedidos': {
                    await context.sendActivity(MessageFactory.text(textCommand, textCommand));
                    break;
                }
                case 'produtos': {

                    let produto = new Produto();
                    produto.getProduto(context, "lorem ipsum").then(async (response) => {
                        let card = produto.createProductCard(response.data[0]);
                        await context.sendActivity({ attachments: [card] });
                    }).catch(error => {
                        console.log(error);
                    });
                    
                    break;
                }
                case 'extrato': {
                    await this.sendHtmlTable(context);
                    break;
                }
            }
            await this.sendCard(context);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            await this.sendWelcome(context);
            await next();
        });

    }

    async sendWelcome(context) {
        const membersAdded = context.activity.membersAdded;
        const welcomeText = 'Bem vindo ao bot, selecione no card a ação';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                await this.sendCard(context);

            }
        }
    }

    async sendCard(context) {
        const cardActions = [
            {
                type: ActionTypes.PostBack,
                title: 'Consultar Pedidos',
                value: 'pedidos',
            },
            {
                type: ActionTypes.PostBack,
                title: 'Consultar Produtos',
                value: 'produtos',
            },
            {
                type: ActionTypes.PostBack,
                title: 'Extrato de Compras',
                value: 'extrato',
            },
        ];

        var reply = MessageFactory.suggestedActions(cardActions, 'Como posso te ajudar?');
        await context.sendActivity(reply);
    }

    // Função para enviar a tabela como HTML
    async sendHtmlTable(context) {
        const markdownTable = `
| Nome   | Idade | País           |
|--------|-------|----------------|
| Maria  | 30    | Brasil         |
| John   | 25    | Estados Unidos |
`;
        const message = MessageFactory.text(markdownTable);
        await context.sendActivity(message);
    }


}

module.exports.MainBot = MainBot;
