import pytest
from main import app as flask_app
from db import db as _db

# Banco em memória ou temporário
flask_app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"  # ou outro db de teste
flask_app.config["TESTING"] = True
flask_app.config["LOGIN_DISABLED"] = False

@pytest.fixture(scope="session")
def app():
    with flask_app.app_context():
        _db.create_all()
        yield flask_app
        _db.drop_all()  # remove tudo após os testes

@pytest.fixture(scope="function", autouse=True)
def session(app):
    """Cria e limpa uma sessão de banco para cada teste."""
    connection = _db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = _db._make_scoped_session(options=options)

    _db.session = session

    yield session

    transaction.rollback()
    connection.close()
    session.remove()

@pytest.fixture
def client(app):
    return app.test_client()