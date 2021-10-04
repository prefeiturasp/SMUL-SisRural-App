# APP SisRural

App.js - Inicialização da aplicação

-   CerebralJS (<Container/>)
-   Paper (<PaperProvider/>)
-   Router
-   Modal Container
-   Drawer Menu

## Container CerebralJS (https://cerebraljs.com/)

-   State Manager para a aplicação
-   Container tem o registro de todos os providers e módulos da aplicação (Controller.js)
-   Providers são os "side effects" da aplicação como:
    -   Conexão com a API (HttpProvider)
    -   Manipulação do formulário (FormsProvider)
    -   Conexão com o banco de dados (DBProvider)
-   Módulos são as lógicas, ajudando a organizar as páginas
-   AppModule.js, contém a inicialização da aplicação
-   LoginModule.js, contém o fluxo de autenticação
-   DBModule.js, contém o fluxo do sync offline

## Paper (https://callstack.github.io/react-native-paper/)

-   Coleção de componentes com Theme
-   PaperProvider inicializa o "Theme" da aplicação
-   Componentes utilizados do Paper:
    -   Dropdown
    -   TextInput
    -   Button
    -   Dialog

## Router (https://reactrouter.com/native/guides/quick-start)

-   Coleção de componentes de navegação
-   Controla toda a navegação entre páginas
-   Routes.js contém todas as rotas validas da aplicação
-   <Router component="XXXX">, onde XXXX é a página (componente) que vai abrir ao dar match na rota
-   Para controlar a rota, é possível utilizar o ActionRoute.js

## Drawer Menu

-   Controlador do Menu lateral, p/ fazer a animação
-   Ele instancia um componente chamado <Menu/>
-   O estado de aberto/fechado é controlado pelo State Manager (Cerebral) -> AppModule.js
    -   Atributo menuOpen
    -   openMenu()
    -   closeMenu()

//Aqui explicar como funciona o state manager exemplificando

## ModalContainer

-   Renderizador dos modais de alerta
-   Controlado via State Manager (CerebralJS)
-   Empilha os modais que devem aparecer
-   Retira da pilha os modais que devem desaparecer

## Componentes Básicos do React Native (https://reactnative.dev/docs/components-and-apis)

-   StyleSheet, declaração do "CSS" do React Native
-   View
-   Image
-   Text (Usamos outro Text no App)
-   ScrollView
-   FlatList

## Componentes do App

-   Pasta /componentes contém os componentes do App. Podem ser utilizados em diferentes partes do sistema
-   Componentes como TextInput, Botão, Spacer, Html, Menu/Header, Ícone, Loading, Dropdown (Vários tipos), Accordion, Checkbox, Card (Vários tipos) ...
-   Componentes mais úteis:
    -   Spacer
    -   QueryDb
    -   ComponentConnect (Conecta o TextInput com o State Manager (CerebralJS))

## Página

-   Conjunto de componentes forma uma página
-   Página pode ter diversas ações
-   render() é o método que retorna os componentes visíveis da página
-   connect() é o método que conecta a página com o State Manager (Cerebral), conectando funções ou variáveis.
    -   Método para logar (LoginModule.js login.login()),
    -   Formulário (LoginModule.js login.formLogin)
    -   Usuário que esta autenticado (AuthModule.js)
-   componentDidMount() pode ter chamadas de inicialização da página

## Página de Busca

-   BuscaProdutorPage.js
-   TextInput onde receberá o termo de busca
-   Contém um SQL, que será executado ao clicar em "Buscar"
-   Ao buscar
    -   Temos um debounce no texto
    -   Ao finalizar debounce o termo é alterado no estado
    -   O <QueryDb/> enxerga o estado e reagindo a alteração, faz a chamada do SQL (Reação)
-   FlatList para performance

## Página de Cadastro/Edição

-   CadastroRapidoProdutorPage.js

-   connect() p/ conectar o formulário/métodos ao Módulo do Cadastro Rápido
-   TextInput envolvido pelo ComponentConnect, p/ conectar o TextInput ao Formulário presente no Módulo
-   Ao clicar em salvar "CadastroRapidoProdutorModule.js"

    -   Extrai os dados do formulário
    -   Insere no banco de dados local (Sql Lite)
    -   Chama função de Sync (Caso usuário esteja online)
    -   Redireciona usuário para o dashboard do produtor

-   Ao sair da tela, precisa ser "resetado" o estado do formulário (componentWillUnmount)

# Fluxo de Autenticação

-   InitPage.js, chama o signal app.initApp()
-   AppModule.js, contém as chamadas inicias p/ inicializar a aplicação
    -   Inicializa o Offline (sync)
    -   Fluxo de Autenticação inicial (método flowInitAuthUser())
-   Pega o token de autenticação
-   Se tiver
    -   seta no estado o usuário
    -   roda as migrações (flowRunMigrations.js) - aqui pega as tabelas
    -   roda o sync (syncFlow.js) - aqui faz o download dos dados para a base local
    -   direciona para a tela inicial logada
    -   seta no estado um ok, que o app foi inicializado
-   Se não tiver, direciona para a tela de login

# Fluxo dos Dados/Sync (Offline)

-   Separado por sessões (produtor, unidade produtiva, caderno, formulário, pda ...)
-   Verifica se o device esta online/offline (offlineCheckFlow)
-   Se online
    -   Chama DataSync.js e FileSync.js
    -   Eles varrem as tabelas que podem ser adicionado dados e envia para o servidor
    -   Existe uma coluna chamada "app_sync" nessas tabelas, caso esteja setado com 1, esse registro será enviado para o servidor (Laravel)
    -   A rota da "api" que recebe os dados é "/offline/update" (OfflineController.php)
        -   Ela recebe os dados e para cada "tabela", faz as suas inserções e atualizações
        -   Existe um método genéricio "simpleUpdateOrCreate", que faz o controle p/ salvar/atualizar
        -   O controle da validade do registro é feito pelo "updated_at"
        -   Se o "updated_at" enviado pelo mobile estiver com uma data atraz do registro do banco, o registro do APP é descartado
        -   Se o "updated_at" enviado pelo mobile estiver com uma data futura, o registro do banco é atualizado pelo do APP
    -   A API retorna os registros atualizados e os erros de atualização
    -   Ao retornar os dados para o DataSync, é feito as atualizações devidas, app_sync passa para "0"
    -   Após o processo de envio, é feito o download dos dados
    -   ProdutorDownload.js, retorna os produtores p/ serem inseridos/atualizados no APP
-   Se offline, não faz nada

//Abrir POSTMAN p/ exemplificar o processo de atualização de dados

# APIS Consumidas (Ver api.php) //Gerar POSTMAN

Exemplos:

-   /api/auth/login
-   /api/auth/document_roles
-   /api/offline/migrationsV2
-   /api/offline/produtores

# Build da Aplicação (Fastlane)

-   Arquivo com a definição dos "lanes" /fastlane/Fastfile
-   Neste arquivo apresenta a automação para gerar o build de homologação e de produção
    -   Package da aplicação (bundleId)
    -   Ícones da aplicação
    -   Apontamento p/ o servidor (.env.production.hml ou .env.production.prod)
    -   manipulação do AndroidManifest.xml
-   Existem dois lanes principais, hml e production
-   Ao finalizar, é gerado um arquivo .APK na pasta "/android/app/build/outputs/apk/"
-   Este arquivo deve ser enviado p/ as pessoas (Caso homologação) ou publicado na Google Store (Caso produção)
