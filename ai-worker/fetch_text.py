import requests
from bs4 import BeautifulSoup

def fetch_text(domain: str) -> str:
  url = f"https://{domain}"

  try:
    response = requests.get(
      url,
      timeout= 5,
      headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
  except requests.RequestException as e:
    print(f"Failed to fetc ${domain} : {e}")
    return domain

  if response.status_code != 200:
    print(f"non 200 {domain} : {response.status_code}")
    return domain

  soup = BeautifulSoup(response.text , "html.parser")

  title_text = soup.title.string if soup.title else ""

  meta = soup.find("meta", attrs={"name": "description"})
  description = meta.get("content","") if meta else ""

  combine = f"{title_text} {description}".strip()

  return combine if combine else domain




