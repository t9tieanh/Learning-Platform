"""Seed lesson test submissions for certificate / eligibility testing.

Creates passing submissions for (total published lesson tests in a course - 1),
leaving exactly one lesson test without a passing submission for the given user.

Usage:
    python seed_lesson_test_submissions.py
    python seed_lesson_test_submissions.py --skip-lesson-id <lesson_id>
    python seed_lesson_test_submissions.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Sequence, Tuple

import mysql.connector
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'utils'))
try:
    from env_loader import load_env
    load_env()
except ImportError:
    from dotenv import load_dotenv
    load_dotenv()

MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
MYSQL_USER = os.getenv('DB_USER', 'root')
MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
MYSQL_PORT = int(os.getenv('DB_PORT', 3306))
MYSQL_DATABASE = 'course_service'

DB_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')

# TODO: thay bằng user id / course id thật trước khi chạy
TARGET_USER_ID = 'fc0851ea-3cd8-473a-8983-ac5e04020e18'
TARGET_COURSE_ID = 'fecf42f2-c022-49cb-9b06-cebc0766a9a2'

GRADABLE_TYPES = ('MULTIPLE_CHOICE', 'TRUE_FALSE')
DEFAULT_MIN_PASS_PERCENT = 50.0


@dataclass(frozen=True)
class CourseLesson:
    lesson_id: str
    title: str
    chapter_position: int
    lesson_position: int


@dataclass(frozen=True)
class GradableQuiz:
    quiz_id: str
    group_created_at: datetime
    quiz_created_at: datetime


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            'Seed passing lesson test submissions for all but one published test in a course.'
        )
    )
    parser.add_argument(
        '--skip-lesson-id',
        help='Lesson id to leave without a passing submission (default: last test in course order)',
    )
    parser.add_argument(
        '--min-pass-percent',
        type=float,
        default=DEFAULT_MIN_PASS_PERCENT,
        help=f'Minimum percent to count as passed (default: {DEFAULT_MIN_PASS_PERCENT})',
    )
    parser.add_argument(
        '--replace',
        action='store_true',
        default=True,
        help='Replace existing submissions for this user on seeded lessons (default: true)',
    )
    parser.add_argument(
        '--no-replace',
        action='store_false',
        dest='replace',
        help='Keep existing submissions and skip lessons that already pass',
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Print planned actions without writing to Supabase',
    )
    return parser.parse_args()


def get_course_lessons(course_id: str) -> List[CourseLesson]:
    conn = None
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT,
            database=MYSQL_DATABASE,
        )
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT l.id AS lesson_id,
                   l.title,
                   c.position AS chapter_position,
                   l.position AS lesson_position
            FROM lessons l
            JOIN chapters c ON l.chapter_id = c.id
            WHERE c.course_id = %s
              AND (l.deleted = 0 OR l.deleted IS NULL)
            ORDER BY c.position ASC, l.position ASC, l.title ASC
            """,
            (course_id,),
        )
        rows = cur.fetchall()
        return [
            CourseLesson(
                lesson_id=row['lesson_id'],
                title=row['title'] or '',
                chapter_position=int(row['chapter_position'] or 0),
                lesson_position=int(row['lesson_position'] or 0),
            )
            for row in rows
        ]
    finally:
        if conn:
            conn.close()


def fetch_published_test_lesson_ids(cur, lesson_ids: Sequence[str]) -> List[str]:
    if not lesson_ids:
        return []

    cur.execute(
        """
        SELECT lt.lesson_id
        FROM lesson_tests lt
        WHERE lt.lesson_id = ANY(%s)
          AND lt.status::text = 'PUBLISHED'
        ORDER BY lt.lesson_id
        """,
        (list(lesson_ids),),
    )
    return [row['lesson_id'] for row in cur.fetchall()]


