from dataclasses import dataclass

@dataclass
class Customer:
    id: int
    name: str
    email: str
    status: str = "pending"
    status_label: str = "Pendente"
    aulas: str = "-"
    valor_pago: str = "-"
    telefone: str = "-"
    responsavel: str = "-"
    cargo: str = "-"
    endereco: str = "-"
    cidade_uf: str = "-"
    plano: str = "-"
    inicio: str = "-"
    renovacao: str = "-"
    documento: str = "-"
    observacoes: str = "-"
