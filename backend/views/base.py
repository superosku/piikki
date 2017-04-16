from functools import wraps

from flask import Blueprint, abort, render_template
from flask_jwt import current_identity


def team_view(f):
    @wraps(f)
    def decorated_function(team_slug, *args, **kwargs):
        from backend import Team
        team = Team.query.filter_by(slug=team_slug).first_or_404()
        if team not in [
            membership.team for membership in current_identity.memberships
        ]:
            abort(404)
        return f(team, *args, **kwargs)
    return decorated_function
