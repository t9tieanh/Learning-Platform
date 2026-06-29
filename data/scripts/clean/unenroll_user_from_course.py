"""Unenroll a user from a course (manual demo prep).

Mirrors the data left behind by the purchase saga and removes traces so:
- The user no longer appears enrolled (my courses, lesson access).
- Instructor/admin statistics reflect the removal (enrollments + completed orders).

Databases touched (by default):
- course_service (MySQL): lesson_progress, course_completion_certificates, enrollments
- sale_service (MySQL): order_items / orders / payments, cart_items
- assistant (Postgres via DB_CONNECTION_STRING): user_purchased_courses, lesson tests, chat
- notification-service (MongoDB): feedbacks

Usage:
    python scripts/clean/unenroll_user_from_course.py --dry-run
    python scripts/clean/unenroll_user_from_course.py --execute

    make unenroll-user ARGS="--dry-run"
    make unenroll-user ARGS="--execute"
"""

from __future__ import annotations

import argparse
import hashlib
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Sequence

import mysql.connector
from mysql.connector import MySQLConnection
from mysql.connector.cursor import MySQLCursor

SCRIPT_ROOT = Path(__file__).resolve().parents[1]
if str(SCRIPT_ROOT) not in sys.path:
    sys.path.insert(0, str(SCRIPT_ROOT))

from utils import load_env

data_dir = SCRIPT_ROOT.parent
load_env([data_dir / '.env'])

MYSQL_HOST = os.getenv('DB_HOST', 'localhost')
MYSQL_USER = os.getenv('DB_USER', 'root')
MYSQL_PASSWORD = os.getenv('DB_PASSWORD', '')
MYSQL_PORT = int(os.getenv('DB_PORT', 3306))
COURSE_DB_NAME = 'course_service'
SALE_DB_NAME = 'sale_service'

DB_CONNECTION_STRING = os.getenv('DB_CONNECTION_STRING', '')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'learning_platform')

# TODO: thay bằng user id / course id thật trước khi chạy
TARGET_USER_ID = 'f6331da5-64dd-4328-93c5-b834ccde7e26'
TARGET_COURSE_ID = '087e22fc-5346-4681-b6aa-89da7ec53723'

PG_BIGINT_MAX = 0x7FFFFFFFFFFFFFFF


@dataclass
class CleanupPlan:
    enrollment_id: Optional[str] = None
    lesson_progress_ids: List[str] = field(default_factory=list)
    certificate_ids: List[str] = field(default_factory=list)
    order_ids: List[str] = field(default_factory=list)
    order_item_ids: List[str] = field(default_factory=list)
    payment_ids: List[str] = field(default_factory=list)
    empty_order_ids: List[str] = field(default_factory=list)
    cart_item_ids: List[str] = field(default_factory=list)
    lesson_ids: List[str] = field(default_factory=list)
    feedback_count: int = 0
    assistant_rows: Dict[str, int] = field(default_factory=dict)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description='Remove a user enrollment and related purchase/learning traces for demo prep.'
    )
    parser.add_argument('--user-id', default=TARGET_USER_ID, help='Student user UUID')
    parser.add_argument('--course-id', default=TARGET_COURSE_ID, help='Course UUID')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview affected rows without writing (default mode)',
    )
    parser.add_argument(
        '--execute',
        action='store_true',
        help='Apply deletions/updates (required to mutate data)',
    )
    parser.add_argument(
        '--skip-sale',
        action='store_true',
        help='Skip sale_service cleanup (orders/revenue will remain)',
    )
    parser.add_argument(
        '--skip-assistant',
        action='store_true',
        help='Skip assistant Postgres cleanup',
    )
    parser.add_argument(
        '--skip-mongo',
        action='store_true',
        help='Skip MongoDB feedback cleanup',
    )
    parser.add_argument(
        '--sale-mode',
        choices=('cancel', 'delete-items'),
        default='cancel',
        help=(
            'cancel: set matching orders to Cancel (safe, matches saga rollback semantics); '
            'delete-items: remove order_items and empty orders'
        ),
    )
    return parser.parse_args()


def connect_mysql(database: str) -> MySQLConnection:
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        port=MYSQL_PORT,
        database=database,
        autocommit=True,
    )
    return conn


