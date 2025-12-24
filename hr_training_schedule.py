from cs.platform.web import JsonAPI
from cs.platform.web.root import Internal
from cdb import sqlapi
from datetime import datetime, date
import json


class TrainingScheduleAPI(JsonAPI):
    pass


@Internal.mount(app=TrainingScheduleAPI, path="hr_training_schedule")
def _mount_app():
    return TrainingScheduleAPI()


class TrainingScheduleData:
    """Handles training schedule CRUD operations"""

    # 🔹 GET → Fetch all scheduled trainings with filters (SIMPLIFIED)
    def get_training_schedules(self, filters=None):
        filters = filters or {}
        skill_id = filters.get('skill_id')
        employee_id = filters.get('employee_id')
        date_from = filters.get('date_from')
        date_to = filters.get('date_to')

        # ✅ SIMPLIFIED SQL - Only essential columns that exist in table
        sql = """
            SELECT
                cdb_object_id,
                training_id,
                skill_id,
                skill_name,
                skill_code,
                skill_type,
                employee_ids,
                employee_names,
                training_date,
                training_day,
                training_time,
                duration_hours,
                trainer_name,
                notes
            FROM hr_training_schedule
            WHERE 1=1
        """

        if skill_id:
            sql += f" AND skill_id = {skill_id}"
        if employee_id:
            sql += f" AND employee_ids LIKE '%{employee_id}%'"
        if date_from:
            sql += f" AND training_date >= '{date_from}'"
        if date_to:
            sql += f" AND training_date <= '{date_to}'"

        sql += " ORDER BY training_date ASC"

        try:
            rs = sqlapi.RecordSet2(sql=sql)
            print(f"📋 SQL Query: {sql}")
            print(f"✅ Found {len(rs)} records")

            def serialize(row):
                result = {}
                for key, value in row.items():
                    if isinstance(value, (datetime, date)):
                        result[key] = value.isoformat()
                    else:
                        result[key] = value
                
                # ✅ Add default values for columns that don't exist in table
                if 'status' not in result:
                    result['status'] = 'Scheduled'
                if 'scheduled_by' not in result:
                    result['scheduled_by'] = 'Admin'
                if 'scheduled_at' not in result:
                    result['scheduled_at'] = datetime.now().isoformat()
                if 'created_date' not in result:
                    result['created_date'] = datetime.now().isoformat()
                if 'modified_date' not in result:
                    result['modified_date'] = datetime.now().isoformat()
                    
                return result

            return [serialize(row) for row in rs]
            
        except Exception as e:
            print(f"❌ Error fetching training schedules: {e}")
            return []

    # 🔹 POST → Create new training schedule (SIMPLIFIED)
    def create_training_schedule(self, data):
        """Create new training schedule records"""
        
        # Check if data is a list (multiple records) or single object
        if not isinstance(data, list):
            data = [data]

        created_count = 0
        created_ids = []
        
        for obj in data:
            try:
                training_id = obj.get("training_id", f"TRN_{int(datetime.now().timestamp())}")
                skill_id = obj.get("skill_id")
                skill_name = obj.get("skill_name")
                skill_code = obj.get("skill_code")
                skill_type = obj.get("skill_type")
                employee_ids = json.dumps(obj.get("employee_ids", []))
                employee_names = json.dumps(obj.get("employee_names", []))
                training_date = obj.get("training_date")
                training_day = obj.get("training_day")
                training_time = obj.get("training_time", "09:00")
                duration_hours = obj.get("duration_hours", 8)
                trainer_name = obj.get("trainer_name")
                notes = obj.get("notes", "")

                print(f"📝 Creating training schedule: {skill_name} on {training_date}")

                # Convert date format from DD/MM/YYYY to YYYY-MM-DD
                date_parts = training_date.split("/")
                db_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

                # ✅ SIMPLIFIED INSERT - Only columns that exist in table
                r_new = sqlapi.Record(
                    "hr_training_schedule",
                    training_id=training_id,
                    skill_id=skill_id,
                    skill_name=skill_name,
                    skill_code=skill_code,
                    skill_type=skill_type,
                    employee_ids=employee_ids,
                    employee_names=employee_names,
                    training_date=db_date,
                    training_day=training_day,
                    training_time=training_time,
                    duration_hours=duration_hours,
                    trainer_name=trainer_name,
                    notes=notes
                )
                r_new.insert()
                created_count += 1
                created_ids.append(training_id)
                print(f"✅ Training schedule created: {training_id}")
                
            except Exception as e:
                print(f"❌ Error creating training schedule: {e}")
                return {
                    "status": "error",
                    "message": f"Failed to create training schedule: {str(e)}"
                }

        return {
            "status": "success", 
            "message": f"Successfully created {created_count} training schedule record(s)",
            "training_ids": created_ids
        }

    # 🔹 PUT → Update existing training schedule (SIMPLIFIED)
    def update_training_schedule(self, data):
        """Update existing training schedule record"""
        
        cdb_object_id = data.get('cdb_object_id')
        
        if not cdb_object_id:
            return {"status": "error", "message": "cdb_object_id is required for update"}

        try:
            # Get existing record
            r = sqlapi.Record("hr_training_schedule", cdb_object_id=cdb_object_id)
            
            # Update only provided fields
            if "training_id" in data:
                r["training_id"] = data["training_id"]
            if "skill_id" in data:
                r["skill_id"] = data["skill_id"]
            if "skill_name" in data:
                r["skill_name"] = data["skill_name"]
            if "skill_code" in data:
                r["skill_code"] = data["skill_code"]
            if "skill_type" in data:
                r["skill_type"] = data["skill_type"]
            if "employee_ids" in data:
                r["employee_ids"] = json.dumps(data["employee_ids"])
            if "employee_names" in data:
                r["employee_names"] = json.dumps(data["employee_names"])
            if "training_date" in data:
                # Convert date format
                date_parts = data["training_date"].split("/")
                r["training_date"] = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"
            if "training_day" in data:
                r["training_day"] = data["training_day"]
            if "training_time" in data:
                r["training_time"] = data["training_time"]
            if "duration_hours" in data:
                r["duration_hours"] = data["duration_hours"]
            if "trainer_name" in data:
                r["trainer_name"] = data["trainer_name"]
            if "notes" in data:
                r["notes"] = data["notes"]
            
            r.update()
            print(f"✅ Training schedule updated: {cdb_object_id}")

            return {"status": "success", "message": "Training schedule updated successfully"}
            
        except Exception as e:
            print(f"❌ Error updating training schedule: {e}")
            return {
                "status": "error",
                "message": f"Failed to update training schedule: {str(e)}"
            }

    # 🔹 DELETE → Delete training schedule record
    def delete_training_schedule(self, data):
        """Delete training schedule record by cdb_object_id"""
        
        cdb_object_id = data.get('cdb_object_id')
        
        if not cdb_object_id:
            return {"status": "error", "message": "cdb_object_id is required for delete"}

        try:
            r = sqlapi.Record("hr_training_schedule", cdb_object_id=cdb_object_id)
            r.delete()
            print(f"✅ Training schedule deleted: {cdb_object_id}")
            
            return {"status": "success", "message": "Training schedule deleted successfully"}
            
        except Exception as e:
            print(f"❌ Error deleting training schedule: {e}")
            return {
                "status": "error",
                "message": f"Failed to delete training schedule: {str(e)}"
            }


