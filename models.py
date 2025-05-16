from db import db
from flask_login import UserMixin
from datetime import datetime

class Funcionario(UserMixin, db.Model):
    __tablename__ = 'funcionarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(15), nullable=True, unique=True)
    email = db.Column(db.String(100), nullable=False)
    cargo = db.Column(db.String(20), nullable=True)
    senha = db.Column(db.String(200), nullable=False)
    dataContratacao = db.Column(db.DateTime, default=datetime.utcnow)
    fotoPerfil = db.Column(db.String(200), nullable=True)
    
    def __repr__(self):
        return f"<{self.nome}>"
    
class Livro(db.Model):
    __tablename__ = 'livros'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(50), nullable=False)
    autor = db.Column(db.String(30), nullable=False)
    editora = db.Column(db.String(30), nullable=False)
    genero = db.Column(db.String(50), nullable=False)
    anoPublicacao = db.Column(db.Integer, nullable=False)
    preco = db.Column(db.Float, nullable=False)
    imgCapa = db.Column(db.String(100), nullable=True)
    nota = db.Column(db.Float, nullable=True)
    qtdEstoque = db.Column(db.Integer, nullable=False)
    tipoServico = db.Column(db.String(20), nullable=True)
    disponibilidade = db.Column(db.String(20), nullable=True)

    def __repr__(self):
        return f"<{self.titulo}>"
    
class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(15), nullable=True, unique=True)
    email = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f"<{self.nome}>"

class Servico(db.Model):
    __tablename__ = 'servicos'
    id = db.Column(db.Integer, primary_key=True)
    idFuncionario = db.Column(db.Integer, nullable=False)
    idCliente = db.Column(db.Integer, nullable=False)
    idLivro = db.Column(db.Integer, nullable=False)
    categoriaServico = db.Column(db.String(15), nullable=False)
    dataServico = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    dataPrevistaDevolucao = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)

    def __repr__(self):
        return f"<{self.id}>"