def table_exists(cursor: MySQLCursor, table_name: str) -> bool:
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = %s
        """,
        (table_name,),
    )
    return bool(cursor.fetchone()[0])


def resolve_table(cursor: MySQLCursor, candidates: Sequence[str]) -> Optional[str]:
    cursor.execute("SHOW TABLES")
    existing = {row[0].lower(): row[0] for row in cursor.fetchall()}
    for candidate in candidates:
        resolved = existing.get(candidate.lower())
        if resolved:
            return resolved
    return None


@dataclass(frozen=True)
class SaleTables:
    orders: str
    order_items: str
    payments: Optional[str]
    carts: Optional[str]
    cart_items: Optional[str]


def resolve_sale_tables(cursor: MySQLCursor) -> SaleTables:
    orders = resolve_table(cursor, ('orders', 'Order'))
    order_items = resolve_table(cursor, ('order_items', 'Order_Item'))
    if not orders or not order_items:
        raise RuntimeError('Could not resolve sale order tables (orders/Order, order_items/Order_Item)')
    payments = resolve_table(cursor, ('payments', 'Payment'))
    carts = resolve_table(cursor, ('carts', 'Cart'))
    cart_items = resolve_table(cursor, ('cart_items', 'Cart_Item'))
    return SaleTables(
        orders=orders,
        order_items=order_items,
        payments=payments,
        carts=carts,
        cart_items=cart_items,
    )


def purchased_course_id(user_id: str, course_id: str) -> str:
    digest = hashlib.sha256(f'{user_id}\0{course_id}'.encode()).digest()[:8]
    value = int.from_bytes(digest, 'big') & PG_BIGINT_MAX
    return str(value)


def fetch_lesson_ids(course_cursor: MySQLCursor, course_id: str) -> List[str]:
    course_cursor.execute(
        """
        SELECT l.id
        FROM lessons l
        INNER JOIN chapters ch ON ch.id = l.chapter_id
        WHERE ch.course_id = %s
        """,
        (course_id,),
    )
    return [row[0] for row in course_cursor.fetchall()]


def inspect_course_db(course_cursor: MySQLCursor, user_id: str, course_id: str) -> CleanupPlan:
    plan = CleanupPlan()

    course_cursor.execute(
        """
        SELECT id FROM enrollments
        WHERE user_id = %s AND course_id = %s
        LIMIT 1
        """,
        (user_id, course_id),
    )
    row = course_cursor.fetchone()
    if not row:
        return plan

    plan.enrollment_id = row[0]
    plan.lesson_ids = fetch_lesson_ids(course_cursor, course_id)

    course_cursor.execute(
        "SELECT id FROM lesson_progress WHERE enrollment_id = %s",
        (plan.enrollment_id,),
    )
    plan.lesson_progress_ids = [r[0] for r in course_cursor.fetchall()]

    if table_exists(course_cursor, 'course_completion_certificates'):
        course_cursor.execute(
            "SELECT id FROM course_completion_certificates WHERE enrollment_id = %s",
            (plan.enrollment_id,),
        )
        plan.certificate_ids = [r[0] for r in course_cursor.fetchall()]

    return plan


def inspect_sale_db(
    sale_cursor: MySQLCursor,
    tables: SaleTables,
    user_id: str,
    course_id: str,
) -> CleanupPlan:
    plan = CleanupPlan()

    sale_cursor.execute(
        f"""
        SELECT o.id, oi.id
        FROM `{tables.orders}` o
        INNER JOIN `{tables.order_items}` oi ON oi.order_id = o.id
        WHERE o.user_id = %s AND oi.course_id = %s
        """,
        (user_id, course_id),
    )
    rows = sale_cursor.fetchall()
    plan.order_ids = sorted({r[0] for r in rows})
    plan.order_item_ids = [r[1] for r in rows]

    if tables.payments and plan.order_ids:
        placeholders = ','.join(['%s'] * len(plan.order_ids))
        sale_cursor.execute(
            f"SELECT id, order_id FROM `{tables.payments}` WHERE order_id IN ({placeholders})",
            tuple(plan.order_ids),
        )
        plan.payment_ids = [r[0] for r in sale_cursor.fetchall()]

    for order_id in plan.order_ids:
        sale_cursor.execute(
            f"SELECT COUNT(*) FROM `{tables.order_items}` WHERE order_id = %s",
            (order_id,),
        )
        total_items = sale_cursor.fetchone()[0]
        sale_cursor.execute(
            f"""
            SELECT COUNT(*)
            FROM `{tables.order_items}` oi
            WHERE oi.order_id = %s AND oi.course_id = %s
            """,
            (order_id, course_id),
        )
        matching_items = sale_cursor.fetchone()[0]
        if total_items == matching_items:
            plan.empty_order_ids.append(order_id)

    if tables.carts and tables.cart_items:
        sale_cursor.execute(
            f"""
            SELECT ci.id
            FROM `{tables.cart_items}` ci
            INNER JOIN `{tables.carts}` c ON c.id = ci.cart_id
            WHERE c.user_id = %s AND ci.course_id = %s
            """,
            (user_id, course_id),
        )
        plan.cart_item_ids = [r[0] for r in sale_cursor.fetchall()]

    return plan


def inspect_mongo(user_id: str, course_id: str) -> int:
    try:
        from pymongo import MongoClient
    except ImportError:
        print('Warning: pymongo not installed; skipping MongoDB inspection.')
        return 0

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[MONGO_DB_NAME]
    return db['feedbacks'].count_documents({'userId': user_id, 'courseId': course_id})


def inspect_assistant(user_id: str, course_id: str, lesson_ids: Sequence[str]) -> Dict[str, int]:
    if not DB_CONNECTION_STRING:
        return {}

    try:
        import psycopg2
    except ImportError:
        print('Warning: psycopg2 not installed; skipping assistant inspection.')
        return {}

    counts: Dict[str, int] = {}
    with psycopg2.connect(DB_CONNECTION_STRING) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) FROM public.user_purchased_courses
                WHERE user_id = %s AND course_id = %s
                """,
                (user_id, course_id),
            )
            counts['user_purchased_courses'] = cur.fetchone()[0]

            if not lesson_ids:
                return counts

            cur.execute(
                """
                SELECT COUNT(*) FROM lesson_test_submissions
                WHERE user_id = %s AND lesson_id = ANY(%s)
                """,
                (user_id, list(lesson_ids)),
            )
            counts['lesson_test_submissions'] = cur.fetchone()[0]

            cur.execute(
                """
                SELECT COUNT(*) FROM lesson_chat_sessions
                WHERE user_id = %s AND lesson_id = ANY(%s)
                """,
                (user_id, list(lesson_ids)),
            )
            counts['lesson_chat_sessions'] = cur.fetchone()[0]

    return counts


