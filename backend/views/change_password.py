from flask import abort, jsonify, request
from flask_jwt import current_identity, jwt_required
from voluptuous import All, Length, Required, Schema

from backend.models import db
from backend.views.api import api

register_schema = Schema({
    Required('current_password'): All(str),
    Required('new_password'): All(str, Length(min=6)),
})


@api.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    if request.mimetype != 'application/json':
        abort(415)

    data = register_schema(request.json)

    if not current_identity.check_password(data['current_password']):
        return jsonify({'errors': {
            'current_password': 'Current password was invalid'
        }}), 400

    current_identity.password = data['new_password']
    db.session.commit()

    return jsonify({
        'success': 'User created'
    })
