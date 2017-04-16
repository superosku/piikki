from flask import jsonify, request
from flask_jwt import jwt_required
from voluptuous import All, Coerce, Length, Required, Schema, Range

from backend.models import TabType, db
from backend.views.api import api
from backend.views.base import team_view


def _tab_types_response(team):
    tab_types = (
        TabType.query
        .filter(TabType.team == team)
        .order_by(TabType.name)
        .all()
    )
    return jsonify(
        [
            {
                'id': tab_type.id,
                'name': tab_type.name,
                'price': str(tab_type.price),
            }
            for tab_type in tab_types
        ]
    )


tab_type_schema = Schema({
    Required('name'): All(str, Length(min=1, max=20)),
    Required('price'): All(Coerce(float), Range(min=0.01, max=999))
})


@api.route('/teams/<team_slug>/tab-types')
@jwt_required()
@team_view
def tab_types(team):
    return _tab_types_response(team)


@api.route('/teams/<team_slug>/tab-types', methods=['POST'])
@jwt_required()
@team_view
def create_tab_type(team):
    data = tab_type_schema(request.json)

    tab_type = TabType(
        team=team,
        price=data['price'],
        name=data['name']
    )
    db.session.add(tab_type)
    db.session.commit()
    return _tab_types_response(team)


@api.route('/teams/<team_slug>/tab-types/<tab_type_id>', methods=['DELETE'])
@jwt_required()
@team_view
def delete_tab_type(team, tab_type_id):
    tab_type = TabType.query.filter_by(
        id=tab_type_id,
        team=team
    ).one()
    db.session.delete(tab_type)
    db.session.commit()
    return _tab_types_response(team)
