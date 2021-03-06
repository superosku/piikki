import datetime

from flask import abort, jsonify, request
from flask_jwt import current_identity, jwt_required
from voluptuous import Coerce, Required, Schema

from backend.models import Person, TabItem, TeamMembership, db
from backend.views.api import api
from backend.views.base import team_view
from backend.views.persons import _get_person_data


def _repr_tab_item(tab_item):
    return {
        'id': tab_item.id,
        'name': tab_item.name,
        'price': str(tab_item.price),
        'amount': tab_item.amount,
        'total': str(tab_item.total),
        'person': {
            'id': tab_item.person.id,
            'name': tab_item.person.name
        },
        'adder': {
            'id': tab_item.adder.id,
            'name': tab_item.adder.name,
        },
        'added_at': tab_item.added_at.isoformat(),
        'can_be_deleted': tab_item.can_be_deleted
    }


@api.route('/teams/<team_slug>/tab-items')
@jwt_required()
@team_view
def tab_items(team):
    per_page = 50

    try:
        page = int(request.args.get('page', 0))
    except ValueError:
        return jsonify({
            'errors': {
                'page': ['Invalid page parameter.']
            }
        }), 400

    tab_items_query = (
        TabItem.query
        .filter(TabItem.team == team)
    )

    search = request.args.get('search', '')
    if search:
        tab_items_query = tab_items_query.filter(
            db.or_(
                TabItem.person_id.in_(
                    db.session.query(Person.id).filter(Person.name.ilike(
                        '%' + search + '%'
                    ))
                ),
                TabItem.name.ilike('%' + search + '%')
            )
        )

    amount = tab_items_query.count()

    tab_items_query = (
        tab_items_query
        .order_by(TabItem.added_at.desc())
        .limit(per_page)
        .offset(per_page * page)
    )

    return jsonify(
        {
            'data': [
                _repr_tab_item(tab_item)
                for tab_item in tab_items_query
            ],
            'meta': {
                'count': amount,
                'page': page,
                'per_page': per_page
            }
        }
    )


tab_items_schema = Schema({
    Required('tab_items'): [{
        Required('name'): str,
        Required('price'): Coerce(float),
        Required('amount'): Coerce(float),
    }],
    Required('person_id'): Coerce(int)
})


@api.route('/teams/<team_slug>/tab-items', methods=['POST'])
@jwt_required()
@team_view
def tab_items_add(team):
    if request.mimetype != 'application/json':
        abort(415)
    data = tab_items_schema(request.json)

    person = Person.query.filter_by(
        id=data['person_id']
    ).first()

    if not person or person not in team.persons:
        return jsonify({
            'errors': {
                'person_id': ['Person not found for this id.']
            }
        }), 400

    team_member = TeamMembership.query.filter_by(
        user=current_identity,
        team=team
    ).one()

    if not team_member.is_admin:
        for tab_item_data in data['tab_items']:
            if tab_item_data['price'] * tab_item_data['amount'] < 0:
                return jsonify({
                    'errors': {
                        'tab_items': ['Only admins can add negative tabs.']
                    }
                }), 400

    tab_items = []
    for tab_item_data in data['tab_items']:
        tab_item = TabItem(
            name=tab_item_data['name'],
            price=tab_item_data['price'],
            amount=tab_item_data['amount'],
            team=team,
            person=person,
            adder=current_identity,
            added_at=datetime.datetime.now()
        )
        tab_items.append(tab_item)
        db.session.add(tab_item)

    db.session.commit()

    return jsonify(
        {
            'tab_types': [
                _repr_tab_item(tab_item)
                for tab_item in tab_items
            ],
            'persons': _get_person_data(team)
        }
    ), 201


@api.route('/teams/<team_slug>/tab-items/<tab_item_id>', methods=['DELETE'])
@jwt_required()
@team_view
def tab_items_delete(team, tab_item_id):
    tab_item = TabItem.query.get(tab_item_id)

    if not tab_item.can_be_deleted:
        return jsonify({
            'errors': {
                'error': ['Items older than 1 hour cant be deleted.']
            }
        }), 400

    db.session.delete(tab_item)
    db.session.commit()
    return jsonify({}), 200
