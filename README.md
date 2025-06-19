# Sistema de Biblioteca Codex

## 📚 Visão Geral do Projeto

O **Codex** é um sistema web robusto e intuitivo projetado para gerenciar as operações de uma **biblioteca física**. Seu objetivo principal é otimizar o controle de acervo, usuários e serviços de empréstimos/vendas, sendo uma ferramenta exclusiva para uso interno por parte dos funcionários da biblioteca.

Desenvolvido como um projeto acadêmico, o Codex demonstra habilidades em desenvolvimento web full-stack e gerenciamento de banco de dados.

## ✨ Funcionalidades Principais

O sistema Codex oferece as seguintes funcionalidades essenciais para o gerenciamento de uma biblioteca:

* **Dashboard Interativa:** Uma visão geral centralizada com informações e métricas importantes sobre o sistema.
* **Gestão de Estoque (CRUD de Livros):**
    * **C**riar novos registros de livros.
    * **R**ealizar a busca e visualização detalhada de livros.
    * **U**pdate (Atualizar) informações de livros existentes.
    * **D**elete (Excluir) registros de livros do acervo.
* **Gestão de Usuários e Funcionários:**
    * **Cadastro de Administradores:** O sistema possui um fluxo inicial seguro para a criação de contas de administrador através da tela de cadastro, utilizando um código de acesso exclusivo.
    * **Criação de Perfis Diversos:** Administradores logados podem criar novos perfis de usuários (clientes) e de outros funcionários, atribuindo diferentes cargos conforme a necessidade da biblioteca.
* **Serviços de Empréstimo e Venda:**
    * **Registro de Empréstimos:** Cadastro de empréstimos de livros para clientes, com definição de prazos.
    * **Controle de Multas:** Aplicação automática de multas para livros não devolvidos dentro do prazo estipulado.
    * **Registro de Vendas:** Capacidade de registrar vendas de livros.

## 🔒 Acesso ao Sistema e Níveis de Usuário

O acesso ao sistema Codex é restrito a funcionários.

* **Criação de Contas de Administrador:**
    * Para criar o primeiro perfil de administrador, o usuário deve utilizar a tela de cadastro e inserir o código de segurança: `ProjetoCodexA3`.
    * Todos os perfis criados por esta tela são automaticamente atribuídos ao cargo de "Administrador".
* **Gestão de Cargos de Funcionários:**
    * Após o login, administradores podem criar outros perfis de funcionários e atribuir diferentes cargos (além de "Administrador") conforme a estrutura da biblioteca.

## 💻 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

* **Python**
* **Flask**
* **HTML5, CSS3, JavaScript**
* **MySQL**
* [Jinja2 foi utilizado como ferramenta de templates]

## ⚙️ Como Rodar o Sistema Localmente

Para configurar e rodar o Sistema de Biblioteca Codex em sua máquina, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter os seguintes softwares instalados:

* **MySQL Server:** O sistema requer uma instância do MySQL rodando.
* **Python 3**
* **pip para python**
* **Git** (Para clonar o repositório)

### Configuração do Banco de Dados

1.  Certifique-se de que seu servidor MySQL está em execução.
2.  Crie um novo banco de dados chamado `biblioteca_db`. Você pode fazer isso via linha de comando ou uma ferramenta gráfica como MySQL Workbench:
    ```sql
    CREATE DATABASE biblioteca_db;
    ```
3.  O sistema, por padrão, tenta se conectar ao MySQL usando o usuário `root`. **É necessário alterar a senha do usuário `root` no código para a sua senha do MySQL.**
    * Abra o arquivo `main.py`.
    * Localize a seção de conexão com o banco de dados e altere a senha:
        ```python
        #     app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:SuaSenhaAqui@localhost/biblioteca_db' # <-- ALTERE ESTA LINHA
        #     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        #     db.init_app(app)
        ```
    * *Nota:* Esta configuração atual será refatorada em futuras versões para um método mais seguro e configurável.

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SeuUsuario/NomeDoRepositorio.git](https://github.com/SeuUsuario/NomeDoRepositorio.git)
    cd NomeDoRepositorio
    ```
2.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Inicie o servidor da aplicação:**
    ```bash
    py main.py
    ```
5.  **Acesse o sistema:**
    * Abra seu navegador e acesse: `http://localhost:5000` ou `http://127.0.0.1:5000`

## 🤝 Contribuição

Contribuições são bem-vindas! Se você tiver sugestões, encontrar bugs ou quiser melhorar o código, sinta-se à vontade para abrir uma *issue* ou enviar um *pull request*.

## 👨‍💻 Desenvolvedor

Este projeto foi desenvolvido por:

* **Vinícius F. Oliveira** - linkedin.com/in/viniciusf-oliveira
