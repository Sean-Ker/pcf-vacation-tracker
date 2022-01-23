from emails.emails import send_email
from bs4 import BeautifulSoup


def create_account_email(receiver, fname, url):
    with open("emails/create_account.html", "r", encoding="utf-8") as f:
        html = f.read()

    # html = html.format(fname=fname, url=url)

    tree = BeautifulSoup(html, "lxml")
    body = tree.find("body")
    body = str(body).format(fname=fname, url=url)
    body_tree = BeautifulSoup(body, "lxml")

    tree.find("body").replaceWith(body_tree)

    with open("emails\\new_account_formatted.html", "w+") as f:
        f.write(str(tree))

    text = """
            VACATION TRACKER

            WELCOME {fname}!
            Your admin invited you to Vacation Tracker. Please verify your email and finish
            setting up your account.

            Just press the button below.

            [Confirm Account]
            {url}

            If that doesn't work, copy and paste the following link in your browser:

            {url}

            Cheers,

            The Vacation Tracker Team""".format(
        fname=fname, url=url
    )

    send_email("Vacation Tracker - Activate Account", receiver, text, str(tree))


if __name__ == "__main__":
    create_account_email("skernitsman@pcfsouvenirs.com", "Sean", "https://www.google.com")
