import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv

load_dotenv()

class EmailSender:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.port = int(os.getenv("SMTP_PORT"))
        self.username = os.getenv("EMAIL_USER")
        self.password = os.getenv("EMAIL_PASS")
        self.sender_email = os.getenv("EMAIL_FROM")

    def send_verification_email(self, to_email, verification_link):
        subject = "Verify your iHelp account"
        body = f"""
        Hi there,

        Thank you for signing up for iHelp. Please verify your email address by clicking the link below:

        {os.getenv("FRONTEND_URL")}{verification_link}

        If you did not sign up for this service, you can ignore this email.

        Best,
        iHelp Team
        """

        message = EmailMessage()
        message["From"] = self.sender_email
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            with smtplib.SMTP_SSL(self.smtp_server, self.port) as server:
                server.login(self.username, self.password)
                server.send_message(message)
            print(f"Verification email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
