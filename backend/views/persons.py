from decimal import Decimal
from flask import jsonify, request
from flask_jwt import jwt_required
from voluptuous import Schema, Required, All, Length

from backend.models import Person, TabItem, db
from backend.views.base import team_view, team_admin_required
from backend.views.api import api


def _get_person_data(team):
    query = (
        db.session.query(
            Person,
            db.func.coalesce(
                db.func.sum(TabItem.total),
                Decimal('0.00')
            )
        )
        .outerjoin(
            (TabItem, (Person.id == TabItem.person_id))
        )
        .group_by(Person)
        .order_by(Person.name)
        .filter(Person.team_id == team.id)
    )
    return [
        {
            'id': person.id,
            'name': person.name,
            'total_depth': str(total_depth),
            'team_id': person.team_id,
            'disabled': person.disabled
        }
        for person, total_depth in query
    ]


person_schema = Schema({
    Required('name'): All(str, Length(min=2, max=20))
})


person_edit_schema = Schema({
    Required('disabled'): bool
})


@api.route('/teams/<team_slug>/persons')
@jwt_required()
@team_view
def persons(team):
    return jsonify(_get_person_data(team))


@api.route('/teams/<team_slug>/persons/<person_id>', methods=['PUT'])
@jwt_required()
@team_view
@team_admin_required
def modify_person(team, person_id):
    person = Person.query.filter_by(
        id=person_id,
        team=team
    ).one()
    data = person_edit_schema(request.json)
    person.disabled = data['disabled']
    db.session.commit()
    return jsonify(_get_person_data(team))


@api.route('/teams/<team_slug>/persons', methods=['POST'])
@jwt_required()
@team_view
@team_admin_required
def create_person(team):
    data = person_schema(request.json)

    person = Person(
        team=team,
        name=data['name']
    )

    db.session.add(person)
    db.session.commit()

    return jsonify(_get_person_data(team))
