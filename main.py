from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from db import db
from models import Funcionario, Livro, Cliente, Servico
from datetime import datetime, date
import hashlib
from sqlalchemy import func
from collections import defaultdict

def parse_datetime(dt_str):
    if not dt_str:
        return None
    try:
        return datetime.strptime(dt_str, '%Y-%m-%dT%H:%M')
    except ValueError:
        return None

#Criar uma instância do Flask
app = Flask(__name__)
app.secret_key = 'A3deErivelton'
lm = LoginManager(app)
lm.login_view = 'login'
lm.login_message = "Você precisa estar logado para acessar esta página."
lm.login_message_category = "warning"

#Adicionar database
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dados.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:SuaSenhaAqui@localhost/biblioteca_db'
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
    # Consulta para contar empréstimos por livro
    populares = (
        db.session.query(
            Livro,
            func.count(Servico.id).label('total_emprestimos')
        )
        .join(Servico, Servico.idLivro == Livro.id)
        .filter(Servico.categoriaServico == "Empréstimo")
        .group_by(Livro.id)
        .order_by(func.count(Servico.id).desc())
        .limit(4)
        .all()
    )
    # populares será uma lista de tuplas: (Livro, total_emprestimos)

    # Buscar as 5 atividades mais recentes
    atividades_recentes = (
        db.session.query(Servico, Cliente, Livro)
        .join(Cliente, Servico.idCliente == Cliente.id)
        .join(Livro, Servico.idLivro == Livro.id)
        .order_by(Servico.dataServico.desc())
        .limit(5)
        .all()
    )

    # Empréstimos mensais (do ano atual)
    ano_atual = datetime.now().year
    emprestimos_por_mes = [0] * 12  # Janeiro = 0, Dezembro = 11
    emprestimos = (
        db.session.query(Servico)
        .filter(Servico.categoriaServico == "Empréstimo")
        .filter(func.extract('year', Servico.dataServico) == ano_atual)
        .all()
    )
    for s in emprestimos:
        mes = s.dataServico.month - 1
        emprestimos_por_mes[mes] += 1

    # Tipos de livros (gêneros)
    generos = db.session.query(Livro.genero, func.count(Livro.id)).group_by(Livro.genero).all()
    generos_labels = [g[0] for g in generos]
    generos_counts = [g[1] for g in generos]

    hoje = datetime.now().date()
    mes_atual = hoje.month
    ano_atual = hoje.year

    # Empréstimos ativos
    emprestimos_ativos = db.session.query(Servico).filter(
        Servico.categoriaServico == "Empréstimo",
        Servico.statusServico == "Ativo"
    ).count()

    # Vendas de hoje
    vendas_hoje = db.session.query(Servico).filter(
        Servico.categoriaServico == "Venda",
        func.date(Servico.dataServico) == hoje
    ).all()
    total_vendas_hoje = len(vendas_hoje)
    valor_vendas_hoje = sum(float(v.livro.preco) for v in vendas_hoje if v.livro and v.livro.preco)

    # Devoluções pendentes (empréstimos ativos)
    devolucoes_pendentes = db.session.query(Servico).filter(
        Servico.categoriaServico == "Empréstimo",
        Servico.statusServico == "Ativo"
    ).count()

    # Devoluções previstas para hoje
    devolucoes_hoje = db.session.query(Servico).filter(
        Servico.categoriaServico == "Empréstimo",
        Servico.statusServico == "Ativo",
        func.date(Servico.dataPrevistaDevolucao) == hoje
    ).count()

    # Receita mensal (vendas do mês atual)
    receita_mensal = db.session.query(Servico).join(Livro, Servico.idLivro == Livro.id).filter(
        Servico.categoriaServico == "Venda",
        func.extract('month', Servico.dataServico) == mes_atual,
        func.extract('year', Servico.dataServico) == ano_atual
    ).with_entities(func.sum(Livro.preco)).scalar() or 0

    # Atrasados
    atrasados = db.session.query(Servico).filter(
        Servico.categoriaServico == "Empréstimo",
        Servico.statusServico == "Ativo",
        Servico.dataPrevistaDevolucao < datetime.now()
    ).count()

    stats = {
        "emprestimos_ativos": emprestimos_ativos,
        "atrasados": atrasados,
        "vendas_hoje": total_vendas_hoje,
        "valor_vendas_hoje": f"R$ {valor_vendas_hoje:,.2f}".replace(".", ",").replace(",", ".", 1),
        "devolucoes_pendentes": devolucoes_pendentes,
        "devolucoes_hoje": devolucoes_hoje,
        "receita_mensal": f"R$ {receita_mensal:,.2f}".replace(".", ",").replace(",", ".", 1)
    }

    return render_template(
        "index.html",
        populares=populares,
        atividades_recentes=atividades_recentes,
        emprestimos_por_mes=emprestimos_por_mes,
        generos_labels=generos_labels,
        generos_counts=generos_counts,
        stats=stats,
        senha_temporaria=getattr(current_user, 'senha_temporaria', False),
        active_page='dashboard'
    )