def print_plan(
    plan: CleanupPlan,
    sale_plan: CleanupPlan,
    *,
    skip_sale: bool,
    skip_assistant: bool,
    skip_mongo: bool,
    sale_mode: str,
) -> None:
    print('\n=== Cleanup plan ===')
    print(f"Enrollment: {plan.enrollment_id or '(not found)'}")
    print(f"Lesson progress rows: {len(plan.lesson_progress_ids)}")
    print(f"Completion certificates: {len(plan.certificate_ids)}")
    print(f"Lessons in course: {len(plan.lesson_ids)}")

    if not skip_sale:
        print('\n--- sale_service ---')
        print(f"Order items ({sale_mode}): {len(sale_plan.order_item_ids)}")
        print(f"Affected orders: {len(sale_plan.order_ids)}")
        print(f"Payments: {len(sale_plan.payment_ids)}")
        print(f"Orders to remove if empty: {len(sale_plan.empty_order_ids)}")
        print(f"Cart items: {len(sale_plan.cart_item_ids)}")
    else:
        print('\n--- sale_service: skipped ---')

    if not skip_assistant:
        print('\n--- assistant (Postgres) ---')
        if plan.assistant_rows:
            for key, value in plan.assistant_rows.items():
                print(f'{key}: {value}')
        elif not DB_CONNECTION_STRING:
            print('DB_CONNECTION_STRING not set; skipped')
        else:
            print('(no assistant rows)')
    else:
        print('\n--- assistant: skipped ---')

    if not skip_mongo:
        print(f'\n--- MongoDB feedbacks: {plan.feedback_count} ---')
    else:
        print('\n--- MongoDB: skipped ---')


def apply_course_cleanup(course_cursor: MySQLCursor, plan: CleanupPlan) -> None:
    if not plan.enrollment_id:
        print('No enrollment found in course_service; nothing to delete.')
        return

    if plan.lesson_progress_ids:
        placeholders = ','.join(['%s'] * len(plan.lesson_progress_ids))
        course_cursor.execute(
            f'DELETE FROM lesson_progress WHERE id IN ({placeholders})',
            tuple(plan.lesson_progress_ids),
        )
        print(f'Deleted {course_cursor.rowcount} lesson_progress row(s).')

    if plan.certificate_ids and table_exists(course_cursor, 'course_completion_certificates'):
        placeholders = ','.join(['%s'] * len(plan.certificate_ids))
        course_cursor.execute(
            f'DELETE FROM course_completion_certificates WHERE id IN ({placeholders})',
            tuple(plan.certificate_ids),
        )
        print(f'Deleted {course_cursor.rowcount} course_completion_certificates row(s).')

    course_cursor.execute(
        'DELETE FROM enrollments WHERE id = %s',
        (plan.enrollment_id,),
    )
    print(f'Deleted {course_cursor.rowcount} enrollment row(s).')


