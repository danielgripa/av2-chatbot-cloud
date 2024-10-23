const { ActivityHandler, MessageFactory, ActionTypes } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            const command = `${ context.activity.text }`;
            const textCommand = `Voce deseja fazer isso: ${command}`;
            switch (command) {
                case 'pedidos': {
                    await context.sendActivity(MessageFactory.text(textCommand, textCommand));
                    break;
                }
                case 'produtos': {
                    await context.sendActivity(MessageFactory.text(textCommand, textCommand));
                    break;
                }
                case 'extrato': {
                    await context.sendActivity(MessageFactory.text(textCommand, textCommand));
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


}

module.exports.EchoBot = EchoBot;
