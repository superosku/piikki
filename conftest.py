import os

import jwt
import pytest
from flask import current_app
from flask_json import FlaskJSON, JsonTestResponse

from backend import create_app, db


@pytest.fixture
def app():
    app = create_app(
        database_uri=os.environ.get(
            'TEST_DATABASE_URL',
            'postgresql://localhost:5432/piikki_test'
        )
    )
    app.debug = True

    FlaskJSON(app)
    app.response_class = JsonTestResponse

    return app


@pytest.fixture
def request_ctx(app):
    ctx = app.test_request_context()
    ctx.push()
    return ctx


@pytest.fixture
def logged_in_user():
    return


def _get_client(client, logged_in_user):
    original_open = client.open

    headers = {}

    from backend import identity

    if logged_in_user:
        identity = identity({'identity': logged_in_user.id})
        # token = jwt.jwt_encode_callback(identity)
        token = current_app.jwt.jwt_encode_callback(identity)
        headers['Authorization'] = 'JWT {}'.format(
            token.decode('utf-8')
        )

    def decorated_open(self, *args, **kwargs):
        if 'headers' in kwargs:
            headers.update(kwargs['headers'])
        kwargs['headers'] = headers

        return original_open(self, *args, **kwargs)

    client.open = decorated_open
    return client


@pytest.fixture
def client(app, logged_in_user):
    return _get_client(app.test_client(), logged_in_user)


@pytest.fixture
def database(app):
    db.session.remove()
    db.drop_all()
    db.create_all()
