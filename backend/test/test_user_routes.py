from fastapi.testclient import TestClient
import sys
sys.path.append("..")
from main import app

client = TestClient(app)

def test_login_success():
    response = client.post("/user/login", json={
        "email": "dahalsuy@mail.gvsu.edu",
        "password": "Srd@1998"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure():
    response = client.post("/user/login", json={
        "email": "random@mail.gvsu.edu",
        "password": "wrong"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"
