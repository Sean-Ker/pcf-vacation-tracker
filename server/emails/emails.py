MAIL_SERVER = "smtp.gmail.com"
MAIL_USERNAME = "vtrackly1@gmail.com"
MAIL_PASSWORD = "vtrackly5352"

import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(subject, receiver, text, html):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = MAIL_USERNAME
    message["To"] = receiver

    # Turn these into plain/html MIMEText objects
    text_part = MIMEText(text, "plain")
    html_part = MIMEText(html, "html")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(text_part)
    message.attach(html_part)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(MAIL_SERVER, 465, context=context) as server:
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_USERNAME, receiver, message.as_string())


if __name__ == "__main__":
    text = """
    Hi,
    How are you?
    Real Python has many great tutorials:
    www.realpython.com
    """

    html = """
    <html>
        <body>
            <p>
            <strong>Hi</strong>, <br> How are you? <br>
            <a href="http://www.realpython.com">Real Python</a> has many great tutorials.
            </p>
        </body>
    </html>
    """

    send_email("Sending Email Test", "skernitsman@pcfsouvenirs.com", text, html)
