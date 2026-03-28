from newspaper import Article
import requests


def resolve_url(url):
    try:
        res = requests.get(url, allow_redirects=True, timeout=5)
        return res.url
    except:
        return url


def extract_full_article(url):
    try:
        url = resolve_url(url)

        article = Article(url)
        article.download()
        article.parse()

        return {
            "full_text": article.text,
            "real_url": url
        }

    except:
        return {
            "full_text": "",
            "real_url": url
        }   