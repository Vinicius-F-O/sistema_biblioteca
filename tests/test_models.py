# tests/test_models.py
import pytest
from models import Funcionario, Livro, Cliente, Servico
from db import db
from datetime import datetime, timedelta

# Testes para Funcionario
def test_criar_funcionario_com_todos_campos(app):
    """Testa a criação de um funcionário com todos os campos preenchidos"""
    with app.app_context():
        data_contratacao = datetime.utcnow()
        f = Funcionario(
            nome="João Silva",
            cpf="12345678900",
            email="joao@email.com",
            cargo="Bibliotecário",
            senha="senha123",
            fotoPerfil="foto.jpg",
            statusFuncionario="Ativo",
            perm_emprestimos=True,
            perm_estoque=True,
            perm_usuarios=False,
            senha_temporaria=False,
            ultimo_acesso=datetime.utcnow()
        )
        db.session.add(f)
        db.session.commit()

        resultado = Funcionario.query.first()
        assert resultado.nome == "João Silva"
        assert resultado.cpf == "12345678900"
        assert resultado.cargo == "Bibliotecário"
        assert resultado.perm_usuarios is False
        assert resultado.senha_temporaria is False

def test_criar_funcionario_sem_campos_obrigatorios_deve_falhar(app):
    """Testa que não é possível criar funcionário sem campos obrigatórios"""
    with app.app_context():
        with pytest.raises(Exception):
            f = Funcionario(
                nome=None,  # Campo obrigatório
                email=None,  # Campo obrigatório
                senha=None  # Campo obrigatório
            )
            db.session.add(f)
            db.session.commit()

def test_cpf_unico_funcionario(app):
    """Testa que não é possível criar dois funcionários com o mesmo CPF"""
    with app.app_context():
        f1 = Funcionario(
            nome="Funcionário 1",
            cpf="11122233344",
            email="func1@email.com",
            senha="senha123"
        )
        db.session.add(f1)
        db.session.commit()
        
        with pytest.raises(Exception):
            f2 = Funcionario(
                nome="Funcionário 2",
                cpf="11122233344",  # Mesmo CPF
                email="func2@email.com",
                senha="outrasenha"
            )
            db.session.add(f2)
            db.session.commit()

# Testes para Livro
def test_criar_livro_com_todos_campos(app):
    """Testa a criação de um livro com todos os campos"""
    with app.app_context():
        l = Livro(
            titulo="Python Avançado",
            autor="Guido van Rossum",
            editora="Editora Python",
            genero="Programação",
            anoPublicacao=2023,
            preco=89.90,
            imgCapa="python.jpg",
            nota=4.5,
            qtdEstoque=15,
            tipoServico="Empréstimo",
            disponibilidade=True
        )
        db.session.add(l)
        db.session.commit()

        resultado = Livro.query.first()
        assert resultado.titulo == "Python Avançado"
        assert resultado.autor == "Guido van Rossum"
        assert resultado.preco == 89.90
        assert resultado.nota == 4.5
        assert resultado.disponibilidade is True

def test_criar_livro_sem_campos_obrigatorios_deve_falhar(app):
    """Testa que não é possível criar livro sem campos obrigatórios"""
    with app.app_context():
        with pytest.raises(Exception):
            l = Livro(
                titulo=None,  # Obrigatório
                autor=None,  # Obrigatório
                editora=None,  # Obrigatório
                genero=None,  # Obrigatório
                anoPublicacao=None,  # Obrigatório
                preco=None,  # Obrigatório
                qtdEstoque=None  # Obrigatório
            )
            db.session.add(l)
            db.session.commit()

# Testes para Cliente
def test_criar_cliente_com_status(app):
    """Testa a criação de cliente com status"""
    with app.app_context():
        c = Cliente(
            nome="Carlos Souza",
            cpf="99988877766",
            email="carlos@email.com",
            telefone="(11) 99999-8888",
            statusCliente="Ativo"
        )
        db.session.add(c)
        db.session.commit()

        resultado = Cliente.query.first()
        assert resultado.nome == "Carlos Souza"
        assert resultado.statusCliente == "Ativo"
        assert resultado.email == "carlos@email.com"

def test_email_unico_cliente(app):
    """Testa que não é possível criar dois clientes com o mesmo email"""
    with app.app_context():
        c1 = Cliente(
            nome="Cliente 1",
            cpf="11122233344",
            email="cliente@email.com",
            telefone="99999-1111"
        )
        db.session.add(c1)
        db.session.commit()
        
        with pytest.raises(Exception):
            c2 = Cliente(
                nome="Cliente 2",
                cpf="55566677788",
                email="cliente@email.com",  # Mesmo email
                telefone="99999-2222"
            )
            db.session.add(c2)
            db.session.commit()

