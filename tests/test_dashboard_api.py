import sys

sys.path.append(".")

from datetime import date, datetime, timedelta

import pytest

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from internal.api import API
from internal.database import DatabaseConnection
from internal.models import Base, Client, Movement, Notification


@pytest.fixture
def api():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()

    instance = API.__new__(API)
    instance.db = DatabaseConnection(engine=engine, session=session)
    instance.current_employee_id = "employee-uuid"
    instance.current_tenant_id = "tenant-uuid"
    instance.current_employee_name = "Maria"
    instance.current_employee_is_team_leader = False
    return instance


def test_get_dashboard_summary(api):
    """End-to-end against a real (SQLite) engine, not mocks — this aggregation
    query mixes func.coalesce/func.date/date-range comparisons that only fail
    at the SQL-compilation level, which mocked sessions can't catch."""
    tenant_id = api.current_tenant_id
    today = date.today()
    start_of_this_month = today.replace(day=1)
    last_month_day = start_of_this_month - timedelta(days=5)

    def at(day):
        return datetime.combine(day, datetime.min.time())

    api.db.session.add_all([
        Client(client_id="c1", tenant_id=tenant_id, name="Old Client", create_at=at(last_month_day)),
        Client(client_id="c2", tenant_id=tenant_id, name="New Client", create_at=at(today)),

        Movement(movement_id="m1", tenant_id=tenant_id, sequence_number=1, type="income",
                 status="confirmed", title="Mensalidade", amount=100, create_at=at(today)),
        Movement(movement_id="m2", tenant_id=tenant_id, sequence_number=2, type="expense",
                 status="confirmed", title="Fornecedor", amount=30, create_at=at(today)),
        Movement(movement_id="m3", tenant_id=tenant_id, sequence_number=3, type="income",
                 status="pending", title="Pendente", amount=999, create_at=at(today)),
        Movement(movement_id="m4", tenant_id=tenant_id, sequence_number=4, type="income",
                 status="confirmed", title="Mensalidade antiga", amount=100, create_at=at(last_month_day)),
        Movement(movement_id="m5", tenant_id=tenant_id, sequence_number=5, type="expense",
                 status="confirmed", title="Fornecedor antigo", amount=60, create_at=at(last_month_day)),

        Notification(notification_id="n1", tenant_id=tenant_id, category="Cliente",
                     status="success", title="Cliente cadastrado", message="Cliente Old Client cadastrado."),
    ])
    api.db.session.commit()

    summary = api.get_dashboard_summary()

    assert summary["active_clients_count"] == 2
    assert summary["active_clients_change_percent"] == 100.0

    assert summary["income_amount"] == 100.0
    assert summary["income_change_percent"] == 0.0

    assert summary["expense_amount"] == 30.0
    assert summary["expense_change_percent"] == -50.0

    today_titles = {m["title"] for m in summary["today_movements"]}
    assert today_titles == {"Mensalidade", "Fornecedor"}

    assert summary["today_balance"] == 70.0
    assert len(summary["recent_notifications"]) == 1


def test_get_dashboard_summary_with_no_data(api):
    summary = api.get_dashboard_summary()

    assert summary["active_clients_count"] == 0
    assert summary["active_clients_change_percent"] is None
    assert summary["income_amount"] == 0.0
    assert summary["income_change_percent"] is None
    assert summary["today_movements"] == []
    assert summary["today_balance"] == 0.0
    assert summary["recent_notifications"] == []
