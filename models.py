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
    statusFuncionario = db.Column(db.String(20), nullable=True)
    perm_emprestimos = db.Column(db.Boolean, default=True)
    perm_estoque = db.Column(db.Boolean, default=True)
    perm_usuarios = db.Column(db.Boolean, default=True)
    
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
    disponibilidade = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f"<{self.titulo}>"
    
class Cliente(db.Model):
    __tablename__ = 'clientes'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(15), nullable=True, unique=True)
    email = db.Column(db.String(100), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    statusCliente = db.Column(db.String(20), nullable=True)

    def __repr__(self):
        return f"<{self.nome}>"

class Servico(db.Model):
    __tablename__ = 'servicos'
    id = db.Column(db.Integer, primary_key=True)
    
    idFuncionario = db.Column(db.Integer, db.ForeignKey('funcionarios.id'), nullable=False)
    idCliente = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    idLivro = db.Column(db.Integer, db.ForeignKey('livros.id'), nullable=False)

    categoriaServico = db.Column(db.String(15), nullable=False)
    dataServico = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    dataPrevistaDevolucao = db.Column(db.DateTime, default=datetime.utcnow, nullable=True)
    dataDevolucao = db.Column(db.DateTime, nullable=True)
    multa = db.Column(db.Float, nullable=True)
    statusServico = db.Column(db.String(20), nullable=True)

    # Relacionamentos
    livro = db.relationship('Livro', backref='servicos', lazy=True)
    cliente = db.relationship('Cliente', backref='servicos', lazy=True)
    funcionario = db.relationship('Funcionario', backref='servicos', lazy=True)

    def __repr__(self):
        return f"<{self.id}>"