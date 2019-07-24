import datetime
import os

import sqlalchemy
import voluptuous
from flask import Flask
from flask_cors import CORS
from flask_jwt import JWT
from flask_sslify import SSLify

from backend.models import User
from backend.views import *


def authenticate(username, password):
    user = User.query.filter_by(
        email=username.lower(),
        is_invite=False
    ).one_or_none()
    if user and user.check_password(password):
        return user


def identity(payload):
    user_id = payload['identity']
    return User.query.get(user_id)


def create_app(
    database_uri=os.environ.get('DATABASE_URL')
):
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = database_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

    app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(hours=50000)

    app.config['WEBPACK_MANIFEST_PATH'] = '../build/manifest.json'

    jwt = JWT(app, authenticate, identity)
    app.jwt = jwt

    CORS(app)
    SSLify(app)

    from backend.models import db
    db.init_app(app)

    from backend.views.api import api
    from backend.views.assets import assets
    app.register_blueprint(api)
    app.register_blueprint(assets)

    @app.errorhandler(voluptuous.error.MultipleInvalid)
    def handler_voluptuous_error(multiple_invalid):
        # TODO: implement this properly
        d = {
            str(
                invalid.path[0] if len(invalid.path) > 0 else 'general'
            ): [invalid.msg]
            for invalid in multiple_invalid.errors
        }
        response = jsonify({'errors': d})
        response.status_code = 400
        return response

    @app.errorhandler(sqlalchemy.orm.exc.NoResultFound)
    def handle_sqlalchemy_no_result_found_error(error):
        # TODO: Hmm should something be done here?
        response = jsonify({
            'error': 'No results found'
        })
        response.status_code = 404
        return response

    return app
