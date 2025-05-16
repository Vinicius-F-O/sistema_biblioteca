from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from db import db
from models import Funcionario, Livro
from datetime import datetime
import hashlib

#Criar uma instância do Flask
app = Flask(__name__)
app.secret_key = 'A3deErivelton'
lm = LoginManager(app)
lm.login_view = 'login'

#Adicionar database
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dados.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:125867Ju@localhost/biblioteca_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Recomendado
db.init_app(app)

def hash(txt):
    hash_obj = hashlib.sha256(txt.encode('utf-8'))
    return hash_obj.hexdigest()

@lm.user_loader
def user_loader(id):
    usuario = db.session.query(Funcionario).filter_by(id=id).first()
    return usuario

#Criar uma rota pro decorator
@app.route('/')
@login_required
def home():
    return render_template("index.html")

@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'GET':
        return render_template("cadastro.html")
    elif request.method == 'POST':
        nome = request.form.get('nomeForm')
        email = request.form.get('emailForm')
        senha = request.form.get('senhaForm')
        senhaRepetir = request.form.get('repetirSenhaForm')
        checkBoxTermos = request.form.get('checkBoxTermosForm')

        nova_pessoa = Funcionario(nome=nome, email=email, senha=hash(senha))
        db.session.add(nova_pessoa)
        db.session.commit()
        
        login_user(nova_pessoa)

        return redirect(url_for("home"))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    elif request.method == 'POST':
        email = request.form.get('emailForm')
        senha = request.form.get('senhaForm')

        user = db.session.query(Funcionario).filter_by(email=email, senha=hash(senha)).first()
        if not user:
            return 'Nome ou senha incorretos.'
        
        login_user(user)
        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/estoque', methods=['GET', 'POST'])
def estoque():
    if request.method == 'GET':
        livros = Livro.query.all()
        qtdLivros = len(livros)

        #Valor total em estoque (preço * quantidade)
        valor_estoque = sum(float(l.preco) * int(l.qtdEstoque) for l in livros)

        #Custo do estoque (vamos supor 75% do preço de venda como exemplo)
        custo_estoque = sum(float(l.preco) * 0.75 * int(l.qtdEstoque) for l in livros)

        #Lucro previsto
        lucro_previsto = valor_estoque - custo_estoque

        #Quantos livros têm estoque baixo (<= 10, mas > 0)
        estoque_baixo = sum(1 for l in livros if 0 < int(l.qtdEstoque) <= 10)

        #Quantos livros estão com 0 em estoque
        sem_estoque = sum(1 for l in livros if int(l.qtdEstoque) == 0)

        return render_template(
            "estoque.html",
            livros=livros,
            qtdLivros=qtdLivros,
            valor_estoque=valor_estoque,
            custo_estoque=custo_estoque,
            lucro_previsto=lucro_previsto,
            estoque_baixo=estoque_baixo,
            sem_estoque=sem_estoque
        )
    
    elif request.method == 'POST':
        titulo = request.form.get('tituloForm')
        autor = request.form.get('autorForm')
        editora = request.form.get('editoraForm')
        genero = request.form.get('generoForm')
        anoPublicacao = request.form.get('anoPublicacaoForm')
        tipoServico = request.form.get('tipoServicoForm')
        preco = request.form.get('precoForm')
        qtdEstoque = request.form.get('qtdEstoqueForm')
        nota = request.form.get('notaForm')
        imgCapa = request.form.get('imgCapaForm')

        
        novoLivro = Livro(titulo=titulo, autor=autor, editora=editora, genero=genero, anoPublicacao=anoPublicacao, 
                          tipoServico=tipoServico, preco=preco, qtdEstoque=qtdEstoque, nota=nota, imgCapa=imgCapa)
        db.session.add(novoLivro)
        db.session.commit()
        return redirect(url_for('estoque'))

@app.route('/servicos')
def servicos():
    return render_template("servicos.html")

#Criar páginas de erro

#URL inválida
@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

#Erro de server interno
@app.errorhandler(500)
def page_not_found(e):
    return render_template("500.html"), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)