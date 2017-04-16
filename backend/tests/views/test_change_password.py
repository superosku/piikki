import json

import pytest
from flask import url_for

from backend.tests.factories import UserFactory


@pytest.mark.usefixtures('request_ctx', 'database')
class TestChangePasswordViewUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.post(url_for('api.change_password'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestChangePasswordViewAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory(
            password='secret'

        )

    def test_changes_password(self, client, logged_in_user):
        response = client.post(
            url_for('api.change_password'),
            data=json.dumps({
                'current_password': 'secret',
                'new_password': 'supersecret'
            }),
            content_type='application/json'
        )
        assert response.status_code == 200
        assert logged_in_user.check_password('supersecret')

    def test_does_not_change_password_on_invalid_current_password(
        self, client, logged_in_user
    ):
        response = client.post(
            url_for('api.change_password'),
            data=json.dumps({
                'current_password': 'seCret',
                'new_password': 'supersecret'
            }),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert logged_in_user.check_password('secret')
