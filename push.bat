@echo off
echo Staging and committing all changes to prevent conflict...
git add .
git commit -m "Refactor UI/UX: premium cards layout, pulsing availability badges, slots indexing bug fix, Triagebot login guard, and NotFound wildcard page"

echo.
echo Pulling latest remote changes (rebase) to synchronize...
git pull --rebase

echo.
echo Pushing committed changes to GitHub...
git push

echo.
echo ==========================================================
echo Done! All changes have been committed and pushed to GitHub.
echo ==========================================================
pause
