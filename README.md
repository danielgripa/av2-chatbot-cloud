# Projeto AV2 - Chatbot Cloud

## **Descrição**
Projeto AV2 de Big Data e Cloud Computing, do professor Rafael Cruz da Instituição IBMEC, graduação em Ciências de Dados e Inteligência Artificial.

Alunos: André Silveira e Daniel Gripa Cavalcanti

O chatbot foi a terceira etapa do projeto, que incluiu:
1. Criação de um **web app/backend API** para um sistema de cartão de crédito (transação, cliente, cartão) usando **SQL Server**.
2. Desenvolvimento de um **web app/backend API** para um sistema de e-commerce (produtos e pedidos) usando **CosmosDB**, um banco de dados não relacional.
3. Este **chatbot**, que correlaciona a operação dos dois sistemas.

URLs dos projetos anteriores:
- Sistema de Cartão de Crédito: [Ecommerce ](https://github.com/danielgripa/av2-ecommerce)
- Sistema de E-commerce: [Sistema de Transação ](https://github.com/andresilveira18/Projeto-Cloud-Springboot)
---

## **Tecnologias Utilizadas**

Este chatbot foi desenvolvido utilizando as seguintes tecnologias:

1. **Linguagem de Programação**:
   - **JavaScript**: Toda a lógica do bot foi implementada em JavaScript, utilizando práticas modernas de programação.

2. **Frameworks e Bibliotecas**:
   - **Bot Framework SDK**: Framework oficial da Microsoft para criação de bots inteligentes e interativos.
   - **Restify**: Usado para configurar o servidor web do bot.
   - **botbuilder-dialogs**: Biblioteca para gerenciar diálogos e interações com os usuários.
   - **dotenv**: Para gerenciar variáveis de ambiente de forma segura.

3. **Serviços de Banco de Dados**:
   - **CosmosDB**: Banco de dados não relacional usado para armazenar informações do sistema de e-commerce.
   - **SQL Server**: Banco de dados relacional usado para o sistema de cartão de crédito.

4. **Plataformas de Hospedagem**:
   - Pode ser implantado em serviços como **Azure App Service**, **Heroku** ou servidores locais.

5. **Ambiente de Teste**:
   - **Bot Framework Emulator**: Ferramenta para testar interações e fluxos do chatbot localmente.

6. **Outras Ferramentas**:
   - **Postman**: Para testar APIs e validar a integração com os sistemas de backend.
   - **Visual Studio Code**: IDE usada para o desenvolvimento do código.

---

## **Diálogos e Interações do Chatbot**

1. **Consultar Produtos**
   - Permite pesquisar produtos pelo nome.
   - Exibe os detalhes e uma imagem do produto.
   - Possibilidade de comprar diretamente pelo chatbot.

2. **Consultar Pedidos**
   - Permite consultar pedidos associados a um CPF e número de cartão.

3. **Extrato de Compras**
   - Gera um extrato detalhado das compras realizadas por um cartão de crédito.

---

## **Como Configurar e Usar**

1. **Clone o Repositório**
   ```bash
   git clone https://github.com/danielgripa/av2-chatbot-cloud.git
   cd av2-chatbot-cloud
   ```

2. **Instale as Dependências**
   ```bash
   npm install
   ```

3. **Configuração do Ambiente**
   - Renomeie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
     - Credenciais do Azure Bot Framework.
     - Conexões com os bancos de dados (SQL Server e CosmosDB).

4. **Inicie o Servidor**
   ```bash
   npm start
   ```

5. **Testando o Chatbot**
   - Abra o **Bot Framework Emulator**.
   - Configure a URL do endpoint: `http://localhost:3978/api/messages`.
   - Interaja com o bot pelos diálogos disponíveis.

6. **Implantação**
   - O bot pode ser implantado em qualquer serviço de hospedagem que suporte Node.js, como **Azure App Service**, **Heroku**, ou servidores locais.
   - Certifique-se de configurar adequadamente as variáveis de ambiente no ambiente de produção.
  
7. **Relatório no Google Colab**
   - Incluimos gráficos para análisar as seguintes métricas do ecommerce: Produtos mais vendidos, Ticket Médio dos Produtos, Receita por Produto, Top Clientes por Volume de Compra
   - https://colab.research.google.com/drive/1L05oFbrU6HT9Bf2usXIqemEyN-Ffqjbu?usp=sharing

---

## **Agradecimentos**
Agradecemos ao professor Rafael Cruz e à Instituição IBMEC pela oportunidade de desenvolver este projeto como parte do curso de Ciências de Dados e Inteligência Artificial.
