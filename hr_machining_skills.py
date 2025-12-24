from cs.platform.web import JsonAPI
from cs.platform.web.root import Internal
from cdb import sqlapi
from datetime import datetime, date


class MachiningSkillsAPI(JsonAPI):
    pass


@Internal.mount(app=MachiningSkillsAPI, path="hr_machining_skills")
def _mount_app():
    return MachiningSkillsAPI()


class MachiningSkillsData:
    """Handles machining skills CRUD operations"""

    # 🔹 GET → Fetch all skills or with filters
    def get_skills_data(self, filters=None):
        filters = filters or {}
        skill_type = filters.get('skill_type')
        department = filters.get('department')
        plantt_code = filters.get('plantt_code')

        sql = """
            SELECT
                cdb_object_id,
                machining_skills_names,
                f_c_g,
                person_name,
                skill_required,
                actual,
                liness,
                department,
                plantt_code
            FROM hr_machining_skills
            WHERE 1=1
        """

        if skill_type:
            sql += f" AND f_c_g = '{skill_type}'"
        if department:
            sql += f" AND department = '{department}'"
        if plantt_code:
            sql += f" AND plantt_code = {plantt_code}"

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
            return result

        return [serialize(row) for row in rs]

    # 🔹 POST → Create single or multiple skills
    def create_skills(self, data):
        """Create new skill records"""
        
        # Check if data is a list (multiple records) or single object
        if not isinstance(data, list):
            data = [data]

        created_count = 0
        for obj in data:
            try:
                machining_skills_names = obj.get("machining_skills_names")
                f_c_g = obj.get("f_c_g", "G")
                department = obj.get("department", "All")
                education = obj.get("education", "")
                person_name = obj.get("person_name", "")
                skill_required = obj.get("skill_required", 1)
                actual = obj.get("actual", 0)
                liness = obj.get("liness", "")
                department = obj.get("department", "")
                plantt_code = obj.get("plantt_code", 2021)

                print(f"📝 Creating skill: {machining_skills_names} for {person_name}")

                r_new = sqlapi.Record(
                    "hr_machining_skills",
                    machining_skills_names=machining_skills_names,
                    f_c_g=f_c_g,
                    department=department,
                    education=education,
                    person_name=person_name,
                    skill_required=skill_required,
                    actual=actual,
                    liness=liness,
                    plantt_code=plantt_code
                )
                r_new.insert()
                created_count += 1
                print(f"✅ Skill created: {machining_skills_names}")
                
            except Exception as e:
                print(f"❌ Error creating skill: {e}")
                raise

        return {
            "status": "success", 
            "message": f"Successfully created {created_count} skill records"
        }

    # 🔹 PUT/PATCH → Update existing skill
    def update_skill(self, data):
        """Update existing skill record"""
        
        # Check if this is a delete operation
        is_delete = data.get('is_delete', False)
        if is_delete:
            return self.delete_skill(data)

        cdb_object_id = data.get('cdb_object_id')
        
        if not cdb_object_id:
            return {"status": "error", "message": "cdb_object_id is required for update"}

        machining_skills_names = data.get("machining_skills_names")
        f_c_g = data.get("f_c_g")
        education = data.get("education")
        person_name = data.get("person_name")
        skill_required = data.get("skill_required", 1)
        actual = data.get("actual", 0)
        liness = data.get("liness")
        department = data.get("department")
        plantt_code = data.get("plantt_code", 2021)

        update_query = f"""
            UPDATE hr_machining_skills
               SET machining_skills_names = '{machining_skills_names}',
                   f_c_g = '{f_c_g}',
                   person_name = '{person_name}',
                   skill_required = {skill_required},
                   actual = {actual},
                   liness = '{liness}',
                   department = '{department}',
                   plantt_code = {plantt_code}
             WHERE cdb_object_id = '{cdb_object_id}'
        """

        print("📝 Update Query:")
        print(update_query)

        result = sqlapi.SQL(update_query)
        print(f"✅ Query executed, affected rows: {result}")

        return {"status": "success", "message": "Skill updated successfully"}

    # 🔹 DELETE → Delete skill record
    def delete_skill(self, data):
        """Delete skill record by cdb_object_id"""
        
        cdb_object_id = data.get('cdb_object_id')
        
        if not cdb_object_id:
            return {"status": "error", "message": "cdb_object_id is required for delete"}

        delete_query = f"""
            DELETE FROM hr_machining_skills
             WHERE cdb_object_id = '{cdb_object_id}'
        """

        print("🗑️ Delete Query:")
        print(delete_query)

        sqlapi.SQL(delete_query)
        
        return {"status": "success", "message": "Skill deleted successfully"}


# 🔗 Path Mapping
@MachiningSkillsAPI.path(model=MachiningSkillsData, path="")
def _path():
    return MachiningSkillsData()


# 🔹 GET → Fetch skills with optional filters
@MachiningSkillsAPI.json(model=MachiningSkillsData, request_method="GET")
def _get_json(model, request):
    filters = {}
    skill_type = request.params.get('skill_type')
    department = request.params.get('department')
    plantt_code = request.params.get('plantt_code')

    if skill_type:
        filters['skill_type'] = skill_type
    if department:
        filters['department'] = department
    if plantt_code:
        filters['plantt_code'] = plantt_code

    return model.get_skills_data(filters)


# 🔹 POST → Create new skills
@MachiningSkillsAPI.json(model=MachiningSkillsData, request_method="POST")
def _post_json(model, request):
    incoming_data = request.json
    print("📥 Incoming POST data:")
    print(f"   Records count: {len(incoming_data) if isinstance(incoming_data, list) else 1}")
    if isinstance(incoming_data, list) and len(incoming_data) > 0:
        print(f"   First record: {incoming_data[0]}")
    return model.create_skills(data=incoming_data)


# 🔹 PUT → Update existing skill
@MachiningSkillsAPI.json(model=MachiningSkillsData, request_method="PUT")
def _put_json(model, request):
    incoming_data = request.json
    print("📥 Incoming PUT data:")
    print(incoming_data)
    return model.update_skill(data=incoming_data)


@MachiningSkillsAPI.json(model=MachiningSkillsData, request_method="PATCH")
def _patch_json(model, request):
    incoming_data = request.json
    print("📥 Incoming PATCH data:")
    print(incoming_data)
    return model.update_skill(data=incoming_data)
