from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from db import db
from models import Funcionario
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

@app.route('/estoque')
def estoque():
    return render_template("estoque.html")

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