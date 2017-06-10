import datetime
import json

import pytest
from flask import url_for

from backend import TabItem
from backend.tests.factories import (PersonFactory, TabItemFactory,
                                     TabTypeFactory, TeamFactory,
                                     TeamMembershipFactory, UserFactory)


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabItemsViewUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.get(url_for('api.tab_items', team_slug='none'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabItemsViewAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    def test_returns_404_for_team_not_part_of(self, client, logged_in_user):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.get(url_for('api.tab_items', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client, logged_in_user):
        response = client.get(
            url_for('api.tab_items', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_correct_data(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user)
        person = PersonFactory(team=team, name='Jaska Jokunen')

        tab_item = TabItemFactory(
            team=team, adder=logged_in_user, person=person
        )

        response = client.get(url_for('api.tab_items', team_slug='mine'))
        assert response.status_code == 200
        expected_data = {
            'meta': {'page': 0, 'per_page': 50, 'count': 1},
            'data': [
                {
                    'adder': {
                        'name': 'Pekka Puupää',
                        'id': 1
                    },
                    'price': '2.00',
                    'total': '2.00',
                    'person': {
                        'name': 'Jaska Jokunen',
                        'id': 1
                    },
                    'name': 'Beer',
                    'added_at': tab_item.added_at.isoformat(),
                    'id': 1,
                    'amount': 1
                }
            ]
        }
        assert response.json == expected_data

    def test_doesnt_return_extra_data(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user)
        person = PersonFactory(team=team, name='Jaska Jokunen')

        tab_item = TabItemFactory(
            team=team, adder=logged_in_user, person=person
        )

        new_team = TeamFactory()
        new_user = UserFactory()
        new_person = PersonFactory(team=new_team)
        TabItemFactory(
            team=new_team, adder=new_user, person=new_person
        )

        response = client.get(url_for('api.tab_items', team_slug='mine'))
        assert response.status_code == 200
        assert response.json == {
            'meta': {'page': 0, 'per_page': 50, 'count': 1},
            'data': [
                {
                    'adder': {
                        'name': 'Pekka Puupää',
                        'id': 1
                    },
                    'price': '2.00',
                    'total': '2.00',
                    'person': {
                        'name': 'Jaska Jokunen',
                        'id': 1
                    },
                    'name': 'Beer',
                    'added_at': tab_item.added_at.isoformat(),
                    'id': 1,
                    'amount': 1
                }
            ]
        }

    def test_pagination_returns_at_most_50_items(
        self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user)
        person = PersonFactory(team=team, name='Jaska Jokunen')

        for i in range(55):
            TabItemFactory(
                team=team, adder=logged_in_user, person=person
            )

        response = client.get(url_for('api.tab_items', team_slug='mine'))
        assert response.status_code == 200
        assert len(response.json['data']) == 50
        assert response.json['meta'] == {'page': 0, 'per_page': 50, 'count': 55}

    def test_pagination_with_params_returns_correct_items(
        self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user)
        person = PersonFactory(team=team, name='Jaska Jokunen')

        for i in range(50):
            TabItemFactory(
                team=team, adder=logged_in_user, person=person
            )
        tab_item = TabItemFactory(
            team=team,
            adder=logged_in_user,
            person=person,
            name='Oldest',
            added_at=datetime.datetime.now() - datetime.timedelta(days=1)
        )

        response = client.get(
            url_for('api.tab_items', team_slug='mine', page=1)
        )
        assert response.status_code == 200
        assert response.json == {
            'meta': {'page': 1, 'per_page': 50, 'count': 51},
            'data': [
                {
                    'adder': {
                        'name': 'Pekka Puupää',
                        'id': 1
                    },
                    'price': '2.00',
                    'total': '2.00',
                    'person': {
                        'name': 'Jaska Jokunen',
                        'id': 1
                    },
                    'name': 'Oldest',
                    'added_at': tab_item.added_at.isoformat(),
                    'id': tab_item.id,
                    'amount': 1
                }
            ]
        }

    def test_pagination_with_invalid_page_param(
            self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user)

        response = client.get(
            url_for('api.tab_items', team_slug='mine', page='a')
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {'page': ['Invalid page parameter.']}
        }


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabItemsPostUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.post(url_for('api.tab_items', team_slug='none'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TabItemsPostAuthorizedTestCase:
    @pytest.fixture
    def team(self):
        return TeamFactory(slug='my-team')

    @pytest.fixture
    def logged_in_user(self, team):
        return UserFactory(memberships=[
            TeamMembershipFactory.build(team=team, is_admin=True)
        ])

    @pytest.fixture
    def person(self, team):
        return PersonFactory(team=team)

    @pytest.fixture
    def data(self, person):
        return {
            'tab_items': [
                {
                    'name': 'Hamburger',
                    'price': 5,
                    'amount': 2
                }
            ],
            'person_id': person.id
        }


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabItemsPostAdmin(TabItemsPostAuthorizedTestCase):
    def test_returns_404_for_team_not_part_of(self, client, logged_in_user):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.get(url_for('api.tab_items', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client, logged_in_user):
        response = client.get(
            url_for('api.tab_items', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_415_for_wrong_content_type(self, client, logged_in_user, data):
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data)
        )
        assert response.status_code == 415

    def test_validates_invalid_person_id(self, client, logged_in_user, data):
        data['person_id'] = 111
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {
                'person_id': ['Person not found for this id.']
            }
        }

    def test_validates_person_id_form_wrong_team(self, client, logged_in_user, data):
        data['person_id'] = PersonFactory(
            team=TeamFactory()
        ).id
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {
                'person_id': ['Person not found for this id.']
            }
        }

    def test_validates_invalid_data(self, client, logged_in_user, data):
        data['tab_items'] = [{'invalid': 'parameter'}]
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {
                'tab_items': ['required key not provided']
            }
        }

    def test_creates_item(self, client, logged_in_user, data, person):
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert TabItem.query.count() == 1
        tab_item = TabItem.query.one()
        assert tab_item.name == 'Hamburger'
        assert tab_item.price == 5
        assert tab_item.amount == 2
        assert tab_item.total == 10
        assert tab_item.adder == logged_in_user
        assert tab_item.person == person

    def test_creates_item_when_price_is_string(
        self, client, logged_in_user, data, person
    ):
        data['tab_items'][0]['price'] = '1.5'
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert TabItem.query.count() == 1
        tab_item = TabItem.query.one()
        assert tab_item.name == 'Hamburger'
        assert tab_item.price == 1.5
        assert tab_item.amount == 2
        assert tab_item.total == 3
        assert tab_item.adder == logged_in_user
        assert tab_item.person == person


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabItemsPostNonAdmin(TabItemsPostAuthorizedTestCase):
    @pytest.fixture
    def logged_in_user(self, team):
        return UserFactory(memberships=[
            TeamMembershipFactory.build(team=team, is_admin=False)
        ])

    def test_non_admin_cant_add_negative_tabs(
        self, client, logged_in_user, person
    ):
        data = {
            'tab_items': [
                {
                    'name': 'Paid back',
                    'price': -5,
                    'amount': 1
                }
            ],
            'person_id': person.id
        }
        response = client.post(
            url_for('api.tab_items', team_slug='my-team'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {'tab_items': ['Only admins can add negative tabs.']}
        }
        assert TabItem.query.count() == 0
