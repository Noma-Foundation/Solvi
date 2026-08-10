import sys
import pytest

sys.path.append(".")

from internal.models.employee import Employee, create_employee


def test_employee_dto():
    employee = Employee(
        id=1,
        name="Peter",
        is_admin=True
    )
    assert employee.id == 1
    assert employee.name == "Peter"
    assert employee.is_admin is True


def test_create_employee_function():
    employee = create_employee(1, "Paulo", True)

    assert isinstance(employee, Employee)
    assert employee.id == 1
    assert employee.name == "Paulo"
    assert employee.is_admin is True


def test_create_employee_function_with_invalid_data():
    with pytest.raises(TypeError):
        employee = create_employee("invalid_id", "Paulo", True)
        print(employee)