def fetch_gradable_quizzes(cur, lesson_id: str) -> List[GradableQuiz]:
    cur.execute(
        """
        SELECT q.id AS quiz_id,
               g.created_at AS group_created_at,
               q."createdAt" AS quiz_created_at
        FROM quizzes q
        JOIN lesson_test_chunk_groups g
          ON g.id = q."lesson_test_chunk_group_id"
        WHERE g.lesson_id = %s
          AND q.quiz_scope::text = 'LESSON_TEST'
          AND q.type::text = ANY(%s)
          AND q.status::text = 'ACTIVE'
          AND q."lesson_test_chunk_group_id" IS NOT NULL
        ORDER BY g.created_at ASC, q."createdAt" ASC
        """,
        (lesson_id, list(GRADABLE_TYPES)),
    )
    return [
        GradableQuiz(
            quiz_id=row['quiz_id'],
            group_created_at=row['group_created_at'],
            quiz_created_at=row['quiz_created_at'],
        )
        for row in cur.fetchall()
    ]


def fetch_correct_choice_ids(cur, quiz_id: str) -> List[str]:
    cur.execute(
        """
        SELECT id
        FROM quiz_choices
        WHERE "quizId" = %s
          AND "isCorrect" = TRUE
        ORDER BY "order" ASC
        """,
        (quiz_id,),
    )
    return [row['id'] for row in cur.fetchall()]


def fetch_best_percent(cur, lesson_id: str, user_id: str) -> Optional[float]:
    cur.execute(
        """
        SELECT percent
        FROM lesson_test_submissions
        WHERE lesson_id = %s
          AND user_id = %s
        ORDER BY percent DESC, created_at DESC
        LIMIT 1
        """,
        (lesson_id, user_id),
    )
    row = cur.fetchone()
    return float(row['percent']) if row else None


def delete_user_submissions_for_lesson(cur, lesson_id: str, user_id: str) -> int:
    cur.execute(
        """
        DELETE FROM lesson_test_submissions
        WHERE lesson_id = %s
          AND user_id = %s
        """,
        (lesson_id, user_id),
    )
    return cur.rowcount


def insert_passing_submission(
    cur,
    *,
    lesson_id: str,
    user_id: str,
    quizzes: Sequence[GradableQuiz],
    min_pass_percent: float,
) -> Tuple[str, float, int, int]:
    answer_rows: List[Tuple[str, List[str], bool, float]] = []
    earned_points = 0

    for quiz in quizzes:
        correct_choice_ids = fetch_correct_choice_ids(cur, quiz.quiz_id)
        if not correct_choice_ids:
            raise ValueError(
                f'Quiz {quiz.quiz_id} in lesson {lesson_id} has no correct choice configured'
            )

        answer_rows.append((quiz.quiz_id, correct_choice_ids, True, 1.0))
        earned_points += 1

    max_points = len(quizzes)
    percent = round((earned_points / max_points) * 10000) / 100 if max_points > 0 else 0.0

    if percent < min_pass_percent:
        raise ValueError(
            f'Computed percent {percent} is below min pass {min_pass_percent} for lesson {lesson_id}'
        )

    submission_id = str(uuid.uuid4())
    now = datetime.utcnow()

    cur.execute(
        """
        INSERT INTO lesson_test_submissions
            (id, lesson_id, user_id, earned_points, max_points, percent, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (submission_id, lesson_id, user_id, float(earned_points), max_points, percent, now),
    )

    for quiz_id, selected_choice_ids, is_correct, points_earned in answer_rows:
        cur.execute(
            """
            INSERT INTO lesson_test_submission_answers
                (id, submission_id, quiz_id, selected_choice_ids, is_correct, points_earned)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                str(uuid.uuid4()),
                submission_id,
                quiz_id,
                json.dumps(selected_choice_ids),
                is_correct,
                points_earned,
            ),
        )

    return submission_id, percent, earned_points, max_points


def resolve_lessons_with_tests(
    cur,
    course_lessons: Sequence[CourseLesson],
) -> List[CourseLesson]:
    lesson_ids = [lesson.lesson_id for lesson in course_lessons]
    published_ids = set(fetch_published_test_lesson_ids(cur, lesson_ids))

    lessons_with_tests: List[CourseLesson] = []
    for lesson in course_lessons:
        if lesson.lesson_id not in published_ids:
            continue
        quizzes = fetch_gradable_quizzes(cur, lesson.lesson_id)
        if not quizzes:
            continue
        lessons_with_tests.append(lesson)

    return lessons_with_tests


