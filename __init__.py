from cdb.objects import ViewObject
from cdb.objects import Object
from . import hr_machining_skills




class SkillMatrix(ViewObject):
    __classname__ = "hr_labour_master"
    __maps_to__ = "hr_labour_master"
    
class Skill(Object):
    __classname__ = "kln_hr_skill"
    __maps_to__ = "kln_hr_skill"
    
    
class Category(Object):
    __classname__ = "kln_hr_category"
    __maps_to__ = "kln_hr_category"
    
    
class Department(Object):
    __classname__ = "kln_hr_department"
    __maps_to__ = "kln_hr_department"
    
    
class Line(Object):
    __classname__ = "kln_hr_line"
    __maps_to__ = "kln_hr_line"
    
class MachiningSkills(Object):
    __classname__ = "hr_machining_skills"
    __maps_to__ = "hr_machining_skills"
    
class TrainingSchedule(ViewObject):
 __classname__ = "hr_training_schedule"
 __maps_to__ = "hr_training_schedule"
 
 
class HrTest(ViewObject):
 __classname__ = "hr_tests"
 __maps_to__ = "hr_tests"
 
class HrQuestions(ViewObject):
 __classname__ = "hr_questions"
 __maps_to__ = "hr_questions"
 
class HrOptions(ViewObject):
 __classname__ = "hr_options"
 __maps_to__ = "hr_options"
 
class HrUserAnswers(ViewObject):
 __classname__ = "hr_user_answers"
 __maps_to__ = "hr_user_answers"
 
class HrTestAttempts(ViewObject):
 __classname__ = "hr_test_attempts"
 __maps_to__ = "hr_test_attempts"