inside the terminal:

step 1: cd /Users/soheilsanati/Downloads/ANRL_officialwebsite
step 2: lsof -ti:8000 | xargs kill -9
step 3: python3 -m http.server 8000
step 4: command + click on the link "Serving HTTP on :: port 8000 (http://[::]:8000/) ..."