# tests/test_routes.py
import pytest
from main import app, db
from models import Funcionario, Livro, Cliente, Servico
import hashlib
from datetime import datetime, date

@pytest.fixture(scope='module', autouse=True)
def clean_db():
    """Garante que cada teste comece com DB limpo"""
    db.session.remove()
    db.drop_all()
    db.create_all()
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Usar DB em memória para testes
    
    with app.app_context():
        db.create_all()  # Criar tabelas

        # Criar um usuário de teste
        senha_hasheada = hashlib.sha256("test_password".encode('utf-8')).hexdigest()
        admin_user = Funcionario(
            nome='Admin Teste',
            email='admin@teste.com',
            senha=senha_hasheada,
            cargo='Administrador',
            statusFuncionario='Ativo',
            senha_temporaria=False
        )
        db.session.add(admin_user)
        db.session.commit()

        yield app.test_client()  # Fornece o cliente de teste

        db.session.remove()
        db.drop_all()  # Limpar tabelas após os testes

@pytest.fixture
def logged_in_client(client):
    with client: # Usa o cliente da fixture "client"
        client.post('/login', data={'emailForm': 'admin@teste.com', 'senhaForm': 'test_password'})
        yield client


# Testes de rota

def test_home_route_requires_login(client):
    # Redireciona para login se não estiver logado
    resposta = client.get('/')
    assert resposta.status_code == 302
    assert '/login' in resposta.headers['Location']

def test_home_route_logged_in(logged_in_client):
    # Acessa a página principal se estiver logado
    resposta = logged_in_client.get('/')
    assert resposta.status_code == 200
    assert 'Dashboard' in resposta.data.decode('utf-8') # Verifica se o conteúdo esperado está na página

def test_cadastro_get(client):
    resposta = client.get('/cadastro')
    assert resposta.status_code == 200

def test_cadastro_post_success(client):
    resposta = client.post('/cadastro', data={
        'nomeForm': 'Novo Funcionario',
        'emailForm': 'novo@funcionario.com',
        'senhaForm': 'senha123',
        'repetirSenhaForm': 'senha123',
        'checkBoxTermosForm': 'on',
        'codigoAcessoForm': 'ProjetoCodexA3'  # Código de acesso correto
    })
    assert resposta.status_code == 302
    assert '/home' in resposta.headers['Location']

def test_cadastro_post_wrong_code(client):
    resposta = client.post('/cadastro', data={
        'nomeForm': 'Novo Funcionario',
        'emailForm': 'novo@funcionario.com',
        'senhaForm': 'senha123',
        'repetirSenhaForm': 'senha123',
        'checkBoxTermosForm': 'on',
        'codigoAcessoForm': 'codigo_errado'  # Código de acesso incorreto
    })
    assert resposta.status_code == 200 # Permanece na mesma página
    assert 'Código de acesso incorreto!' in resposta.data.decode('utf-8') # Verifica a mensagem de erro

def test_login_get(client):
    resposta = client.get('/login')
    assert resposta.status_code == 200

def test_login_post_success(client):
    resposta = client.post('/login', data={'emailForm': 'admin@teste.com', 'senhaForm': 'test_password'})
    assert resposta.status_code == 302
    assert '/home' in resposta.headers['Location']

def test_login_post_invalid_credentials(client):
    resposta = client.post('/login', data={'emailForm': 'admin@teste.com', 'senhaForm': 'wrong_password'})
    assert resposta.status_code == 200
    assert 'Nome ou senha incorretos.' in resposta.data.decode('utf-8')

def test_logout_route(logged_in_client):
    resposta = logged_in_client.get('/logout')
    assert resposta.status_code == 302
    assert '/home' in resposta.headers['Location'] # Redireciona para home, mas sem estar logado

def test_estoque_route_logged_in(logged_in_client):
    resposta = logged_in_client.get('/estoque')
    assert resposta.status_code == 200
    assert 'Gerenciar Estoque' in resposta.data.decode('utf-8')

def test_estoque_route_post_add_livro(logged_in_client):
    resposta = logged_in_client.post('/estoque', data={
        'tituloForm': 'Livro Teste',
        'autorForm': 'Autor Teste',
        'editoraForm': 'Editora Teste',
        'generoForm': 'Ficcao',
        'anoPublicacaoForm': '2023',
        'tipoServicoForm': 'Emprestimo',
        'precoForm': '29.99',
        'qtdEstoqueForm': '10',
        'notaForm': '4.5',
        'imgCapaForm': 'capa.jpg'
    })
    assert resposta.status_code == 302
    assert '/estoque' in resposta.headers['Location']

def test_servicos_route_logged_in(logged_in_client):
    resposta = logged_in_client.get('/servicos')
    assert resposta.status_code == 200
    assert 'Gerenciar Servi' in resposta.data.decode('utf-8')

def test_usuarios_route_logged_in(logged_in_client):
    resposta = logged_in_client.get('/usuarios')
    assert resposta.status_code == 200
    assert 'Gerenciar Usu' in resposta.data.decode('utf-8')

# Testes para rotas API e com IDs (exigem mock de dados específicos ou criação em massa)

def test_deletar_livro(logged_in_client):
    # Crie um livro para deletar
    new_book = Livro(
        titulo='Livro para Deletar', autor='Autor X', editora='Editora Y',
        genero='Terror', anoPublicacao=2000, preco=10.00, qtdEstoque=5,
        tipoServico='Venda', nota=3.0, imgCapa='None'
    )
    db.session.add(new_book)
    db.session.commit()

    # Deleta o livro
    resposta = logged_in_client.delete(f'/deletar-livro/{new_book.id}')
    assert resposta.status_code == 204  # No Content
    assert Livro.query.get(new_book.id) is None

