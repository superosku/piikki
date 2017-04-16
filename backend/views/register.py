import datetime

from flask import abort, jsonify, request
from voluptuous import All, Email, Length, Required, Schema

from backend.models import User, db
from backend.views.api import api

register_schema = Schema({
    Required('email'): Email(),
    Required('password'): All(str, Length(min=6)),
    Required('first_name'): All(str, Length(min=3)),
    Required('last_name'): All(str, Length(min=3)),
})


@api.route('/register', methods=['POST'])
def register():
    if request.mimetype != 'application/json':
        abort(415)

    data = register_schema(request.json)

    user = User.query.filter_by(email=data['email']).first()

    if user:
        if user.is_invite:
            user.password = data['password']
            user.first_name = data['first_name']
            user.last_name = data['last_name']
            user.registered_at = datetime.datetime.now()
            user.is_invite = False

            db.session.commit()

            return jsonify({
                'success': 'User created'
            })
        else:
            return jsonify({
                'errors': {'email': 'Email already in use'}
            }), 400

    user = User(
        email=data['email'].lower(),
        password=data['password'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        registered_at=datetime.datetime.now(),
        is_invite=False
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'success': 'User created'
    })