@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    CODIGO_ADMIN = "ProjetoCodexA3"  # Defina o código correto aqui

    if request.method == 'GET':
        return render_template("cadastro.html")
    elif request.method == 'POST':
        nome = request.form.get('nomeForm')
        email = request.form.get('emailForm')
        senha = request.form.get('senhaForm')
        senhaRepetir = request.form.get('repetirSenhaForm')
        checkBoxTermos = request.form.get('checkBoxTermosForm')
        codigo_acesso = request.form.get('codigoAcessoForm')

        if codigo_acesso != CODIGO_ADMIN:
            flash('Código de acesso incorreto!', 'danger')
            return render_template("cadastro.html")

        nova_pessoa = Funcionario(
            nome=nome,
            email=email,
            senha=hash(senha),
            statusFuncionario='Ativo',
            cargo='Administrador',  # Define automaticamente como Administrador
            senha_temporaria=False  # Não exige troca de senha para administradores cadastrados
        )
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
        user.ultimo_acesso = datetime.now()
        db.session.commit()

        return redirect(url_for('home'))

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/estoque', methods=['GET', 'POST'])
@login_required
def estoque():
    if request.method == 'GET':
        livros = Livro.query.all()
        qtdLivros = len(livros)
        query = request.args.get('q', '').strip()  # pega o valor da barra de busca, se existir

        if query:
            livros = Livro.query.filter(
                or_(
                    Livro.titulo.ilike(f"%{query}%"),
                    Livro.autor.ilike(f"%{query}%"),  # exemplo de outro campo
                    Livro.editora.ilike(f"%{query}%")   # outro exemplo, se existir
                )
            ).all()
        else:
            livros = Livro.query.all()

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
            sem_estoque=sem_estoque,
            active_page='estoque'
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
    

