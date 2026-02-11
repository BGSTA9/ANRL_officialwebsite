Inside the terminal:<br>

**Step 1:** cd /Users/soheilsanati/Downloads/ANRL_officialwebsite<br>
**Step 2:** lsof -ti:8000 | xargs kill -9<br>
**Step 3:** python3 -m http.server 8000<br>
**Step 4:** command + click on the link "Serving HTTP on :: port 8000 (http://[::]:8000/) ..."<br>
**Step 5:**  control + c to stop the server<br>

--- example of live log scenario through terminal --- [11/Feb/2026 19:10:50]

(base) soheilsanati@Soheils-MacBook-Pro ANRL_officialwebsite % python3 -m http.server 8000 
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
::1 - - [11/Feb/2026 19:10:50] "GET / HTTP/1.1" 304 -
::1 - - [11/Feb/2026 19:10:50] "GET /css/styles.css HTTP/1.1" 304 -
::1 - - [11/Feb/2026 19:10:50] "GET /js/components.js HTTP/1.1" 304 -
::1 - - [11/Feb/2026 19:10:50] "GET /js/main.js?v=6 HTTP/1.1" 200 -
::1 - - [11/Feb/2026 19:10:51] "GET /assets/argoneural.png HTTP/1.1" 200 -

--

::1 - - [11/Feb/2026 19:13:26] code 404, message File not found
::1 - - [11/Feb/2026 19:13:26] "GET /styles.css HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:26] code 404, message File not found
::1 - - [11/Feb/2026 19:13:26] "GET /components.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:26] code 404, message File not found
::1 - - [11/Feb/2026 19:13:26] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:26] code 404, message File not found
::1 - - [11/Feb/2026 19:13:26] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:29] "GET /research.html HTTP/1.1" 200 -
::1 - - [11/Feb/2026 19:13:29] "GET /js/main.js HTTP/1.1" 200 -

--

::1 - - [11/Feb/2026 19:13:56] code 404, message File not found
::1 - - [11/Feb/2026 19:13:56] "GET /styles.css HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:56] code 404, message File not found
::1 - - [11/Feb/2026 19:13:56] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:56] code 404, message File not found
::1 - - [11/Feb/2026 19:13:56] "GET /components.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:13:56] code 404, message File not found
::1 - - [11/Feb/2026 19:13:56] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:01] "GET /story.html HTTP/1.1" 200 -

--

::1 - - [11/Feb/2026 19:14:16] code 404, message File not found
::1 - - [11/Feb/2026 19:14:16] "GET /styles.css HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:16] code 404, message File not found
::1 - - [11/Feb/2026 19:14:16] "GET /components.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:16] code 404, message File not found
::1 - - [11/Feb/2026 19:14:16] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:16] code 404, message File not found
::1 - - [11/Feb/2026 19:14:16] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:20] "GET /team.html HTTP/1.1" 200 -

--

::1 - - [11/Feb/2026 19:14:37] code 404, message File not found
::1 - - [11/Feb/2026 19:14:37] "GET /styles.css HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:37] code 404, message File not found
::1 - - [11/Feb/2026 19:14:37] "GET /components.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:37] code 404, message File not found
::1 - - [11/Feb/2026 19:14:37] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:37] code 404, message File not found
::1 - - [11/Feb/2026 19:14:37] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:41] "GET /join.html HTTP/1.1" 200 -
::1 - - [11/Feb/2026 19:14:41] "GET /js/main.js HTTP/1.1" 200 

--

::1 - - [11/Feb/2026 19:14:36] code 404, message File not found
::1 - - [11/Feb/2026 19:14:36] code 404, message File not found
::1 - - [11/Feb/2026 19:14:36] "GET /components.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:36] code 404, message File not found
::1 - - [11/Feb/2026 19:14:36] "GET /styles.css HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:36] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:36] code 404, message File not found
::1 - - [11/Feb/2026 19:14:36] "GET /main.js HTTP/1.1" 404 -
::1 - - [11/Feb/2026 19:14:38] "GET /join.html HTTP/1.1" 200 -
::1 - - [11/Feb/2026 19:14:38] "GET /js/components.js HTTP/1.1" 304 -
::1 - - [11/Feb/2026 19:14:38] "GET /css/styles.css HTTP/1.1" 304 -
::1 - - [11/Feb/2026 19:14:38] "GET /js/main.js HTTP/1.1" 304 -

--- end of live log scenario ---