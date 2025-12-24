from cs.platform.web import JsonAPI
from cs.platform.web.root import Internal
from cdb import sqlapi, auth


class PlantCodeAPI(JsonAPI):
    pass


@Internal.mount(app=PlantCodeAPI, path="plant_code")
def _mount_app():
    return PlantCodeAPI()


class PlantCodeHandler:
    def logic_for_api(self, filters=None):
        personal_no = auth.get_attribute('personalnummer')
        if not personal_no:
            return {"error": "No personalnummer found"}

        sql_plant_code = f"""
            SELECT plant_code 
            FROM angestellter 
            WHERE personalnummer = '{personal_no}'
        """
        res = sqlapi.RecordSet2(sql=sql_plant_code)

        if res and len(res) > 0:
            plant_code = res[0]["plant_code"]
        else:
            plant_code = "N/A"

        return {"plant_code": plant_code}


@PlantCodeAPI.path(model=PlantCodeHandler, path="")
def _path():
    return PlantCodeHandler()


@PlantCodeAPI.json(model=PlantCodeHandler)
def _json(model, request):
    filters = {}  # abhi ke liye empty
    return model.logic_for_api(filters)
 