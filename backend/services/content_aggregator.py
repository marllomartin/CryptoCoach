# Content Aggregator
# Combines all lesson content from separate files

from typing import Dict, List, Optional

# Import all content modules
from services.trial_content_service import TRIAL_LESSONS, TRIAL_COURSES
from services.content_level1 import LEVEL1_LESSONS
from services.content_level1_part2 import LEVEL1_LESSONS_PART2
from services.content_level2 import LEVEL2_LESSONS
from services.content_level2_3 import LEVEL2_LESSONS_PART2, LEVEL3_LESSONS
from services.lesson_images import LESSON_IMAGES, get_lesson_images

# Merge all lessons into one dictionary
ALL_LESSONS = {
    **TRIAL_LESSONS,         # Trial lessons 1–2 (always free)
    **LEVEL1_LESSONS,        # Lessons 3–5
    **LEVEL1_LESSONS_PART2,  # Lessons 6–8
    **LEVEL2_LESSONS,        # Level 2 lessons 1–3
    **LEVEL2_LESSONS_PART2,  # Level 2 lessons 4–8
    **LEVEL3_LESSONS         # Level 3 lessons 1–7
}

def get_localized_lesson(lesson_id: str, language: str = "en") -> Optional[Dict]:
    """Get a lesson with content in the specified language"""
    if lesson_id not in ALL_LESSONS:
        return None

    lesson = ALL_LESSONS[lesson_id].copy()

    for field in ["title", "subtitle", "summary"]:
        if field in lesson and isinstance(lesson[field], dict):
            lesson[field] = lesson[field].get(language, lesson[field].get("en", ""))

    if "content" in lesson and isinstance(lesson["content"], dict):
        lesson["content"] = lesson["content"].get(language, lesson["content"].get("en", ""))

    for field in ["learning_objectives", "examples", "recommended_readings"]:
        if field in lesson and isinstance(lesson[field], dict):
            lesson[field] = lesson[field].get(language, lesson[field].get("en", []))

    if "checkpoints" in lesson:
        localized_checkpoints = []
        for cp in lesson["checkpoints"]:
            localized_cp = cp.copy()
            for field in ["question", "explanation"]:
                if field in localized_cp and isinstance(localized_cp[field], dict):
                    localized_cp[field] = localized_cp[field].get(language, localized_cp[field].get("en", ""))
            if "options" in localized_cp and isinstance(localized_cp["options"], dict):
                localized_cp["options"] = localized_cp["options"].get(language, localized_cp["options"].get("en", []))
            localized_checkpoints.append(localized_cp)
        lesson["checkpoints"] = localized_checkpoints

    # Add images
    images = get_lesson_images(lesson_id)
    lesson["hero_image"] = images.get("hero_image")
    lesson["infographics"] = images.get("infographics", [])

    return lesson

def get_localized_course(course_id: str, language: str = "en") -> Optional[Dict]:
    """Get a course with content in the specified language"""
    if course_id not in TRIAL_COURSES:
        return None

    course = TRIAL_COURSES[course_id].copy()

    for field in ["title", "description"]:
        if field in course and isinstance(course[field], dict):
            course[field] = course[field].get(language, course[field].get("en", ""))

    return course

def get_all_lessons_for_course(course_id: str, language: str = "en") -> List[Dict]:
    """Get all lessons for a course in the specified language"""
    lessons = []
    for lesson_id, lesson in ALL_LESSONS.items():
        if lesson.get("course_id") == course_id:
            localized = get_localized_lesson(lesson_id, language)
            if localized:
                lessons.append(localized)

    return sorted(lessons, key=lambda x: x.get("order", 0))

def get_content_stats() -> Dict:
    """Get statistics about all course content"""
    return {
        "total_courses": len(TRIAL_COURSES),
        "total_lessons": len(ALL_LESSONS),
        "lessons_with_images": len([l for l in LESSON_IMAGES.values() if l.get("hero_image")]),
        "languages_supported": ["en", "fr", "ar", "pt"],
        "courses": {
            "course-foundations": len([l for l in ALL_LESSONS.values() if l.get("course_id") == "course-foundations"]),
            "course-investor": len([l for l in ALL_LESSONS.values() if l.get("course_id") == "course-investor"]),
            "course-strategist": len([l for l in ALL_LESSONS.values() if l.get("course_id") == "course-strategist"])
        }
    }