def apply_sale_cleanup(
    sale_cursor: MySQLCursor,
    tables: SaleTables,
    sale_plan: CleanupPlan,
    sale_mode: str,
) -> None:
    if sale_mode == 'cancel' and sale_plan.order_ids:
        placeholders = ','.join(['%s'] * len(sale_plan.order_ids))
        sale_cursor.execute(
            f"UPDATE `{tables.orders}` SET status = 'Cancel' WHERE id IN ({placeholders})",
            tuple(sale_plan.order_ids),
        )
        print(f"Cancelled {sale_cursor.rowcount} order(s).")
    elif sale_mode == 'delete-items':
        if sale_plan.order_item_ids:
            placeholders = ','.join(['%s'] * len(sale_plan.order_item_ids))
            sale_cursor.execute(
                f'DELETE FROM `{tables.order_items}` WHERE id IN ({placeholders})',
                tuple(sale_plan.order_item_ids),
            )
            print(f'Deleted {sale_cursor.rowcount} order_item(s).')

        if tables.payments and sale_plan.empty_order_ids:
            placeholders = ','.join(['%s'] * len(sale_plan.empty_order_ids))
            sale_cursor.execute(
                f'DELETE FROM `{tables.payments}` WHERE order_id IN ({placeholders})',
                tuple(sale_plan.empty_order_ids),
            )
            print(f'Deleted {sale_cursor.rowcount} payment(s).')

        if sale_plan.empty_order_ids:
            placeholders = ','.join(['%s'] * len(sale_plan.empty_order_ids))
            sale_cursor.execute(
                f'DELETE FROM `{tables.orders}` WHERE id IN ({placeholders})',
                tuple(sale_plan.empty_order_ids),
            )
            print(f'Deleted {sale_cursor.rowcount} empty order(s).')

    if tables.carts and tables.cart_items and sale_plan.cart_item_ids:
        placeholders = ','.join(['%s'] * len(sale_plan.cart_item_ids))
        sale_cursor.execute(
            f'DELETE FROM `{tables.cart_items}` WHERE id IN ({placeholders})',
            tuple(sale_plan.cart_item_ids),
        )
        print(f'Deleted {sale_cursor.rowcount} cart_item(s).')


def apply_assistant_cleanup(user_id: str, course_id: str, lesson_ids: Sequence[str]) -> None:
    import psycopg2

    with psycopg2.connect(DB_CONNECTION_STRING) as conn:
        with conn.cursor() as cur:
            if lesson_ids:
                cur.execute(
                    """
                    DELETE FROM lesson_test_submission_answers
                    WHERE submission_id IN (
                        SELECT id FROM lesson_test_submissions
                        WHERE user_id = %s AND lesson_id = ANY(%s)
                    )
                    """,
                    (user_id, list(lesson_ids)),
                )
                print(f'Deleted {cur.rowcount} lesson_test_submission_answers row(s).')

                cur.execute(
                    """
                    DELETE FROM lesson_test_submissions
                    WHERE user_id = %s AND lesson_id = ANY(%s)
                    """,
                    (user_id, list(lesson_ids)),
                )
                print(f'Deleted {cur.rowcount} lesson_test_submissions row(s).')

                cur.execute(
                    """
                    DELETE FROM lesson_chat_messages
                    WHERE session_id IN (
                        SELECT id FROM lesson_chat_sessions
                        WHERE user_id = %s AND lesson_id = ANY(%s)
                    )
                    """,
                    (user_id, list(lesson_ids)),
                )
                print(f'Deleted {cur.rowcount} lesson_chat_messages row(s).')

                cur.execute(
                    """
                    DELETE FROM lesson_chat_sessions
                    WHERE user_id = %s AND lesson_id = ANY(%s)
                    """,
                    (user_id, list(lesson_ids)),
                )
                print(f'Deleted {cur.rowcount} lesson_chat_sessions row(s).')

            cur.execute(
                """
                DELETE FROM public.user_purchased_courses
                WHERE user_id = %s AND course_id = %s
                """,
                (user_id, course_id),
            )
            print(f'Deleted {cur.rowcount} user_purchased_courses row(s).')

            # Fallback by deterministic id (same hash as assistant-service)
            cur.execute(
                'DELETE FROM public.user_purchased_courses WHERE id = %s::bigint',
                (purchased_course_id(user_id, course_id),),
            )
            if cur.rowcount:
                print(f'Deleted {cur.rowcount} user_purchased_courses row(s) by hashed id.')

        conn.commit()


