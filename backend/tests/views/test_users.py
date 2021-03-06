import datetime
import json

import pytest
from flask import url_for

from backend import TabItem, User, TeamMembership
from backend.tests.factories import (PersonFactory, TabItemFactory,
                                     TabTypeFactory, TeamFactory,
                                     TeamMembershipFactory, UserFactory)


@pytest.mark.usefixtures('request_ctx', 'database')
class TestUsersIndexUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.get(url_for('api.users', team_slug='none'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestUsersInviteUnauthorized:
    def test_returns_401_for_unauthorized(self, client):
        response = client.post(url_for('api.users_invite', team_slug='none'))
        assert response.status_code == 401


@pytest.mark.usefixtures('request_ctx', 'database')
class TestUsersIndexAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory(email='owner@email.fi')

    def test_returns_404_for_team_not_part_of(self, client, logged_in_user):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.get(url_for('api.users', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client, logged_in_user):
        response = client.get(
            url_for('api.users', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_correct_data(self, client, logged_in_user):
        team = TeamFactory(slug='my-team')
        TeamMembershipFactory(user=logged_in_user, team=team)
        TeamMembershipFactory(
            user=UserFactory(email='first@email.fi'),
            team=team,
            is_admin=True
        )
        user = UserFactory(email='second@email.fi')
        TeamMembershipFactory(
            user=user,
            team=team,
            is_admin=False
        )
        TeamMembershipFactory(
            user=user,
            team=TeamFactory(),
            is_admin=True
        )
        TeamMembershipFactory(
            user=UserFactory(),
            team=TeamFactory()
        )
        response = client.get(
            url_for('api.users', team_slug='my-team')
        )
        assert response.status_code == 200
        assert response.json == [
            {'id': 1, 'is_admin': False, 'email': 'owner@email.fi'},
            {'id': 2, 'is_admin': True, 'email': 'first@email.fi'},
            {'id': 3, 'is_admin': False, 'email': 'second@email.fi'}
        ]


@pytest.mark.usefixtures('request_ctx', 'database')
class TestUsersInviteAuthorized:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory(email='owner@email.fi')

    @pytest.fixture
    def data(self):
        return {
            'email': 'new@user.fi',
            'is_admin': False
        }

    def test_returns_404_for_team_not_part_of(self, client, logged_in_user):
        team = TeamFactory(slug='not-mine')
        TabTypeFactory(team=team)
        response = client.post(url_for('api.users_invite', team_slug='not-mine'))
        assert response.status_code == 404

    def test_returns_404_for_non_existing_team(self, client, logged_in_user):
        response = client.post(
            url_for('api.users_invite', team_slug='non-existent')
        )
        assert response.status_code == 404

    def test_returns_correct_data(self, client, logged_in_user, data):
        team = TeamFactory(slug='mine')
        UserFactory(email='new@user.fi')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        response = client.post(
            url_for('api.users_invite', team_slug='mine'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        assert response.json == [
            {'is_admin': True, 'email': 'owner@email.fi', 'id': 1},
            {'is_admin': False, 'email': 'new@user.fi', 'id': 2}
        ]

    def test_returns_error_when_no_user_exists(
        self, client, logged_in_user, data
    ):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        response = client.post(
            url_for('api.users_invite', team_slug='mine'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert User.query.filter_by(email='new@user.fi').count() == 0

    def test_invites_existing_user(
        self, client, logged_in_user, data
    ):
        data['is_admin'] = True
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        UserFactory(email='new@user.fi')
        response = client.post(
            url_for('api.users_invite', team_slug='mine'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 201
        user = User.query.filter_by(email='new@user.fi').one()
        assert user.is_invite is False
        assert user.first_name == 'Pekka'
        assert user.last_name == 'Puupää'
        membership = TeamMembership.query.filter_by(user=user).one()
        assert membership.is_admin is True

    def test_returns_400_when_inviting_already_invited_user(
        self, client, logged_in_user, data
    ):
        data['is_admin'] = False
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(team=team, user=logged_in_user, is_admin=True)
        other_user = UserFactory(email='new@user.fi')
        TeamMembershipFactory(team=team, user=other_user)
        response = client.post(
            url_for('api.users_invite', team_slug='mine'),
            data=json.dumps(data),
            content_type='application/json'
        )
        assert response.status_code == 400
        assert response.json == {
            'errors': {'email': ['User is already part of the team.']}
        }


@pytest.mark.usefixtures('request_ctx', 'database')
class TestDeleteUserMembership:
    @pytest.fixture
    def logged_in_user(self):
        return UserFactory(email='owner@email.fi')

    def test_returns_404_for_team_not_part_of(self, client, logged_in_user):
        team = TeamFactory(slug='not-mine')
        user = UserFactory()
        TeamMembershipFactory(user=user, team=team)
        response = client.delete(url_for(
            'api.remove_user', team_slug='not-mine', user_id=user.id
        ))
        assert response.status_code == 404

    def test_deletes_membership(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        user = UserFactory()
        TeamMembershipFactory(user=user, team=team)
        TeamMembershipFactory(user=logged_in_user, team=team)
        response = client.delete(url_for(
            'api.remove_user', team_slug='mine', user_id=user.id
        ))
        assert response.status_code == 200
        assert TeamMembership.query.filter_by(user=user).count() == 0

    def test_cant_delete_self(self, client, logged_in_user):
        team = TeamFactory(slug='mine')
        TeamMembershipFactory(user=logged_in_user, team=team)
        response = client.delete(url_for(
            'api.remove_user', team_slug='mine', user_id=logged_in_user.id
        ))
        assert response.status_code == 400
        assert TeamMembership.query.filter_by(user=logged_in_user).count() == 1

