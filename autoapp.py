import datetime
import random

import click

from backend import create_app
from backend.models import (Person, TabItem, TabType, Team, TeamMembership,
                            User, db)

app = create_app()


@app.cli.command()
def threaded():
    app.run(threaded=True)


@app.cli.command()
def initdb():
    # for table in reversed(db.metadata.sorted_tables):
    #     db.engine.execute(table.delete())
    click.echo('Dropping db')
    db.drop_all()
    click.echo('Creating db')
    db.create_all()
    click.echo('Creating dummy data')

    # User
    user = User(
        email='test@test.fi',
        first_name='Test',
        last_name='User',
        registered_at=datetime.datetime.now(),
        is_invite=False
    )
    user.password = 'secret'
    db.session.add(user)

    # Teams
    team1 = Team(name='Beer drinking club', slug='beer-drinkers')
    db.session.add(team1)
    team2 = Team(name='Sandwich club', slug='bread-eaters')
    db.session.add(team2)

    # Team Memberships
    TeamMembership(user=user, team=team1, is_admin=True)
    TeamMembership(user=user, team=team2, is_admin=True)

    # Persons
    persons = [
        Person(team=team1, name='Pekka Piikkaaja'),
        Person(team=team1, name='Osku Oskunen'),
        Person(team=team1, name='Mira Miranen'),
        Person(team=team2, name='Mikko Jokunen'),
        Person(team=team2, name='Jaska Unkuri'),
    ]
    for i in range(10):
        persons.append(Person(team=team1, name='Testi Nro{}'.format(i)))
        persons.append(Person(team=team2, name='Testi Nro{}'.format(i)))
    for person in persons:
        db.session.add(person)

    # TabTypes
    db.session.add(TabType(name='Pilsner', price=1.5, team=team1))
    db.session.add(TabType(name='IPA', price=2.5, team=team1))
    db.session.add(TabType(name='Premium cider', price=3.5, team=team1))
    db.session.add(TabType(name='Small bread', price=1, team=team2))
    db.session.add(TabType(name='Sandwich', price=3, team=team2))
    db.session.add(TabType(name='Burger', price=5, team=team2))

    # TabItems
    for i in range(1000):
        price = int(random.randint(1, 5))
        amount = int(random.randint(1, 5))
        person = persons[i % 4]
        db.session.add(
            TabItem(
                name=['Item 1', 'Item 2', 'Item 3'][i % 3],
                price=price,
                amount=amount,
                person=person,
                adder=user,
                added_at=(
                    datetime.datetime.now() - datetime.timedelta(minutes=i)
                ),
                team=person.team
            )
        )

    db.session.commit()
    click.echo('Done')