# Testes para Servico
def test_criar_servico_emprestimo(app):
    """Testa a criação de um serviço de empréstimo"""
    with app.app_context():
        # Primeiro cria os registros necessários
        funcionario = Funcionario(
            nome="Atendente",
            email="atendente@email.com",
            senha="senha123"
        )
        cliente = Cliente(
            nome="Cliente Empréstimo",
            email="cliente2@email.com",
            telefone="99999-3333"
        )
        livro = Livro(
            titulo="Livro Empréstimo",
            autor="Autor",
            editora="Editora",
            genero="Gênero",
            anoPublicacao=2023,
            preco=50.0,
            qtdEstoque=5
        )

        # Congela o tempo para evitar variações
        test_time = datetime.utcnow().replace(microsecond=0)
        
        
        db.session.add_all([funcionario, cliente, livro])
        db.session.commit()
        
        # Cria o serviço
        data_prevista = test_time + timedelta(days=7)
        servico = Servico(
            idFuncionario=funcionario.id,
            idCliente=cliente.id,
            idLivro=livro.id,
            categoriaServico="Empréstimo",
            dataPrevistaDevolucao=data_prevista,
            statusServico="Ativo"
        )
        db.session.add(servico)
        db.session.commit()
        
        resultado = Servico.query.first()
        assert resultado.categoriaServico == "Empréstimo"
        assert resultado.statusServico == "Ativo"
        assert resultado.dataPrevistaDevolucao.replace(microsecond=0) == data_prevista
        assert resultado.funcionario.nome == "Atendente"
        assert resultado.cliente.nome == "Cliente Empréstimo"
        assert resultado.livro.titulo == "Livro Empréstimo"

def test_servico_com_livro_inexistente_deve_falhar(app):
    """Testa que não é possível criar serviço com livro inexistente"""
    with app.app_context():
        funcionario = Funcionario(
            nome="Atendente",
            email="atendente@email.com",
            senha="senha123"
        )
        cliente = Cliente(
            nome="Cliente",
            email="cliente3@email.com",
            telefone="99999-4444"
        )
        db.session.add_all([funcionario, cliente])
        db.session.commit()
        
        with pytest.raises(Exception):
            servico = Servico(
                idFuncionario=funcionario.id,
                idCliente=cliente.id,
                idLivro=999,  # ID inexistente
                categoriaServico="Empréstimo"
            )
            db.session.add(servico)
            db.session.commit()

def test_servico_devolucao_com_multa(app):
    """Testa a criação de um serviço de devolução com multa"""
    with app.app_context():
        # Cria dados iniciais
        funcionario = Funcionario(
            nome="Atendente Devolução",
            email="devolucao@email.com",
            senha="senha123"
        )
        cliente = Cliente(
            nome="Cliente Devolução",
            email="devolucao@email.com",
            telefone="99999-5555"
        )
        livro = Livro(
            titulo="Livro Devolução",
            autor="Autor",
            editora="Editora",
            genero="Gênero",
            anoPublicacao=2023,
            preco=60.0,
            qtdEstoque=3
        )
        db.session.add_all([funcionario, cliente, livro])
        db.session.commit()
        
        # Cria empréstimo
        data_emprestimo = datetime.utcnow() - timedelta(days=10)  # 10 dias atrás
        servico_emprestimo = Servico(
            idFuncionario=funcionario.id,
            idCliente=cliente.id,
            idLivro=livro.id,
            categoriaServico="Empréstimo",
            dataServico=data_emprestimo,
            dataPrevistaDevolucao=data_emprestimo + timedelta(days=7),  # Deveria devolver há 3 dias
            statusServico="Atrasado"
        )
        db.session.add(servico_emprestimo)
        db.session.commit()
        
        # Atualiza para devolução com multa
        servico_emprestimo.dataDevolucao = datetime.utcnow()
        servico_emprestimo.multa = 15.0  # 3 dias de atraso, R$5 por dia
        servico_emprestimo.statusServico = "Concluído"  # Ou "Devolvido" conforme seu modelo
        db.session.commit()
        
        # Recarrega o objeto do banco para garantir que estamos testando os dados persistidos
        resultado = Servico.query.first()
        
        # Verificações corrigidas
        assert resultado.statusServico == "Concluído"  # Corrigido para match com o valor definido
        assert resultado.multa == 15.0
        assert resultado.dataDevolucao is not None