@app.route('/servicos', methods=['GET', 'POST'])
@login_required
def servicos():
    if request.method == 'GET':
        funcionarios = Funcionario.query.all()
        clientes = Cliente.query.all()
        livros_objs = Livro.query.all()
        servicos = Servico.query.all()
        query = request.args.get('q', '').strip()

        if query:
            servicos = [
                s for s in servicos if
                query.lower() in str(s.id).lower() or
                query.lower() in s.livro.titulo.lower() or
                query.lower() in s.cliente.nome.lower()
            ]
        
        hoje = datetime.now().date()
        mes_atual = hoje.month
        ano_atual = hoje.year

        # Empréstimos ativos
        emprestimos_ativos = [s for s in servicos if s.statusServico == "Ativo" and s.categoriaServico == "Empréstimo"]

        # Atrasados
        atrasados = [
            s for s in emprestimos_ativos
            if s.dataPrevistaDevolucao and s.dataPrevistaDevolucao.date() < hoje
        ]

        # Vendas de hoje
        vendas_hoje = [
            s for s in servicos
            if s.categoriaServico == "Venda" and s.dataServico.date() == hoje
        ]
        total_vendas_hoje = sum(s.livro.preco for s in vendas_hoje)

        # Devoluções pendentes
        devolucoes_pendentes = emprestimos_ativos

        # Devoluções hoje
        devolucoes_hoje = [
            s for s in devolucoes_pendentes
            if s.dataPrevistaDevolucao and s.dataPrevistaDevolucao.date() == hoje
        ]

        # Receita mensal
        receita_mensal = sum(
            s.livro.preco for s in servicos
            if s.categoriaServico == "Venda" and
            s.dataServico.month == mes_atual and
            s.dataServico.year == ano_atual
        )

        livros = [
            {   
                "id": l.id,
                "titulo": l.titulo,
                "autor": l.autor,
                "editora": l.editora,
                "genero": l.genero,
                "preço": l.preco,
                "anoPublicacao": l.anoPublicacao
            }
                for l in livros_objs
        ]

        return render_template(
            "servicos.html",
            livros=livros,
            funcionarios=funcionarios,
            clientes=clientes,
            servicos=servicos,
            stats={
                "emprestimos_ativos": len(emprestimos_ativos),
                "atrasados": len(atrasados),
                "vendas_hoje": len(vendas_hoje),
                "valor_vendas_hoje": f"R$ {total_vendas_hoje:.2f}".replace(".", ","),
                "devolucoes_pendentes": len(devolucoes_pendentes),
                "devolucoes_hoje": len(devolucoes_hoje),
                "receita_mensal": f"R$ {receita_mensal:,.2f}".replace(".", ",").replace(",", ".", 1)
            },
            active_page='servicos'
        )
    elif request.method == 'POST':
        try:
            tipo_servico = request.form.get('serviceType')
            cpf_cliente = request.form.get('clienteForm')
            funcionario_id = request.form.get('funcionarioForm')
            livro_info = request.form.get('livroForm')
            data_servico = request.form.get('dataForm')
            data_devolucao = request.form.get('dataDevolucaoForm')
            status_servico = request.form.get('statusForm') or 'Ativo'

            # Conversão de datas
            data_servico = parse_datetime(request.form.get('dataForm')) or datetime.now()
            data_devolucao = parse_datetime(request.form.get('dataDevolucaoForm')) or datetime.now()

            # Busca nas tabelas
            cliente = Cliente.query.filter_by(cpf=cpf_cliente).first()
            funcionario = Funcionario.query.get(funcionario_id)
            livro = Livro.query.filter(
                (Livro.id == livro_info) | 
                (Livro.titulo.ilike(f"%{livro_info}%")) |
                (Livro.autor.ilike(f"%{livro_info}%")) |
                (Livro.editora.ilike(f"%{livro_info}%"))
            ).first()

            # Verificações básicas
            if not cliente:
                flash('Cliente não encontrado pelo CPF informado.', 'danger')
                return redirect(url_for('servicos'))

            if cliente.statusCliente != 'Ativo':
                flash('Cliente não está ativo e não pode realizar novos serviços.', 'danger')
                return redirect(url_for('servicos'))

            if not funcionario:
                flash('Funcionário inválido.', 'danger')
                return redirect(url_for('servicos'))

            if not livro:
                flash('Livro não encontrado com os dados informados.', 'danger')
                return redirect(url_for('servicos'))

            # Verifica se há estoque disponível
            if int(livro.qtdEstoque) <= 0:
                flash('Livro sem estoque disponível para empréstimo ou venda.', 'danger')
                return redirect(url_for('servicos'))

            # Diminui o estoque em 1
            livro.qtdEstoque = int(livro.qtdEstoque) - 1
            db.session.add(livro)

            novo_servico = Servico(
                idFuncionario=funcionario.id,
                idCliente=cliente.id,
                idLivro=livro.id,
                categoriaServico=tipo_servico,
                dataServico=data_servico,
                dataPrevistaDevolucao=data_devolucao,
                statusServico=status_servico
            )

            db.session.add(novo_servico)
            db.session.commit()
            flash('Serviço registrado com sucesso!', 'success')
            return redirect(url_for('servicos'))
        
        except Exception as e:
            db.session.rollback()
            flash(f'Erro ao registrar o serviço: {str(e)}', 'danger')
            return redirect(url_for('servicos'))

