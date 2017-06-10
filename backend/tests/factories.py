import datetime

import factory
from factory import Factory

from backend import TabType, Team, TeamMembership, User, db, TabItem, Person


class SQLAlchemyModelFactory(Factory):
    @classmethod
    def _create(cls, target_class, *args, **kwargs):
        """Create an instance of the model, and save it to the database."""

        obj = target_class(*args, **kwargs)
        db.session.add(obj)
        # The db session should be flushed, as described in
        # https://github.com/rbarrois/factory_boy/issues/81
        # However, changing commit->flush seems to break some magic that our
        # tests rely on. For example commit seems to coerce string dates to
        # date objects.
        db.session.commit()
        return obj


class UserFactory(SQLAlchemyModelFactory):
    class Meta:
        model = User

    first_name = 'Pekka'
    last_name = 'Puupää'
    email = factory.Sequence(lambda n: 'user-{}@test.fi'.format(n))
    registered_at = datetime.datetime.now()
    password = 'secret'
    is_invite = False


class TeamFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Team

    name = 'Beer drinkers'
    slug = factory.Sequence(lambda n: 'beer-drinkers-{}'.format(n))


class TeamMembershipFactory(SQLAlchemyModelFactory):
    class Meta:
        model = TeamMembership

    is_admin = False


class TabTypeFactory(SQLAlchemyModelFactory):
    class Meta:
        model = TabType

    name = 'Beer'
    price = 2


class TabItemFactory(SQLAlchemyModelFactory):
    class Meta:
        model = TabItem

    name = 'Beer'
    price = 2
    amount = 1

    added_at = datetime.datetime.now()


class PersonFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Person

    name = 'Pekka Piikkaaja'
