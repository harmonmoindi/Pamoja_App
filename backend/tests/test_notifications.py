from app.extensions import db
from app.models.notification import Notification
from tests.conftest import bearer


def _note(user, title="Update", is_read=False):
    note = Notification(user_id=user.id, title=title, body="Details", kind="request", is_read=is_read)
    db.session.add(note)
    db.session.commit()
    return note


def test_beneficiary_lists_only_own_notifications(client, make_user, login):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    joseph = make_user(role="beneficiary", email="joseph@example.org", name="Joseph")
    own = _note(grace, title="Your request was assessed")
    _note(joseph, title="Joseph only")
    token = login("grace@example.org").get_json()["token"]

    res = client.get("/api/notifications", headers=bearer(token))

    assert res.status_code == 200
    body = res.get_json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == own.id
    assert body["items"][0]["title"] == "Your request was assessed"
    assert body["items"][0]["isRead"] is False
    assert body["items"][0]["kind"] == "request"


def test_donor_cannot_list_notifications(client, make_user, login):
    make_user(role="donor", email="donor@example.org", name="Amina")
    token = login("donor@example.org").get_json()["token"]

    res = client.get("/api/notifications", headers=bearer(token))

    assert res.status_code == 403


def test_beneficiary_can_mark_one_notification_read(client, make_user, login):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    note = _note(grace)
    token = login("grace@example.org").get_json()["token"]

    res = client.patch(f"/api/notifications/{note.id}/read", headers=bearer(token))

    assert res.status_code == 200
    assert res.get_json()["notification"]["isRead"] is True
    db.session.refresh(note)
    assert note.is_read is True


def test_beneficiary_cannot_mark_someone_elses_notification(client, make_user, login):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    joseph = make_user(role="beneficiary", email="joseph@example.org", name="Joseph")
    note = _note(joseph)
    token = login("grace@example.org").get_json()["token"]

    res = client.patch(f"/api/notifications/{note.id}/read", headers=bearer(token))

    assert res.status_code == 404
    db.session.refresh(note)
    assert note.is_read is False
    assert grace.id != joseph.id


def test_mark_all_read_updates_only_the_beneficiarys_unread(client, make_user, login):
    grace = make_user(role="beneficiary", email="grace@example.org", name="Grace")
    joseph = make_user(role="beneficiary", email="joseph@example.org", name="Joseph")
    unread = _note(grace, title="Unread")
    already = _note(grace, title="Already", is_read=True)
    other = _note(joseph, title="Other")
    token = login("grace@example.org").get_json()["token"]

    res = client.patch("/api/notifications/read-all", headers=bearer(token))

    assert res.status_code == 200
    assert res.get_json()["updated"] == 1
    db.session.refresh(unread)
    db.session.refresh(already)
    db.session.refresh(other)
    assert unread.is_read is True
    assert already.is_read is True
    assert other.is_read is False