@app.route('/usuarios', methods=['GET', 'POST'])
@login_required
def usuarios():
    if request.method == 'GET':
        query = request.args.get('q', '').strip()  # pega o valor da barra de busca, se existir
        if query:
            funcionarios = Funcionario.query.filter(
                or_(
                    Funcionario.nome.ilike(f"%{query}%"),
                    Funcionario.email.ilike(f"%{query}%"),  # exemplo de outro campo
                    Funcionario.cargo.ilike(f"%{query}%")   # outro exemplo, se existir
                )
            ).all()

            clientes = Cliente.query.filter(
                or_(
                    Cliente.nome.ilike(f"%{query}%"),
                    Cliente.email.ilike(f"%{query}%"),
                    Cliente.cpf.ilike(f"%{query}%")  # outro exemplo de campo
                )
            ).all()
        else:
            funcionarios = Funcionario.query.all()
            clientes = Cliente.query.all()

        # Adiciona contagem de empréstimos ativos e multas pendentes para cada cliente
        for cliente in clientes:
            cliente.emprestimos_ativos = Servico.query.filter_by(idCliente=cliente.id, statusServico='Ativo').count()
            cliente.multas_pendentes = Servico.query.filter_by(idCliente=cliente.id, statusServico='Multa pendente').count()

        # Cálculos dos cards
        total_clientes = Cliente.query.count()
        total_funcionarios = Funcionario.query.count()
        total_bibliotecarios = Funcionario.query.filter_by(cargo='Bibliotecário').count()
        emprestimos_ativos = Servico.query.filter_by(statusServico='Ativo').count()
        emprestimos_atrasados = Servico.query.filter(Servico.statusServico == 'Ativo', Servico.dataPrevistaDevolucao < datetime.now()).count()
        multas_pendentes = Servico.query.filter_by(statusServico='Multa pendente').count()
        valor_multas = db.session.query(func.sum(Servico.multa)).filter(Servico.statusServico == 'Multa pendente').scalar() or 0

        stats_usuarios = {
            "total_clientes": total_clientes,
            "total_funcionarios": total_funcionarios,
            "total_bibliotecarios": total_bibliotecarios,
            "emprestimos_ativos": emprestimos_ativos,
            "emprestimos_atrasados": emprestimos_atrasados,
            "multas_pendentes": multas_pendentes,
            "valor_multas": valor_multas,
        }

        active_tab = request.args.get('tab', 'clients')  # 'clients' é o padrão

        return render_template(
            "usuarios.html",
            funcionarios=funcionarios,
            clientes=clientes,
            stats_usuarios=stats_usuarios,
            active_tab=active_tab,  # opcional
            active_page='usuarios'
        )

    elif request.method == 'POST':
        # Lógica para identificar se é cliente ou funcionário pelo nome de um campo exclusivo
        if 'nomeClienteForm' in request.form:
            # Formulário de Cliente
            nome = request.form.get('nomeClienteForm')
            cpf = request.form.get('cpfClienteForm')
            email = request.form.get('emailClienteForm')
            telefone = request.form.get('telefoneClienteForm')

            novo_cliente = Cliente(nome=nome, cpf=cpf, email=email, telefone=telefone, statusCliente='Ativo')
            db.session.add(novo_cliente)
            db.session.commit()
            print('Cliente cadastrado com sucesso!', 'success')

        elif 'nomeStaffForm' in request.form:
            # Formulário de Funcionário
            nome = request.form.get('nomeStaffForm')
            cargo = request.form.get('cargoStaffForm')
            data_contratacao = request.form.get('dataContratacaoForm')
            email = request.form.get('emailStaffForm')
            senha = request.form.get('passwordStaffForm')

            # Permissões (True se marcado, False se não)
            perm_emprestimos = 'permissaoGerenciarEmprestimosForm' in request.form
            perm_estoque = 'permissaoGerenciarEstoqueForm' in request.form
            perm_usuarios = 'permissaoGerenciarUsuariosForm' in request.form

            novo_funcionario = Funcionario(
                nome=nome,
                cargo=cargo,
                dataContratacao=data_contratacao,
                email=email,
                senha=hash(senha),
                statusFuncionario='Ativo',
                perm_emprestimos=perm_emprestimos,
                perm_estoque=perm_estoque,
                perm_usuarios=perm_usuarios,
                senha_temporaria=True
            )
            novo_funcionario.nivel_acesso = request.form.get('nivelAcesso')
            novo_funcionario.perm_acesso_total = bool(request.form.get('permAcessoTotal'))
            db.session.add(novo_funcionario)
            db.session.commit()
            print('Funcionário cadastrado com sucesso!', 'success')

        else:
            print('Erro ao identificar o tipo de usuário!', 'danger')

    return redirect(url_for('usuarios'))  # redireciona para a página de listagem

#Usado apenas pelo Backend -------------------------------------------------

