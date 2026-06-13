@echo off
echo Committing and pushing all UI/UX enhancements and bug fixes to GitHub...
git add .
git commit -m "Refactor UI/UX: premium cards layout, pulsing availability badges, slots indexing bug fix, Triagebot login guard, and NotFound wildcard page"
git push
echo.
echo ==========================================================
echo Done! All changes have been committed and pushed to GitHub.
echo ==========================================================
pause