# 🔗 Path Mapping
@TrainingScheduleAPI.path(model=TrainingScheduleData, path="")
def _path():
    return TrainingScheduleData()


# 🔹 GET → Fetch training schedules with optional filters
@TrainingScheduleAPI.json(model=TrainingScheduleData, request_method="GET")
def _get_json(model, request):
    filters = {}
    skill_id = request.params.get('skill_id')
    employee_id = request.params.get('employee_id')
    date_from = request.params.get('date_from')
    date_to = request.params.get('date_to')

    if skill_id:
        filters['skill_id'] = skill_id
    if employee_id:
        filters['employee_id'] = employee_id
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to

    print(f"📥 GET request with filters: {filters}")
    return model.get_training_schedules(filters)


# 🔹 POST → Create new training schedules
@TrainingScheduleAPI.json(model=TrainingScheduleData, request_method="POST")
def _post_json(model, request):
    incoming_data = request.json
    print("📥 Incoming POST data:")
    print(f"   Records count: {len(incoming_data) if isinstance(incoming_data, list) else 1}")
    if isinstance(incoming_data, list) and len(incoming_data) > 0:
        print(f"   First record: {incoming_data[0]}")
    elif not isinstance(incoming_data, list):
        print(f"   Single record: {incoming_data}")
    return model.create_training_schedule(data=incoming_data)


# 🔹 PUT → Update existing training schedule
@TrainingScheduleAPI.json(model=TrainingScheduleData, request_method="PUT")
def _put_json(model, request):
    incoming_data = request.json
    print("📥 Incoming PUT data:")
    print(incoming_data)
    return model.update_training_schedule(data=incoming_data)


# 🔹 PATCH → Update existing training schedule (same as PUT)
@TrainingScheduleAPI.json(model=TrainingScheduleData, request_method="PATCH")
def _patch_json(model, request):
    incoming_data = request.json
    print("📥 Incoming PATCH data:")
    print(incoming_data)
    return model.update_training_schedule(data=incoming_data)


# 🔹 DELETE → Delete training schedule
@TrainingScheduleAPI.json(model=TrainingScheduleData, request_method="DELETE")
def _delete_json(model, request):
    incoming_data = request.json
    print("📥 Incoming DELETE data:")
    print(incoming_data)
    return model.delete_training_schedule(data=incoming_data)