@app.route('/deletar-livro/<int:id>', methods=['DELETE'])
def deletar_livro(id):
    livro = Livro.query.get_or_404(id)
    db.session.delete(livro)
    db.session.commit()
    return '', 204  # No content

@app.route('/buscar-cliente', methods=['GET'])
def buscar_cliente():
    cpf = request.args.get("cpf")
    
    if not cpf:
        return jsonify({"found": False})

    cliente = Cliente.query.filter_by(cpf=cpf).first()

    if not cliente:
        return jsonify({"found": False})

    # Multas pendentes
    multas = Servico.query.filter_by(idCliente=cliente.id, statusServico='Multa pendente').all()
    multa_por_dia = 2.00
    lista_multas = []
    valor_total_multa = 0.0

    for m in multas:
        dias_atraso = (date.today() - m.dataPrevistaDevolucao.date()).days if m.dataPrevistaDevolucao else 0
        valor_multa = dias_atraso * multa_por_dia if dias_atraso > 0 else 0.0
        valor_total_multa += valor_multa

        livro = Livro.query.get(m.idLivro)
        lista_multas.append({
            "motivo": "Atraso na devolução",
            "livro": livro.titulo if livro else "Desconhecido",
            "vencimento": m.dataPrevistaDevolucao.strftime("%d/%m/%Y") if m.dataPrevistaDevolucao else "",
            "data_devolucao": m.dataDevolucao.strftime("%d/%m/%Y") if m.dataDevolucao else "",
            "valor": f"R$ {valor_multa:.2f}"
        })

    # Empréstimos ativos
    emprestimos = Servico.query.filter_by(idCliente=cliente.id, statusServico='Ativo').all()
    lista_emprestimos = []

    for e in emprestimos:
        livro = Livro.query.get(e.idLivro)
        lista_emprestimos.append({
            "titulo": livro.titulo if livro else "Desconhecido",
            "autor": livro.autor if livro else "Autor desconhecido",
            "data_emprestimo": e.dataServico.strftime("%d/%m/%Y") if e.dataServico else "",
            "data_devolucao": e.dataPrevistaDevolucao.strftime("%d/%m") if e.dataPrevistaDevolucao else "",
            "status": "Atrasado" if (e.dataPrevistaDevolucao and date.today() > e.dataPrevistaDevolucao.date()) else "No prazo"
        })

    return jsonify({
        "found": True,
        "id": cliente.id,
        "nome": cliente.nome,
        "email": cliente.email,
        "cpf": cliente.cpf,
        "telefone": cliente.telefone,
        "status": cliente.statusCliente,
        "multas_pendentes": len(multas),
        "multa": valor_total_multa,
        "emprestimos": lista_emprestimos,
        "multas": lista_multas
    })

@app.route("/livros/<int:livro_id>")
def obter_livro(livro_id):
    livro = Livro.query.get(livro_id)
    return jsonify({
        "editora": livro.editora,
        "genero": livro.genero,
        "qtd_estoque": livro.qtdEstoque,
        "preco": livro.preco,
        "nota": livro.nota,
        "imgCapa": livro.imgCapa,
        "anoPublicacao": livro.anoPublicacao,
        "disponibilidade": livro.disponibilidade
    })

@app.route('/buscar-livros')
@login_required
def buscar_livros():
    query = request.args.get('query', '').strip()
    if not query:
        return jsonify({'livros': []})

    livros = Livro.query.filter(
        (Livro.titulo.ilike(f"%{query}%")) |
        (Livro.autor.ilike(f"%{query}%")) |
        (Livro.editora.ilike(f"%{query}%")) |
        (Livro.genero.ilike(f"%{query}%")) |
        (Livro.id == query)  # permite buscar por ID exato
    ).all()

    livros_json = []
    for livro in livros:
        livros_json.append({
            'id': livro.id,
            'titulo': livro.titulo,
            'autor': livro.autor,
            'editora': livro.editora,
            'genero': livro.genero,
            'anoPublicacao': livro.anoPublicacao,
            'disponibilidade': getattr(livro, 'disponibilidade', 1) if hasattr(livro, 'disponibilidade') else 1
        })

    return jsonify({'livros': livros_json})

