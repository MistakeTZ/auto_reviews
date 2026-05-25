import argparse
import json
from pathlib import Path

from database import SessionLocal, engine
from models import Base, User, Rule, Review


FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def load_combined_fixture(fixtures_dir: Path):
    payload = load_json(fixtures_dir / "sample_data.json")
    return {
        "users": payload.get("users", []),
        "rules": payload.get("rules", []),
        "reviews": payload.get("reviews", []),
    }


def load_split_fixtures(fixtures_dir: Path):
    return {
        "users": load_json(fixtures_dir / "users.json"),
        "rules": load_json(fixtures_dir / "rules.json"),
        "reviews": load_json(fixtures_dir / "reviews.json"),
    }


def truncate_tables(db):
    db.query(Review).delete()
    db.query(Rule).delete()
    db.query(User).delete()
    db.commit()


def upsert_fixtures(db, payload):
    users = payload.get("users", [])
    rules = payload.get("rules", [])
    reviews = payload.get("reviews", [])

    for user in users:
        db.merge(User(**user))

    for rule in rules:
        db.merge(Rule(**rule))

    for review in reviews:
        db.merge(Review(**review))

    db.commit()
    return len(users), len(rules), len(reviews)


def parse_args():
    parser = argparse.ArgumentParser(description="Load backend JSON fixtures into the database")
    parser.add_argument(
        "--mode",
        choices=["combined", "split"],
        default="combined",
        help="combined: use sample_data.json, split: use users.json/rules.json/reviews.json",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Delete existing users/rules/reviews before loading fixtures",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    Base.metadata.create_all(bind=engine)

    if args.mode == "combined":
        payload = load_combined_fixture(FIXTURES_DIR)
    else:
        payload = load_split_fixtures(FIXTURES_DIR)

    db = SessionLocal()
    try:
        if args.truncate:
            truncate_tables(db)

        users_count, rules_count, reviews_count = upsert_fixtures(db, payload)
    finally:
        db.close()

    print(
        f"Fixtures loaded: users={users_count}, rules={rules_count}, reviews={reviews_count}, mode={args.mode}"
    )


if __name__ == "__main__":
    main()
