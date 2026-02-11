Inside the terminal:<br>

**Step 1:** cd /Users/soheilsanati/Downloads/ANRL_officialwebsite<br>
**Step 2:** lsof -ti:8000 | xargs kill -9<br>
**Step 3:** python3 -m http.server 8000<br>
**Step 4:** command + click on the link "Serving HTTP on :: port 8000 (http://[::]:8000/) ..."<br>