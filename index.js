const path = require('path');
const dotenv = require('dotenv');
const restify = require('restify');
const {
    CloudAdapter,
    ConversationState,
    MemoryStorage,
    UserState,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

// Carregar variáveis de ambiente
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

// Importar diálogos e bot principal
const { DialogBot } = require('./bot');
const { MainDialog } = require('./dialog/mainDialog');

// Configuração do servidor HTTP
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} ouvindo em ${server.url}`);
    console.log('\nAbra o Bot Framework Emulator e conecte ao endpoint "/api/messages".');
});

// Configuração de credenciais
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Criar adaptador
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Configurar manipulador de erros
const onTurnErrorHandler = async (context, error) => {
    console.error(`\n[onTurnError] Erro não tratado: ${error}`);
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );
    await context.sendActivity('O bot encontrou um erro ou bug.');
    await context.sendActivity('Por favor, corrija o código-fonte do bot para continuar.');
};
adapter.onTurnError = onTurnErrorHandler;

// Configuração de armazenamento de estado
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Configurar MainDialog como entrada principal
const mainDialog = new MainDialog(userState);
const bot = new DialogBot(conversationState, userState, mainDialog);

// Endpoint para mensagens
server.post('/api/messages', async (req, res) => {
    await adapter.process(req, res, (context) => bot.run(context));
});

// Suporte para WebSocket
server.on('upgrade', async (req, socket, head) => {
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket, head, (context) => bot.run(context));
});
