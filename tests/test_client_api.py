from internal.api import API


def test_add_client(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"
    api.current_employee_id = "employee-456"

    result = api.add_client(name="João", email="joao@example.com")

    fake_connection.session.add.assert_called_once()
    fake_connection.session.commit.assert_called_once()
    fake_connection.session.refresh.assert_called_once()

    added_client = fake_connection.session.add.call_args[0][0]
    assert added_client.name == "João"
    assert added_client.email == "joao@example.com"
    assert added_client.tenant_id == "tenant-123"
    assert added_client.employee_id == "employee-456"

    assert result["name"] == "João"
    assert result["email"] == "joao@example.com"
    assert result["tenant_id"] == "tenant-123"


def test_delete_client(mocker):
    fake_connection = mocker.MagicMock()
    mocker.patch("internal.api.open_connection", return_value=fake_connection)

    api = API(database=mocker.MagicMock(), dbconfig=mocker.MagicMock())
    api.current_tenant_id = "tenant-123"

    fake_client = mocker.MagicMock(client_id="client-1", tenant_id="tenant-123")
    fake_connection.session.get.return_value = fake_client

    result = api.delete_client("client-1")

    fake_connection.session.delete.assert_called_once_with(fake_client)
    fake_connection.session.commit.assert_called_once()
    assert result is True