def test_buscar_cliente(client):
    # Criar um cliente para buscar
    new_cliente = Cliente(
        nome='Cliente Teste', cpf='111.111.111-11', email='cliente@teste.com', 
        telefone='11999999999', statusCliente='Ativo'
    )
    db.session.add(new_cliente)
    db.session.commit()

    resposta = client.get(f'/buscar-cliente?cpf={new_cliente.cpf}')
    assert resposta.status_code == 200
    json_data = resposta.get_json()
    assert json_data['found'] == True
    assert json_data['nome'] == 'Cliente Teste'

def test_obter_livro(client):
    new_book = Livro(
        titulo='Livro Info', autor='Autor I', editora='Editora J',
        genero='Drama', anoPublicacao=2010, preco=25.00, qtdEstoque=3,
        tipoServico='Emprestimo', nota=4.0, imgCapa='cover.jpg'
    )
    db.session.add(new_book)
    db.session.commit()

    resposta = client.get(f'/livros/{new_book.id}')
    assert resposta.status_code == 200
    json_data = resposta.get_json()
    assert json_data['titulo'] == 'Livro Info'
    assert json_data['genero'] == 'Drama'

def test_buscar_livros_logged_in(logged_in_client):
    new_book = Livro(
        titulo='Buscar Teste', autor='Autor Busca', editora='Editora Busca',
        genero='Comedia', anoPublicacao=2020, preco=15.00, qtdEstoque=7,
        tipoServico='Venda', nota=3.5, imgCapa='another_cover.jpg'
    )
    db.session.add(new_book)
    db.session.commit()

    resposta = logged_in_client.get(f'/buscar-livros?query={new_book.titulo}')
    assert resposta.status_code == 200
    json_data = resposta.get_json()
    assert len(json_data['livros']) > 0
    assert json_data['livros'][0]['titulo'] == 'Buscar Teste'

def test_devolver_servico(logged_in_client):
    # Crie um cliente, um livro e um serviço de empréstimo
    cliente = Cliente(nome='Cli Dev', cpf='222.222.222-22', email='cli@dev.com', telefone='11888888888', statusCliente='Ativo')
    livro = Livro(titulo='Livro Dev', autor='Autor Dev', editora='Editora Dev', genero='Aventura', anoPublicacao=2015, preco=30.00, qtdEstoque=1, tipoServico='Emprestimo', nota=4.2, imgCapa='dev_cover.jpg')
    db.session.add_all([cliente, livro])
    db.session.commit()

    servico = Servico(
        idFuncionario=logged_in_client.application.user_loader(1).id, # Pega o ID do admin user do fixture
        idCliente=cliente.id,
        idLivro=livro.id,
        categoriaServico='Empréstimo',
        dataServico=datetime.now(),
        dataPrevistaDevolucao=datetime.now(),
        statusServico='Ativo'
    )
    db.session.add(servico)
    db.session.commit()

    # Devolve o serviço
    resposta = logged_in_client.post(f'/devolver-servico/{servico.id}')
    assert resposta.status_code == 200
    json_data = resposta.get_json()
    assert json_data['success'] == True
    assert json_data['status'] == 'Concluído'


def test_pagar_multa(logged_in_client):
    # Crie um cliente, um livro e um serviço com multa
    cliente = Cliente(nome='Cli Multa', cpf='333.333.333-33', email='cli@multa.com', telefone='11777777777', statusCliente='Ativo')
    livro = Livro(titulo='Livro Multa', autor='Autor Multa', editora='Editora Multa', genero='Suspense', anoPublicacao=2018, preco=40.00, qtdEstoque=1, tipoServico='Emprestimo', nota=3.8, imgCapa='multa_cover.jpg')
    db.session.add_all([cliente, livro])
    db.session.commit()

    servico = Servico(
        idFuncionario=logged_in_client.application.user_loader(1).id,
        idCliente=cliente.id,
        idLivro=livro.id,
        categoriaServico='Empréstimo',
        dataServico=datetime.now(),
        dataPrevistaDevolucao=datetime(2023, 1, 1), # Data passada para gerar multa
        statusServico='Multa pendente',
        multa=10.0
    )
    db.session.add(servico)
    db.session.commit()

    # Paga a multa
    resposta = logged_in_client.post(f'/pagar-multa/{servico.id}')
    assert resposta.status_code == 200
    json_data = resposta.get_json()
    assert json_data['success'] == True
    assert Servico.query.get(servico.id).statusServico == 'Concluído'
    assert Servico.query.get(servico.id).multa == 0


def test_trocar_senha_get(logged_in_client):
    resposta = logged_in_client.get('/trocar-senha')
    assert resposta.status_code == 200
    assert 'Trocar Senha' in resposta.data.decode('utf-8')

def test_trocar_senha_post_success(logged_in_client):
    resposta = logged_in_client.post('/trocar-senha', data={
        'novaSenha': 'nova_senha_teste',
        'repetirSenha': 'nova_senha_teste'
    })
    assert resposta.status_code == 302
    assert '/home' in resposta.headers['Location']
    # Verifica se a senha_temporaria foi alterada
    assert logged_in_client.application.user_loader(1).senha_temporaria == False

def test_trocar_senha_post_mismatch(logged_in_client):
    resposta = logged_in_client.post('/trocar-senha', data={
        'novaSenha': 'nova_senha_teste',
        'repetirSenha': 'senhas_nao_iguais'
    })
    assert resposta.status_code == 200
    assert 'As senhas n' in resposta.data.decode('utf-8') # Verifica a mensagem de erro