import pytest

from internal.api import API


def test_add_client_records_a_notification(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"

    api.add_client(name="João")

    added_notification = fake_connection.session.add.call_args_list[1][0][0]
    assert added_notification.category == "Cliente"
    assert added_notification.status == "success"
    assert added_notification.tenant_id == "tenant-123"
    assert "João" in added_notification.message


def test_notification_message_names_the_employee_who_made_the_change(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"
    api.current_employee_name = "Pedro"

    api.add_client(name="João")

    added_notification = fake_connection.session.add.call_args_list[1][0][0]
    assert "Pedro" in added_notification.message


def test_notification_message_falls_back_to_sistema_without_an_employee_name(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"

    api.add_client(name="João")

    added_notification = fake_connection.session.add.call_args_list[1][0][0]
    assert "Sistema" in added_notification.message


def test_get_notifications(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)
    fake_connection.session.execute.return_value.scalars.return_value.all.return_value = []

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    result = api.get_notifications()

    assert result == []


def test_mark_notification_read(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_notification = mocker.MagicMock(notification_id="notif-1", tenant_id="tenant-123", is_read=False)
    fake_connection.session.get.return_value = fake_notification

    api.mark_notification_read("notif-1")

    assert fake_notification.is_read is True
    fake_connection.session.commit.assert_called_once()


def test_delete_notification(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_is_team_leader = True

    fake_notification = mocker.MagicMock(notification_id="notif-1", tenant_id="tenant-123")
    fake_connection.session.get.return_value = fake_notification

    result = api.delete_notification("notif-1")

    fake_connection.session.delete.assert_called_once_with(fake_notification)
    assert result is True


def test_delete_notification_denied_for_non_team_leader(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_is_team_leader = False

    fake_notification = mocker.MagicMock(notification_id="notif-1", tenant_id="tenant-123")
    fake_connection.session.get.return_value = fake_notification

    with pytest.raises(PermissionError):
        api.delete_notification("notif-1")

    fake_connection.session.delete.assert_not_called()


def test_get_current_employee(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"
    api.current_employee_name = "Pedro"
    api.current_employee_is_team_leader = True

    result = api.get_current_employee()

    assert result == {
        "employee_id": "employee-456",
        "name": "Pedro",
        "is_team_leader": True,
    }