def apply_mongo_cleanup(user_id: str, course_id: str) -> None:
    from pymongo import MongoClient

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    result = client[MONGO_DB_NAME]['feedbacks'].delete_many(
        {'userId': user_id, 'courseId': course_id}
    )
    print(f'Deleted {result.deleted_count} feedback document(s).')


def main() -> None:
    args = parse_args()
    if args.execute and args.dry_run:
        print('Error: use either --dry-run or --execute, not both.')
        sys.exit(1)
    if not args.execute:
        args.dry_run = True

    user_id = args.user_id.strip()
    course_id = args.course_id.strip()
    if not user_id or not course_id:
        print('Error: user id and course id must not be empty.')
        sys.exit(1)

    print(f'Target user : {user_id}')
    print(f'Target course: {course_id}')
    print(f'Mode        : {"DRY RUN" if args.dry_run else "EXECUTE"}')

    plan = CleanupPlan()
    sale_plan = CleanupPlan()

    course_conn: Optional[MySQLConnection] = None
    sale_conn: Optional[MySQLConnection] = None

    try:
        course_conn = connect_mysql(COURSE_DB_NAME)
        course_cursor = course_conn.cursor()
        plan = inspect_course_db(course_cursor, user_id, course_id)

        if not args.skip_sale:
            sale_conn = connect_mysql(SALE_DB_NAME)
            sale_cursor = sale_conn.cursor()
            sale_tables = resolve_sale_tables(sale_cursor)
            sale_plan = inspect_sale_db(sale_cursor, sale_tables, user_id, course_id)
        else:
            sale_tables = None

        if not args.skip_mongo:
            plan.feedback_count = inspect_mongo(user_id, course_id)

        if not args.skip_assistant:
            plan.assistant_rows = inspect_assistant(user_id, course_id, plan.lesson_ids)

        print_plan(
            plan,
            sale_plan,
            skip_sale=args.skip_sale,
            skip_assistant=args.skip_assistant,
            skip_mongo=args.skip_mongo,
            sale_mode=args.sale_mode,
        )

        if not plan.enrollment_id and not sale_plan.order_ids and plan.feedback_count == 0:
            print('\nNothing found for this user/course pair.')
            return

        if args.dry_run:
            print('\nDry run complete. Re-run with --execute to apply changes.')
            return

        print('\n=== Applying cleanup ===')

        course_conn.autocommit = False
        try:
            apply_course_cleanup(course_cursor, plan)
            course_conn.commit()
            print('course_service: committed.')
        finally:
            course_conn.autocommit = True

        if not args.skip_sale and sale_tables is not None:
            sale_conn.autocommit = False
            try:
                apply_sale_cleanup(sale_cursor, sale_tables, sale_plan, args.sale_mode)
                sale_conn.commit()
                print('sale_service: committed.')
            finally:
                sale_conn.autocommit = True

        if not args.skip_assistant and DB_CONNECTION_STRING:
            apply_assistant_cleanup(user_id, course_id, plan.lesson_ids)
            print('assistant: committed.')

        if not args.skip_mongo and plan.feedback_count:
            apply_mongo_cleanup(user_id, course_id)

        print('\nDone. Refresh statistics UI after ~1 minute (Redis cache TTL).')

    except mysql.connector.Error as err:
        print(f'MySQL error: {err}')
        if course_conn:
            course_conn.rollback()
        if sale_conn:
            sale_conn.rollback()
        sys.exit(1)
    except Exception as err:
        print(f'Error: {err}')
        if course_conn:
            course_conn.rollback()
        if sale_conn:
            sale_conn.rollback()
        sys.exit(1)
    finally:
        if course_conn and course_conn.is_connected():
            course_conn.close()
        if sale_conn and sale_conn.is_connected():
            sale_conn.close()


if __name__ == '__main__':
    main()
