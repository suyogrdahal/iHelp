from fastapi.testclient import TestClient
import sys
sys.path.append("..")
from main import app

client = TestClient(app)

def get_auth_token(email:str, password:str) -> str:
    
    login_response = client.post("/user/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    return login_response.json()["access_token"]

def test_create_help_post_authenticated():
    token = get_auth_token("dahalsuy@mail.gvsu.edu", "Srd@1998")
    response = client.post(
        "/help/create",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "heading": "Need help testing routes",
            "content": "Please help me test FastAPI endpoints.",
            "author": "dahalsuy@mail.gvsu.edu",
            "status": "active",
            "helped": False,
            "helper": None,
            "timestamp": "2025-04-20T12:00:00Z"
        }
    )
    assert response.status_code == 201
    assert response.json()["heading"] == "Need help testing routes"

def test_offer_help_authenticated():
    token = get_auth_token("test@mail.gvsu.edu","Srd@1998")

    create_res = client.post(
        "/help/create",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "heading": "Need a helper for groceries",
            "content": "Can't carry my groceries alone",
            "author": "dahalsuy@mail.gvsu.edu",
            "status": "active",
            "helped": False,
            "helper": None,
            "timestamp": "2025-04-20T13:00:00Z"
        }
    )
    help_id = create_res.json()["_id"]

    offer_res = client.post(
        f"/help/offer/{help_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"comment": "I can help you at 5 PM"}
    )

    assert offer_res.status_code == 200
    assert offer_res.json()["status"] == "pending"
