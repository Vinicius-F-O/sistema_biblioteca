from flask import Flask, render_template

#Criar uma instância do Flask
app = Flask(__name__)

#Criar uma rota pro decorator
@app.route('/')

def index():
    return render_template("index.html")

#Criar páginas de erro

#URL inválida
@app.errorhandler(404)
def page_not_found(e):
    return render_template("404.html"), 404

#Erro de server interno
@app.errorhandler(500)
def page_not_found(e):
    return render_template("500.html"), 500