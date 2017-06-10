import json

import pytest
from decimal import Decimal
from flask import url_for

from backend import TabType
from backend.tests.factories import (TabTypeFactory, TeamFactory,
                                     TeamMembershipFactory, UserFactory)


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesViewUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.get(url_for('api.tab_types', team_slug='none'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesViewAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    def test_returns_404_for_team_not_part_of(self, client):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.get(url_for('api.tab_types', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client):
        response = client.get(
            url_for('api.tab_types', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_correct_data(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        tab_type = TabTypeFactory(team=team)
        TeamMembershipFactory(team=team, user=logged_in_user)
        response = client.get(url_for('api.tab_types', team_slug='mine'))
        assert response.status_code == 200
        assert response.json == [
            {'id': tab_type.id, 'price': '2.00', 'name': 'Beer'}
        ]

    def test_doesnt_return_extra_data(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        tab_type = TabTypeFactory(team=team)
        TeamMembershipFactory(team=team, user=logged_in_user)

        team2 = TeamFactory(slug='second')
        TabTypeFactory(team=team2)
        TeamMembershipFactory(team=team2, user=logged_in_user)

        team3 = TeamFactory(slug='third')
        TabTypeFactory(team=team3)

        response = client.get(url_for('api.tab_types', team_slug='mine'))
        assert response.status_code == 200
        assert response.json == [
            {'id': tab_type.id, 'price': '2.00', 'name': 'Beer'}
        ]


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesDeleteUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.delete(
            url_for('api.delete_tab_type', team_slug='none', tab_type_id=1)
        )
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesDeleteAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    def test_returns_404_for_team_not_part_of(self, client):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.delete(
            url_for('api.delete_tab_type', team_slug='not-mine', tab_type_id=1)
        )
        assert response.status_code == 404

    def test_returns_404_for_tab_type_not_part_of_team(
        self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        other_team = TeamFactory(slug='other')
        TeamMembershipFactory(
            team=other_team, user=logged_in_user, is_admin=True
        )

        tab_type = TabTypeFactory(team=team)
        response = client.delete(url_for(
            'api.delete_tab_type',
            team_slug='other',
            tab_type_id=tab_type.id
        ))
        assert response.status_code == 404

    def test_returns_404_for_unexisting_tab_type(
            self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)

        response = client.delete(url_for(
            'api.delete_tab_type',
            team_slug='mine',
            tab_type_id=666
        ))
        assert response.status_code == 404

    def test_returns_200_and_deletes_tab_type_when_succesfull(
            self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        tab_type = TabTypeFactory(team=team)

        response = client.delete(url_for(
            'api.delete_tab_type',
            team_slug='mine',
            tab_type_id=tab_type.id
        ))
        assert response.status_code == 200
        assert TabType.query.count() == 0

    def test_returns_403_and_doesnt_delete_tab_type_when_not_admin(
            self, client, logged_in_user
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=False)
        tab_type = TabTypeFactory(team=team)

        response = client.delete(url_for(
            'api.delete_tab_type',
            team_slug='mine',
            tab_type_id=tab_type.id
        ))
        assert response.status_code == 403
        assert TabType.query.count() == 1


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesCreateUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.post(
            url_for('api.create_tab_type', team_slug='none')
        )
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTabTypesCreateAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    @pytest.fixture
    def data(self):
        return {
            'name': 'Big bread',
            'price': 10
        }

    def test_returns_404_for_team_not_part_of(self, client, data):
        TeamFactory(slug='not-mine')
        response = client.post(
            url_for('api.create_tab_type', team_slug='not-mine'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_returns_200_and_creates_tab_type_when_succesfull(
        self, client, data, logged_in_user
    ):
        team = TeamFactory(slug='bread-eaters')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        response = client.post(
            url_for('api.create_tab_type', team_slug='bread-eaters'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 200
        tab_type = TabType.query.one()
        assert tab_type.team == team
        assert tab_type.price == 10
        assert tab_type.name == 'Big bread'

    def test_creates_decimal_string_tab_type(
            self, client, data, logged_in_user
    ):
        data['price'] = '1.111111'
        team = TeamFactory(slug='bread-eaters')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        response = client.post(
            url_for('api.create_tab_type', team_slug='bread-eaters'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 200
        tab_type = TabType.query.one()
        assert tab_type.team == team
        assert tab_type.price == Decimal('1.11')
        assert tab_type.name == 'Big bread'

    def test_returns_403_and_doesnt_create_tab_type_when_not_admin(
            self, client, data, logged_in_user
    ):
        team = TeamFactory(slug='bread-eaters')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=False)
        response = client.post(
            url_for('api.create_tab_type', team_slug='bread-eaters'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 403
        assert TabType.query.count() == 0