@app.route('/atualizar-disponibilidade/<int:id>', methods=['POST'])
def atualizar_disponibilidade(id):
    livro = Livro.query.get_or_404(id)
    data = request.get_json()

    if data is None or 'disponibilidade' not in data:
        return jsonify({'success': False, 'error': 'Dados inválidos'}), 400

    disponibilidade = data.get('disponibilidade')
    livro.disponibilidade = bool(disponibilidade)

    db.session.commit()

    return jsonify({'success': True, 'disponibilidade': livro.disponibilidade})

@app.route('/editar-livro/<int:id>', methods=['POST'])
def editar_livro(id):
    livro = Livro.query.get_or_404(id)
    data = request.get_json()
    # Atualize os campos conforme enviados
    livro.titulo = data.get('titulo', livro.titulo)
    livro.autor = data.get('autor', livro.autor)
    livro.editora = data.get('editora', livro.editora)
    livro.genero = data.get('genero', livro.genero)
    livro.anoPublicacao = data.get('anoPublicacao', livro.anoPublicacao)
    livro.preco = data.get('preco', livro.preco)
    livro.nota = data.get('nota', livro.nota)
    livro.qtdEstoque = data.get('qtdEstoque', livro.qtdEstoque)
    livro.imgCapa = data.get('imgCapa', livro.imgCapa)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/devolver-servico/<int:servico_id>', methods=['POST'])
@login_required
def devolver_servico(servico_id):
    servico = Servico.query.get_or_404(servico_id)
    data_devolucao = datetime.now()
    servico.dataDevolucao = data_devolucao  # Certifique-se de ter esse campo no modelo

    multa_por_dia = 2.00  # Valor da multa por dia de atraso em R$

    if servico.dataPrevistaDevolucao and data_devolucao.date() > servico.dataPrevistaDevolucao.date():
        dias_atraso = (data_devolucao.date() - servico.dataPrevistaDevolucao.date()).days
        servico.multa = dias_atraso * multa_por_dia
        servico.statusServico = 'Multa pendente'
    else:
        servico.multa = 0.0
        servico.statusServico = 'Concluído'

    # Incrementa o estoque do livro devolvido
    livro = Livro.query.get(servico.idLivro)
    if livro:
        livro.qtdEstoque = int(livro.qtdEstoque) + 1
        db.session.add(livro)

    db.session.commit()

    return jsonify({
        'success': True,
        'status': servico.statusServico,
        'dataDevolucao': data_devolucao.strftime('%d/%m/%Y'),
        'multa': servico.multa
    })
    
@app.route('/editar-cliente/<int:id>', methods=['POST'])
@login_required
def editar_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    cliente.nome = request.form.get('nome')
    cliente.cpf = request.form.get('cpf')
    cliente.email = request.form.get('email')
    cliente.telefone = request.form.get('telefone')
    db.session.commit()
    flash('Cliente atualizado com sucesso!', 'success')
    return redirect(url_for('usuarios'))

@app.route('/alterar-status-cliente/<int:id>', methods=['POST'])
@login_required
def alterar_status_cliente(id):
    cliente = Cliente.query.get_or_404(id)
    novo_status = request.form.get('novoStatus')
    cliente.statusCliente = novo_status
    db.session.commit()
    flash('Status do cliente alterado!', 'success')
    return redirect(url_for('usuarios'))

@app.route('/editar-funcionario/<int:id>', methods=['POST'])
@login_required
def editar_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)

    nome = request.form.get('editarNomeFuncionario')
    email = request.form.get('editarEmailFuncionario')
    cargo = request.form.get('editarCargoFuncionario')
    nova_senha = request.form.get('editarSenhaFuncionario')

    print("Recebido:", nome, email, cargo, nova_senha)

    funcionario.nome = nome
    funcionario.email = email
    funcionario.cargo = cargo
    if nova_senha:
        funcionario.senha = hash(nova_senha)
        funcionario.senha_temporaria = True

    db.session.commit()
    flash('Funcionário atualizado com sucesso!', 'success')
    return redirect(url_for('usuarios'))

@app.route('/alterar-permissoes-funcionario/<int:id>', methods=['POST'])
@login_required
def alterar_permissoes_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)
    funcionario.perm_emprestimos = 'permEmprestimos' in request.form
    funcionario.perm_estoque = 'permEstoque' in request.form
    funcionario.perm_usuarios = 'permUsuarios' in request.form
    db.session.commit()
    flash('Permissões atualizadas!', 'success')
    return redirect(url_for('usuarios'))

