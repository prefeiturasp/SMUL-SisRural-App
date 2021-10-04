# Instalação

1. Instalar 'node' (https://nodejs.org/en/download/). Versão 12.14.0

2. Instalar o 'Android Studio' (https://developer.android.com/studio?hl=pt)

3. Executar o comando p/ instalar as dependencias

```
npm install
```

4. Após instalado, rodar o comando p/ abrir a aplicação

```
npm run android
```

Este comando irá rodar a versão de desenvolvimento, apontando para o server configurado no arquivo `.env.development`

5. Após rodar o projeto, deve ser iniciado o servidor PHP (Laravel).

Executar o comando na pasta que contém os arquivos do Laravel.

```
php artisan serve
```

## Dados da aplicação

-   react-native-sqlite-storage

-   sync dos dados

## Dados de acesso

Os dados de acesso são os dados da tabela 'users', ver o arquivo `UsuariosSeeder.php`, nele tem o apontamento de um XLSX que foi importado com a lista de usuários/senhas.

Caso seja apontado para homologação ou produção, conversar com quem tem acesso aos dados.

## Erro: 'No apps connected. Sendind "devMenu" to all React Native apps failed.'

Este erro geralmente acontece quando o emulador não esta conseguindo conectar com o bundle do React Native (`npm start`).

P/ resolver isso

1. Reiniciar o computador
2. Abrir o Android Studio
3. Iniciar o emulador através do Android Studio
4. Acessar a pasta /android e executar o comando

```
./gradlew clean
```

5. Após executar o clean, rodar o comando (na raiz do projeto)

```
npm run android
```

6. Aguardar a instalação do app no emulador. Após instalação, abrir o app e ver se esta tudo em ordem.

## Erro: 'failed to install the following android sdk packages as some licences have not been accepted'

É necessário aceitar as licensas das bibliotecas do SDK Android.

Ver:

http://www.allenconway.net/2017/11/accepting-android-sdk-license-via.html

https://stackoverflow.com/questions/39760172/you-have-not-accepted-the-license-agreements-of-the-following-sdk-components

## Erro: 'Error: Activity class {com.ligueospontos/com.ligueospontos.MainActivity} does not exist.'

Ignorar esse erro, o que acontece é que o ActivityClass esta apontado para outro package. (Package de produção)

Basta ir manualmente no emulador e abrir o APP instalado.

## SyntaxError: JSON Parse error: Expected '}'

Caso de o erro "SyntaxError: JSON Parse error: Expected '}'" ao tentar sincronizar, basta fechar e abrir o app novamente. Repetir até concluir o sincronismo.

Se o erro continuar, utilizar Apache para rodar o server PHP e apontar para o ip do server.

Ex:

a) Alterar .env.development

b) Ficando algo como: `BASE_URL=http://192.168.1.XXX/pasta_do_projeto_ater_php/public`

c) Fechar o terminal `npm start` e rodar novamente

d) As vezes o bundle do React não entende que foi alterado o ".env.development", adicionar um console.log() no arquivo `HttpProvider.js`, logo abaixo dos imports, algo como:

```
   import crashlytics from '@react-native-firebase/crashlytics';

   console.log('foo', BASE_URL);

   ...
```

## Cerebral Debugger Tools

Serve para debugar o state manager utilizado na aplicação React Native.

Não é obrigatório o uso do Cerebral Debugger, mas ele facilito muito na hora do desenvolvimento.

https://cerebraljs.com/

--

Configurar no .env.development o IP que vai rodar o debugger.

Ex: `DEBUGGER=192.168.1.105:8585`

Download: https://github.com/cerebral/cerebral-debugger/releases/tag/v2.5.1

# Fastlane (Release / Hml)

O Fastlane é utilizado para gerar os builds de homologação e produção.

## Setup

https://docs.fastlane.tools/getting-started/android/setup/

## Rodando

Para rodar o fastlane basta executar o comando na raiz do projeto.

```
fastlane
```

Irá aparecer duas opções, uma para gerar a versão que aponta para o servidor de homologação (http://sisrural-hml.brazilsouth.cloudapp.azure.com/) e outra que aponta para o servidor de produção (http://sisrural.prefeitura.sp.gov.br/)

As configurações de apontamento podem ser feitas nas variáveis de ambiente (.env.production.hml e .env.production.prod)

## Setup Windows (Caso encontre problema)

1. Executar como administrador ./fastlane-windows/setup-windows.ps1

2. `ridk install`, option 3

3. `bundle install`

4. Erro no plugin "CURB"
   a) https://jes.al/2012/10/installing-curb-gem-on-windows-7/
   b) Dizipar fastlane-windows/curl-7.47.1-win64-mingw.7z no c:/
   c) gem install curb --platform=ruby -- --with-curl-lib=C:/curl-7.40.0-devel-mingw64/bin --with-curl-include=C:/curl-7.40.0-devel-mingw64/include
