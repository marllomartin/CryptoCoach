# Lesson Images Mapping
# Generated premium images for all 23 lessons

LESSON_IMAGES = {
    # ==================== LEVEL 1: FOUNDATIONS ====================
    "course-foundations-lesson-1": {
        "hero_image": "/static/images/course-foundations-lesson-1_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-2": {
        "hero_image": "/static/images/course-foundations-lesson-2_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-3": {
        "hero_image": "/static/images/course-foundations-lesson-3_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-4": {
        "hero_image": "/static/images/course-foundations-lesson-4_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-5": {
        "hero_image": "/static/images/course-foundations-lesson-5_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-6": {
        "hero_image": "/static/images/course-foundations-lesson-6_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-7": {
        "hero_image": "/static/images/course-foundations-lesson-7_hero.png",
        "infographics": []
    },
    "course-foundations-lesson-8": {
        "hero_image": "/static/images/course-foundations-lesson-8_hero.png",
        "infographics": []
    },

    # ==================== LEVEL 2: INVESTOR ====================
    "course-investor-lesson-1": {
        "hero_image": "/static/images/course-investor-lesson-1_hero.png",
        "infographics": []
    },
    "course-investor-lesson-2": {
        "hero_image": "/static/images/course-investor-lesson-2_hero.png",
        "infographics": []
    },
    "course-investor-lesson-3": {
        "hero_image": "/static/images/course-investor-lesson-3_hero.png",
        "infographics": []
    },
    "course-investor-lesson-4": {
        "hero_image": "/static/images/course-investor-lesson-4_hero.png",
        "infographics": []
    },
    "course-investor-lesson-5": {
        "hero_image": "/static/images/course-investor-lesson-5_hero.png",
        "infographics": []
    },
    "course-investor-lesson-6": {
        "hero_image": "/static/images/course-investor-lesson-6_hero.png",
        "infographics": []
    },
    "course-investor-lesson-7": {
        "hero_image": "/static/images/course-investor-lesson-7_hero.png",
        "infographics": []
    },
    "course-investor-lesson-8": {
        "hero_image": "/static/images/course-investor-lesson-8_hero.png",
        "infographics": []
    },
    
    # ==================== LEVEL 3: STRATEGIST ====================
    "course-strategist-lesson-1": {
        "hero_image": "/static/images/course-strategist-lesson-1_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-2": {
        "hero_image": "/static/images/course-strategist-lesson-2_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-3": {
        "hero_image": "/static/images/course-strategist-lesson-3_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-4": {
        "hero_image": "/static/images/course-strategist-lesson-4_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-5": {
        "hero_image": "/static/images/course-strategist-lesson-5_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-6": {
        "hero_image": "/static/images/course-strategist-lesson-6_hero.png",
        "infographics": []
    },
    "course-strategist-lesson-7": {
        "hero_image": "/static/images/course-strategist-lesson-7_hero.png",
        "infographics": []
    }
}

def get_lesson_images(lesson_id: str) -> dict:
    """Get images for a specific lesson"""
    return LESSON_IMAGES.get(lesson_id, {"hero_image": None, "infographics": []})
