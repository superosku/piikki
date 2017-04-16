import json

import pytest
from flask import url_for

from backend import Team, TabType, Person
from backend.tests.factories import (TeamFactory, TeamMembershipFactory,
                                     UserFactory)


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTeamViewUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.get(url_for('api.teams'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTeamViewAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    def test_returns_correct_data(self, client, logged_in_user):
        team = TeamFactory()
        TeamMembershipFactory(
            team=team,
            user=logged_in_user
        )
        response = client.get(url_for('api.teams'))
        assert response.status_code == 200
        assert response.json == [{
            'slug': team.slug,
            'name': 'Beer drinkers',
            'id': team.id
        }]

    def test_doesnt_return_teams_user_is_not_part_of(self, client):
        TeamFactory()
        response = client.get(url_for('api.teams'))
        assert response.status_code == 200
        assert len(response.json) == 0


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTeamPostUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.post(url_for('api.teams'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestTeamPostAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory()

    @pytest.fixture
    def data(self):
        return {
            'name': 'New team'
        }

    def test_returns_415_for_wrong_content_type(self, client):
        response = client.post(url_for('api.teams'))
        assert response.status_code == 415

    def test_creates_team(self, client, data):
        response = client.post(
            url_for('api.teams'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert Team.query.count() == 1
        team = Team.query.one()
        assert team.name == 'New team'
        assert team.slug[:-3] == 'new-team-'

    def test_creates_initial_tab_types(self, client, data):
        response = client.post(
            url_for('api.teams'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert Team.query.count() == 1
        team = Team.query.one()
        tab_types = TabType.query.order_by(TabType.name).all()
        assert len(tab_types) == 2
        assert [tab_type.team for tab_type in tab_types] == [team, team]
        assert [tab_type.name for tab_type in tab_types] == ['Beer', 'Cider']
        assert [tab_type.price for tab_type in tab_types] == [1, 2]

    def test_creates_initial_persons(self, client, data, logged_in_user):
        response = client.post(
            url_for('api.teams'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert Person.query.count() == 1
        person = Person.query.one()
        assert person.name == logged_in_user.name


    def test_can_create_multiple_teams_with_no_slug_conflicts(
        self, client, data
    ):
        for i in range(10):
            response = client.post(
                url_for('api.teams'),
                data=json.dumps(data),
                content_type='application/json'
            )
            assert response.status_code == 201
            assert Team.query.count() == i + 1