@app.route('/alterar-status-funcionario/<int:id>', methods=['POST'])
@login_required
def alterar_status_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)
    novo_status = request.form.get('novoStatus')
    funcionario.statusFuncionario = novo_status
    db.session.commit()
    flash('Status do funcionário alterado!', 'success')
    return redirect(url_for('usuarios'))

@app.route('/api/permissoes-funcionario/<int:id>')
@login_required
def api_permissoes_funcionario(id):
    funcionario = Funcionario.query.get_or_404(id)
    return jsonify({
        "permEmprestimos": funcionario.perm_emprestimos,
        "permEstoque": funcionario.perm_estoque,
        "permUsuarios": funcionario.perm_usuarios,
        "acessoTotal": (
            funcionario.perm_emprestimos and
            funcionario.perm_estoque and
            funcionario.perm_usuarios
        )
    })

@app.route('/api/servico/<int:servico_id>')
@login_required
def api_servico(servico_id):
    servico = Servico.query.get_or_404(servico_id)
    livro = Livro.query.get(servico.idLivro)
    cliente = Cliente.query.get(servico.idCliente)
    return jsonify({
        "id": servico.id,
        "categoriaServico": servico.categoriaServico,
        "statusServico": servico.statusServico,
        "dataEmprestimo": servico.dataServico.strftime("%d/%m/%Y") if servico.dataServico else "",
        "dataDevolucao": servico.dataPrevistaDevolucao.strftime("%d/%m/%Y") if servico.dataPrevistaDevolucao else "",
        "dataDevolucaoReal": servico.dataDevolucao.strftime("%d/%m/%Y") if servico.dataDevolucao else "",
        "multa": servico.multa or 0.0,
        "motivoMulta": "Atraso na devolução" if servico.statusServico == "Multa pendente" else "",
        "livro": {
            "titulo": livro.titulo if livro else "",
            "capa": livro.imgCapa if livro and livro.imgCapa else "https://via.placeholder.com/60x90"
        },
        "cliente": {
            "nome": cliente.nome if cliente else "",
            "email": cliente.email if cliente else ""
        }
    })

@app.route('/renovar-servico/<int:servico_id>', methods=['POST'])
@login_required
def renovar_servico(servico_id):
    servico = Servico.query.get_or_404(servico_id)
    nova_data = request.json.get('novaDataDevolucao')
    if not nova_data:
        return jsonify({'success': False, 'error': 'Data não informada'}), 400
    try:
        from datetime import datetime
        servico.dataPrevistaDevolucao = datetime.strptime(nova_data, '%Y-%m-%d')
        # Não altera o status! Mantém como 'Ativo' ou o status atual
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/pagar-multa/<int:servico_id>', methods=['POST'])
@login_required
def pagar_multa(servico_id):
    servico = Servico.query.get_or_404(servico_id)
    servico.multa = 0
    servico.statusServico = 'Concluído'
    db.session.commit()
    return jsonify({'success': True})

@app.route('/trocar-senha', methods=['GET', 'POST'])
@login_required
def trocar_senha():
    if request.method == 'GET':
        return render_template('trocar_senha.html')
    elif request.method == 'POST':
        nova_senha = request.form.get('novaSenha')
        repetir_senha = request.form.get('repetirSenha')
        if nova_senha != repetir_senha:
            flash('As senhas não coincidem!', 'danger')
            return render_template('trocar_senha.html')
        current_user.senha = hash(nova_senha)
        current_user.senha_temporaria = False
        db.session.commit()
        flash('Senha alterada com sucesso!', 'success')
        return redirect(url_for('home'))

@app.template_filter('tempo_relativo')
def tempo_relativo(data):
    agora = datetime.now()
    diff = agora - data
    segundos = diff.total_seconds()
    if segundos < 60:
        return "agora mesmo"
    elif segundos < 3600:
        minutos = int(segundos // 60)
        return f"{minutos} minuto{'s' if minutos > 1 else ''} atrás"
    elif segundos < 86400:
        horas = int(segundos // 3600)
        return f"{horas} hora{'s' if horas > 1 else ''} atrás"
    else:
        dias = int(segundos // 86400)
        return f"{dias} dia{'s' if dias > 1 else ''} atrás"

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