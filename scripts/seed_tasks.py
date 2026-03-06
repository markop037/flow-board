"""
Seed the database with 15 realistic sample tasks.
Run from project root: python -m scripts.seed_tasks
Requires: database configured and migrations applied.
"""
import sys
from pathlib import Path

# Ensure app is importable
root = Path(__file__).resolve().parent.parent
if str(root) not in sys.path:
    sys.path.insert(0, str(root))

from app.db.session import SessionLocal
from app.db.models.task import TaskStatus, TaskPriority
from app.services import task as task_service
from app.schemas.task import TaskCreate

SAMPLE_TASKS: list[dict] = [
    {
        "title": "Review Q4 budget proposal",
        "description": "Go through finance spreadsheet and flag any line items that need discussion with the team.",
        "status": TaskStatus.IN_PROGRESS,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Schedule client kickoff for Acme Corp",
        "description": "Send calendar invite and prep deck for the new Acme Corp onboarding call.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Update API documentation",
        "description": "Add examples for the new /v2 webhooks endpoint and refresh auth section.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Fix login redirect on mobile",
        "description": "Users report being sent to 404 after login on Safari iOS. Check redirect URL logic.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Prepare slides for all-hands",
        "description": "Quarterly update: metrics, roadmap highlights, and team wins. Due Thursday.",
        "status": TaskStatus.IN_PROGRESS,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Order team lunch for retro",
        "description": "Confirm headcount with PM and place order by 10am Wednesday.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.LOW,
    },
    {
        "title": "Refactor payment service tests",
        "description": "Replace mocks with test fixtures and add edge cases for refunds.",
        "status": TaskStatus.DONE,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Onboard new contractor",
        "description": "Send NDA, add to Slack, create Jira access, share style guide.",
        "status": TaskStatus.DONE,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Audit third-party dependencies",
        "description": "Run npm audit and pip check; update or replace any vulnerable packages.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Draft blog post: product launch",
        "description": "Outline and first draft for the blog. Include screenshots and CTA.",
        "status": TaskStatus.IN_PROGRESS,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Renew SSL certificate",
        "description": "Production cert expires in 30 days. Request and deploy renewal.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Archive old project files",
        "description": "Move deprecated 'Legacy' folder to cold storage and update links.",
        "status": TaskStatus.DONE,
        "priority": TaskPriority.LOW,
    },
    {
        "title": "Set up staging environment",
        "description": "New staging server; install app, DB, env vars, and CI deploy job.",
        "status": TaskStatus.IN_PROGRESS,
        "priority": TaskPriority.HIGH,
    },
    {
        "title": "Reply to support ticket #2841",
        "description": "Customer asking about bulk export limits. Check docs and send clear instructions.",
        "status": TaskStatus.TO_DO,
        "priority": TaskPriority.MEDIUM,
    },
    {
        "title": "Document release process",
        "description": "Step-by-step runbook for releases so anyone can run a deploy.",
        "status": TaskStatus.DONE,
        "priority": TaskPriority.LOW,
    },
]


def main() -> None:
    db = SessionLocal()
    try:
        created = 0
        for raw in SAMPLE_TASKS:
            task_in = TaskCreate(
                title=raw["title"],
                description=raw.get("description"),
                status=raw["status"],
                priority=raw["priority"],
            )
            task_service.create(db, task_in)
            created += 1
            title = raw["title"]
            print(f"  Created: {title[:60]}{'…' if len(title) > 60 else ''}")
        print(f"\nDone. Created {created} sample tasks.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
