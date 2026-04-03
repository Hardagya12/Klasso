git reset HEAD~1
git reset
git add package.json
git commit -m "build: initialize foundational package.json and dependencies"
git add .env.example
git commit -m "chore: assign mock application constants via .env template"
git add src/db/schema.sql
git commit -m "feat(db): inject robust normalized schema setup payload"
git add src/db/seed.js
git commit -m "chore(db): create dynamic testing models across all features for payload seed"
git add -A
git commit -m "chore: cleanse legacy application chunk code routes to reboot development iteration"
git push --force origin main
