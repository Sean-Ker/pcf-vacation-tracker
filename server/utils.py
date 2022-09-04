from db import db


def get_user_by_id(id: int, find_managed_employees: bool = False):
    user = db.users.find_one({"_id": id}, {"pwd": 0})
    if not user:
        return None
    user["department"] = db.departments.find_one({"_id": user.get("department_id", None)})
    user["manager"] = db.users.find_one({"_id": user.get("manager_id", None)})
    if find_managed_employees:
        user["employees"] = list(db.users.find({"manager_id": user.get("_id", None)}))
    return user


# class LeaveRequestObject:
#     def __init__(self, leave_request_id, user_id, company_id, **kwargs):
#         self.leave_request_id = leave_request_id
#         self.user_id = user_id

#         self.status = kwargs.get("status", LeaveStatus.CANCELLED)
#         leave_type_id = kwargs.get("leave_type")
#         self.leave_type = db.leave_types.find_one({"company_id": company_id, "_id": ObjectId(leave_type_id)})
#         if not self.leave_type:
#             raise Exception(f"Leave type {leave_type_id} not found")
#         self.start_date = kwargs.get("start_date", datetime.now())
#         self.end_date = kwargs.get("end_date", datetime.now())
#         self.reason = kwargs.get("reason", None)
#         self.extra_days = kwargs.get("extra_days", None)
#         self.extra_days_paid = kwargs.get("extra_days_paid", None)
#         self.response = kwargs.get("response", None)
#         self.response_by = kwargs.get("response_by")
#         self.response_date = kwargs.get("response_date")

#         if self.leave_type["reason_required"] and not self.reason:
#             raise ValueError("Reason is required")
#         if (
#             self.leave_type["reason_required"]
#             and self.status in [LeaveStatus.APPROVED, LeaveStatus.REJECTED]
#             and not self.response
#         ):
#             raise ValueError("Response is required")
#         # leave_duration = (self.end_date - self.start_date).days
#         # if leave_duration < 0:
#         #     raise ValueError("Start date must be before end date")

#     def to_json(self):
#         return json.dumps(self, default=json_util.default)

#     def __dict__(self):
#         return self.to_json().__dict__

#     def __repr__(self) -> str:
#         return f"<LeaveRequestObject {self.leave_type['name']} {self.start_date} {self.end_date}>"
