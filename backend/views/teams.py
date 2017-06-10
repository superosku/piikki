import random
import string

from flask import jsonify, request, abort
from flask_jwt import current_identity, jwt_required
from inflection import parameterize
from voluptuous import Required, Schema, All, Length

from backend.models import Team, TeamMembership, db, TabType, Person
from backend.views.api import api


def _get_teams_response():
    team_memberships = TeamMembership.query.filter(
        TeamMembership.user == current_identity
    ).all()
    return jsonify(
        [
            {
                'id': team_membership.team.id,
                'name': team_membership.team.name,
                'slug': team_membership.team.slug,
                'is_admin': team_membership.is_admin,
            }
            for team_membership in team_memberships
            ]
    )


@api.route('/teams')
@jwt_required()
def teams():
    return _get_teams_response()


team_schema = Schema({
    Required('name'): All(str, Length(min=2, max=15))
})


def _generate_slug(original_slug):
    return '{}-{}'.format(
        original_slug,
        ''.join([random.choice(string.ascii_lowercase) for _ in range(3)])
    )


@api.route('/teams', methods=['POST'])
@jwt_required()
def teams_add():
    if request.mimetype != 'application/json':
        abort(415)
    data = team_schema(request.json)

    name = data['name']
    original_slug = parameterize(name[:20])
    slug = _generate_slug(original_slug)

    while Team.query.filter_by(slug=slug).count() > 0:
        slug = _generate_slug(original_slug)

    team = Team(name=name, slug=slug)
    db.session.add(team)
    TeamMembership(
        team=team,
        user=current_identity,
        is_admin=True
    )

    db.session.add(TabType(name='Beer', price=1, team=team))
    db.session.add(TabType(name='Cider', price=2, team=team))
    db.session.add(Person(name=current_identity.name, team=team))

    db.session.commit()

    response = _get_teams_response()
    response.status_code = 201
    return response

