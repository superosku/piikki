import pytest
from flask import url_for

from backend.tests.factories import TeamFactory, UserFactory, \
    TeamMembershipFactory, PersonFactory, TabItemFactory


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
