from db import db
from datetime import datetime

class Usuario(db.Model):
    __tablename__ = 'Usuarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    cargo = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f"<{self.nome}>"