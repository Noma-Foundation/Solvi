import datetime

import pytest

from internal.api import API


def test_add_task(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"

    due_date = datetime.date(2026, 8, 18)
    result = api.add_task(title="Ligar para cliente", due_date=due_date)

    added_task = fake_connection.session.add.call_args_list[0][0][0]
    assert added_task.title == "Ligar para cliente"
    assert added_task.due_date == due_date
    assert added_task.status == "todo"
    assert added_task.tenant_id == "tenant-123"
    assert added_task.employee_id == "employee-456"

    added_notification = fake_connection.session.add.call_args_list[1][0][0]
    assert added_notification.category == "Tarefa"

    assert result["title"] == "Ligar para cliente"


def test_add_task_rejects_invalid_status(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    with pytest.raises(ValueError):
        api.add_task(title="Invalid", due_date="2026-08-18", status="blocked")


def test_edit_task_moves_status(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_task = mocker.MagicMock(task_id="task-1", tenant_id="tenant-123", title="Ligar para cliente")
    fake_connection.session.get.return_value = fake_task
    # session.refresh() would normally reload server-computed columns (like
    # update_at) from the database; simulate that here since fake_task
    # otherwise keeps the raw func.now() clause assigned in edit_task.
    fake_connection.session.refresh.side_effect = (
        lambda task: setattr(task, "update_at", datetime.datetime(2026, 1, 1))
    )

    api.edit_task("task-1", status="doing")

    assert fake_task.status == "doing"


def test_delete_task(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_task = mocker.MagicMock(task_id="task-1", tenant_id="tenant-123", title="Ligar para cliente")
    fake_connection.session.get.return_value = fake_task

    result = api.delete_task("task-1")

    fake_connection.session.delete.assert_called_once_with(fake_task)
    assert result is True