def choose_skip_lesson(
    lessons_with_tests: Sequence[CourseLesson],
    skip_lesson_id: Optional[str],
) -> CourseLesson:
    if not lessons_with_tests:
        raise ValueError('No published lesson tests with gradable quizzes found for this course')

    if skip_lesson_id:
        for lesson in lessons_with_tests:
            if lesson.lesson_id == skip_lesson_id:
                return lesson
        known_ids = ', '.join(lesson.lesson_id for lesson in lessons_with_tests)
        raise ValueError(
            f'--skip-lesson-id {skip_lesson_id} is not a published test lesson. Known: {known_ids}'
        )

    return lessons_with_tests[-1]


def seed_submissions(args: argparse.Namespace) -> None:
    if not DB_CONNECTION_STRING:
        print('Error: DB_CONNECTION_STRING not found in environment.')
        sys.exit(1)

    print(f'Loading lessons for course {TARGET_COURSE_ID}...')
    course_lessons = get_course_lessons(TARGET_COURSE_ID)
    if not course_lessons:
        print(f'No lessons found for course {TARGET_COURSE_ID}.')
        sys.exit(1)

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        lessons_with_tests = resolve_lessons_with_tests(cur, course_lessons)
        total_tests = len(lessons_with_tests)
        if total_tests == 0:
            print('No published lesson tests with gradable quizzes found in Supabase for this course.')
            sys.exit(1)

        skip_lesson = choose_skip_lesson(lessons_with_tests, args.skip_lesson_id)
        seed_targets = [lesson for lesson in lessons_with_tests if lesson.lesson_id != skip_lesson.lesson_id]

        print(f'Course lessons: {len(course_lessons)}')
        print(f'Published lesson tests (gradable): {total_tests}')
        print(f'Will seed passing submissions: {len(seed_targets)} (= total - 1)')
        print(f'Will skip (no passing submission): {skip_lesson.lesson_id} — {skip_lesson.title}')

        if args.dry_run:
            print('\nDry run — no database writes.')
            for lesson in seed_targets:
                quizzes = fetch_gradable_quizzes(cur, lesson.lesson_id)
                print(
                    f'  [seed] {lesson.lesson_id} | {lesson.title} | '
                    f'{len(quizzes)} question(s) -> 100%'
                )
            print(f'  [skip] {skip_lesson.lesson_id} | {skip_lesson.title}')
            return

        seeded = 0
        skipped_existing = 0

        for lesson in seed_targets:
            quizzes = fetch_gradable_quizzes(cur, lesson.lesson_id)
            if not quizzes:
                print(f'⚠️  Skipping {lesson.lesson_id}: no gradable quizzes')
                continue

            if args.replace:
                deleted = delete_user_submissions_for_lesson(cur, lesson.lesson_id, TARGET_USER_ID)
                if deleted:
                    print(f'  Removed {deleted} existing submission(s) for lesson {lesson.lesson_id}')
            else:
                best_percent = fetch_best_percent(cur, lesson.lesson_id, TARGET_USER_ID)
                if best_percent is not None and best_percent >= args.min_pass_percent:
                    print(
                        f'  Skipping {lesson.lesson_id}: already passed '
                        f'({best_percent}% >= {args.min_pass_percent}%)'
                    )
                    skipped_existing += 1
                    continue

            submission_id, percent, earned, maximum = insert_passing_submission(
                cur,
                lesson_id=lesson.lesson_id,
                user_id=TARGET_USER_ID,
                quizzes=quizzes,
                min_pass_percent=args.min_pass_percent,
            )
            seeded += 1
            print(
                f'✅ Seeded {lesson.lesson_id} | {lesson.title} | '
                f'submission={submission_id} | {earned}/{maximum} ({percent}%)'
            )

        conn.commit()
        print('\n--- Summary ---')
        print(f'User: {TARGET_USER_ID}')
        print(f'Course: {TARGET_COURSE_ID}')
        print(f'Total tests: {total_tests}')
        print(f'Seeded passing submissions: {seeded}')
        print(f'Skipped (already passed): {skipped_existing}')
        print(f'Left without passing submission: {skip_lesson.lesson_id}')

    except Exception as exc:
        if conn:
            conn.rollback()
        print(f'❌ Error: {exc}')
        sys.exit(1)
    finally:
        if conn:
            conn.close()


def main() -> None:
    args = parse_args()
    seed_submissions(args)


if __name__ == '__main__':
    main()
