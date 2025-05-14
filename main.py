from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from db import db
from models import Usuario

#Criar uma instância do Flask
app = Flask(__name__)

#Adicionar database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dados.db'
db.init_app(app)

with app.app_context():
    db.create_all()

#Criar uma rota pro decorator
@app.route('/')
def home():
    usuarios = db.session.query(Usuario).filter_by(id=1).first()
    return render_template("index.html", usuarios=usuarios)

@app.route('/estoque')
def estoque():
    return render_template("estoque.html")

#Criar páginas de erro

#URL inválida
@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

#Erro de server interno
@app.errorhandler(500)
def page_not_found(e):
    return render_template("500.html"), 500