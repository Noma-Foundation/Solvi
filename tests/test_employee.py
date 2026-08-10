import sys

sys.path.append(".")

from internal.models.employee import Employee


def test_employee_dto():
    employee = Employee(
        id=1,
        name="Peter",
        is_admin=True
    )
    assert employee.id == 1
    assert employee.name == "Peter"
    assert employee.is_admin is True
