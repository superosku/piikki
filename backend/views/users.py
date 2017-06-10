import datetime

from flask import abort, jsonify, request
from flask_jwt import jwt_required
from voluptuous import Boolean, Email, Required, Schema

from backend.models import TeamMembership, User, db
from backend.views.api import api
from backend.views.base import team_admin_required, team_view


def _get_users_response(team):
    team_memberships = TeamMembership.query.filter(
        TeamMembership.team == team
    ).all()
    return jsonify(
        [
            {
                'id': team_membership.user.id,
                'email': team_membership.user.email,
                'is_admin': team_membership.is_admin,
            }
            for team_membership in team_memberships
        ]
    )


@api.route('/teams/<team_slug>/users')
@jwt_required()
@team_view
def users(team):
    return _get_users_response(team)


user_invite_schema = Schema({
    Required('email'): Email(),
    Required('is_admin'): Boolean()
})


@api.route('/teams/<team_slug>/users/invite', methods=['POST'])
@jwt_required()
@team_view
@team_admin_required
def users_invite(team):
    if request.mimetype != 'application/json':
        abort(415)

    data = user_invite_schema(request.json)

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        user = User(
            email=data['email'].lower(),
            is_invite=True,
            first_name='',
            last_name='',
            registered_at=datetime.datetime.now()
        )
        db.session.add(user)
    elif TeamMembership.query.filter_by(user=user, team=team).count() > 0:
        return jsonify({
            'errors': {
                'email': ['User is already part of the team.']
            }
        }), 400

    membership = TeamMembership(
        user=user,
        team=team,
        is_admin=data['is_admin']
    )

    db.session.add(membership)
    db.session.commit()

    response = _get_users_response(team)
    response.status_code = 201
    return response
