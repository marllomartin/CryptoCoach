#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TheCryptoCoachAPITester:
    def __init__(self, base_url="https://broker-briefing.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        print(f"🚀 Testing TheCryptoCoach.io API at: {base_url}")
        print("=" * 60)

    def run_test(self, name, method, endpoint, expected_status, data=None, auth=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 [{self.tests_run}] Testing {name}...")
        print(f"   {method} {endpoint}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"   ✅ PASS - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   📄 Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        keys = list(response_data.keys())[:3]
                        print(f"   📄 Response keys: {keys}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                self.tests_passed += 0
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                print(f"   ❌ FAIL - {error_msg}")
                try:
                    error_detail = response.json().get('detail', 'No error detail')
                    print(f"   📄 Error: {error_detail}")
                except:
                    print(f"   📄 Response: {response.text[:200]}...")
                
                self.failed_tests.append({
                    'test': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': error_msg
                })
                return False, {}

        except Exception as e:
            print(f"   ❌ FAIL - Exception: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'endpoint': endpoint,
                'error': f"Exception: {str(e)}"
            })
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 AUTHENTICATION TESTS")
        
        # Test registration with unique email
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_{timestamp}@example.com"
        test_password = "TestPass123!"
        test_name = f"Test User {timestamp}"
        
        # Register new user
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "full_name": test_name
            },
            auth=False
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            print(f"   🎯 Registered user: {self.user_data.get('email')}")
        
        # Test login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": test_email,
                "password": test_password
            },
            auth=False
        )
        
        # Test get current user
        if self.token:
            self.run_test(
                "Get Current User",
                "GET", 
                "auth/me",
                200,
                auth=True
            )

    def test_courses_api(self):
        """Test courses and lessons"""
        print("\n📚 COURSES & LESSONS TESTS")
        
        # Get all courses
        success, courses = self.run_test(
            "Get All Courses",
            "GET",
            "courses",
            200,
            auth=False
        )
        
        if success and courses:
            course = courses[0]
            course_id = course.get('id')
            
            # Test individual course
            self.run_test(
                "Get Single Course",
                "GET",
                f"courses/{course_id}",
                200,
                auth=False
            )
            
            # Test course lessons
            success, lessons = self.run_test(
                "Get Course Lessons",
                "GET",
                f"courses/{course_id}/lessons",
                200,
                auth=False
            )
            
            if success and lessons:
                lesson = lessons[0]
                lesson_id = lesson.get('id')
                
                # Test individual lesson
                self.run_test(
                    "Get Single Lesson",
                    "GET",
                    f"lessons/{lesson_id}",
                    200,
                    auth=False
                )
                
                # Test lesson completion (requires auth)
                if self.token:
                    self.run_test(
                        "Complete Lesson",
                        "POST",
                        f"lessons/{lesson_id}/complete",
                        200,
                        auth=True
                    )

    def test_quiz_api(self):
        """Test quiz functionality"""
        print("\n🧠 QUIZ TESTS")
        
        # This assumes we have courses available
        if self.token:
            # Get courses first
            success, courses = self.run_test(
                "Get Courses for Quiz Test",
                "GET",
                "courses",
                200,
                auth=False
            )
            
            if success and courses:
                course = courses[0]
                course_id = course.get('id')
                
                # Get lessons for quiz
                success, lessons = self.run_test(
                    "Get Lessons for Quiz Test",
                    "GET",
                    f"courses/{course_id}/lessons",
                    200,
                    auth=False
                )
                
                if success and lessons:
                    lesson = lessons[0]
                    lesson_id = lesson.get('id')
                    
                    # Get quiz for lesson
                    success, quiz = self.run_test(
                        "Get Lesson Quiz",
                        "GET",
                        f"lessons/{lesson_id}/quiz",
                        200,
                        auth=True
                    )
                    
                    if success and quiz and 'questions' in quiz:
                        quiz_id = quiz.get('id')
                        questions = quiz.get('questions', [])
                        
                        # Submit quiz with sample answers
                        if questions:
                            answers = {}
                            for q in questions[:2]:  # Test with first 2 questions
                                answers[q['id']] = q['correct_answer']
                            
                            self.run_test(
                                "Submit Quiz",
                                "POST",
                                "quizzes/submit",
                                200,
                                data={
                                    "quiz_id": quiz_id,
                                    "answers": answers
                                },
                                auth=True
                            )

    def test_other_endpoints(self):
        """Test various other endpoints"""
        print("\n🌟 OTHER ENDPOINT TESTS")
        
        # Glossary
        self.run_test(
            "Get Glossary",
            "GET",
            "glossary",
            200,
            auth=False
        )
        
        # Blog
        self.run_test(
            "Get Blog Posts",
            "GET",
            "blog",
            200,
            auth=False
        )
        
        # Leaderboard
        self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200,
            auth=False
        )
        
        # Trading simulator
        self.run_test(
            "Get Crypto Prices",
            "GET",
            "simulator/prices",
            200,
            auth=False
        )
        
        if self.token:
            # Portfolio
            self.run_test(
                "Get Portfolio",
                "GET",
                "simulator/portfolio",
                200,
                auth=True
            )
            
            # Execute a small trade
            self.run_test(
                "Execute Trade",
                "POST",
                "simulator/trade",
                200,
                data={
                    "symbol": "BTC",
                    "action": "buy",
                    "amount": 0.001,
                    "price": 100000.0
                },
                auth=True
            )
        
        # Contact form
        self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data={
                "name": "Test User",
                "email": "test@example.com",
                "subject": "API Test",
                "message": "This is a test message from the API testing script."
            },
            auth=False
        )

    def test_ai_mentor(self):
        """Test AI mentor functionality"""
        print("\n🤖 AI MENTOR TESTS")
        
        if self.token:
            self.run_test(
                "AI Chat Message",
                "POST",
                "ai/chat",
                200,
                data={
                    "message": "What is Bitcoin?",
                    "session_id": "test_session"
                },
                auth=True
            )

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS ({len(self.failed_tests)}):")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"  {i}. {test['test']}")
                print(f"     Endpoint: {test['endpoint']}")
                print(f"     Error: {test['error']}")
        else:
            print("\n🎉 ALL TESTS PASSED!")
        
        print("\n" + "=" * 60)
        return len(self.failed_tests) == 0

def main():
    tester = TheCryptoCoachAPITester()
    
    try:
        # Run all test suites
        tester.test_auth_flow()
        tester.test_courses_api() 
        tester.test_quiz_api()
        tester.test_other_endpoints()
        tester.test_ai_mentor()
        
        # Print summary
        all_passed = tester.print_summary()
        
        return 0 if all_passed else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())