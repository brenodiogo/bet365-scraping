import requests
from lxml import html

session_requests = requests.session()

login_url = "https://www.bet365.com/?lng=22#/HO/"
result = session_requests.get(login_url)
print(result.content)