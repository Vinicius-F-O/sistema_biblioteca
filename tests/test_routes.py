# tests/test_routes.py
def test_home_route(client):
    resposta = client.get('/')
    assert resposta.status_code == 302 or resposta.status_code == 200  # pode redirecionar sem login