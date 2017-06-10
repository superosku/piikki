import json

import pytest
from flask import url_for

from backend import Person
from backend.tests.factories import (PersonFactory, TabItemFactory,
                                     TeamFactory, TeamMembershipFactory,
                                     UserFactory)


@pytest.mark.usefixtures('request_ctx', 'database')
class TestPersonViewUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.get(url_for('api.persons', team_slug='nothing'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestPersonViewAuthorized:
    @pytest.fixture
    def team(self):
        return TeamFactory()

    @pytest.fixture
    def logged_in_user(self, team):
        user = UserFactory()
        TeamMembershipFactory(team=team, user=user)
        return user

    def test_returns_404_for_team_not_part_of(self, client):
        team = TeamFactory(slug='not-mine')
        response = client.get(url_for('api.persons', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client):
        response = client.get(
            url_for('api.persons', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_correct_data(self, client, logged_in_user, team):
        PersonFactory(
            team=team,
            name='Pekka Unkuri'
        )
        person = PersonFactory(
            team=team,
            name='Mikko Puupää',
            disabled=True
        )
        TabItemFactory(
            person=person,
            adder=logged_in_user,
            team=team
        )
        TabItemFactory(
            person=person,
            adder=logged_in_user,
            team=team,
            price=10,
            amount=10
        )
        response = client.get(url_for('api.persons', team_slug=team.slug))
        assert response.status_code == 200
        expected_data = [
            {
                'total_depth': '102.00',
                'team_id': 1,
                'id': 2,
                'disabled': True,
                'name': 'Mikko Puupää'
            },
            {
                'total_depth': '0.00',
                'team_id': 1,
                'id': 1,
                'disabled': False,
                'name': 'Pekka Unkuri'
            },
        ]
        assert response.json == expected_data

    def test_doesnt_return_persons_from_wrong_teams(
        self, client, logged_in_user, team
    ):
        other_users_team = TeamFactory()
        TeamMembershipFactory(
            team=other_users_team,
            user=logged_in_user
        )
        other_team = TeamFactory()

        PersonFactory(team=other_team)
        PersonFactory(team=other_users_team)

        response = client.get(url_for('api.persons', team_slug=team.slug))
        assert response.status_code == 200
        assert response.json == []


@pytest.mark.usefixtures('request_ctx', 'database')
class TestOtherPersonEndpointsForAdmin:
    @pytest.fixture
    def team(self):
        return TeamFactory()

    @pytest.fixture
    def logged_in_user(self, team):
        return UserFactory(memberships=[
            TeamMembershipFactory.build(team=team, is_admin=True)
        ])

    def test_can_create(self, logged_in_user, client, team):
        response = client.post(
            url_for('api.persons', team_slug=team.slug),
            data=json.dumps({'name': 'Dan Drinker'}),
            content_type='application/json'
        )
        assert response.status_code == 200
        person = Person.query.filter_by(name='Dan Drinker').one()
        assert person.team == team

    def test_cant_create_to_other_team(self, logged_in_user, client):
        response = client.post(
            url_for('api.persons', team_slug=TeamFactory().slug),
            data=json.dumps({'name': 'Dan Drinker'}),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_can_edit(self, logged_in_user, client, team):
        person = PersonFactory(
            name='Dan Drinker',
            disabled=False,
            team=team
        )
        response = client.put(
            url_for('api.modify_person', team_slug=team.slug, person_id=person.id),
            data=json.dumps({'disabled': True}),
            content_type='application/json'
        )
        assert response.status_code == 200
        assert person.disabled is True

    def test_cant_edit_from_other_team(self, logged_in_user, client):
        person = PersonFactory(
            name='Dan Drinker',
            disabled=False,
            team=TeamFactory()
        )
        response = client.put(
            url_for(
                'api.modify_person',
                team_slug=person.team.slug,
                person_id=person.id
            ),
            data=json.dumps({'disabled': True}),
            content_type='application/json'
        )
        assert response.status_code == 404


@pytest.mark.usefixtures('request_ctx', 'database')
class TestOtherPersonEndpointsForMember:
    @pytest.fixture
    def team(self):
        return TeamFactory()

    @pytest.fixture
    def logged_in_user(self, team):
        return UserFactory(memberships=[
            TeamMembershipFactory.build(team=team, is_admin=False)
        ])

    def test_cant_create(self, logged_in_user, client, team):
        response = client.post(
            url_for('api.persons', team_slug=team.slug),
            data=json.dumps({'name': 'Dan Drinker'}),
            content_type='application/json'
        )
        assert response.status_code == 403
        assert Person.query.filter_by(name='Dan Drinker').count() == 0

    def test_cant_edit(self, logged_in_user, client, team):
        person = PersonFactory(
            name='Dan Drinker',
            disabled=False,
            team=team
        )
        response = client.put(
            url_for('api.modify_person', team_slug=team.slug, person_id=person.id),
            data=json.dumps({'disabled': True}),
            content_type='application/json'
        )
        assert response.status_code == 403
