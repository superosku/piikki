import datetime

from flask_sqlalchemy import SQLAlchemy
from passlib.hash import pbkdf2_sha256
from sqlalchemy import ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property

db = SQLAlchemy()


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    slug = db.Column(db.String(40), unique=True)

    def __repr__(self):
        return "<Team name='{}' slug='{}'>".format(self.name, self.slug)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    hash = db.Column(db.String)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    registered_at = db.Column(db.DateTime, nullable=False)

    is_invite = db.Column(db.Boolean, nullable=False)

    @property
    def name(self):
        return '{} {}'.format(self.first_name, self.last_name)

    @property
    def password(self):
        raise Exception('Cannot get password')

    @password.setter
    def password(self, password):
        self.hash = pbkdf2_sha256.hash(password)

    def check_password(self, password):
        return pbkdf2_sha256.verify(password, self.hash)

    def __repr__(self):
        return "<User email='{}' name='{}'>".format(self.email, self.name)


class TeamMembership(db.Model):
    __tablename__ = 'TeamMembership'

    team_id = db.Column(
        db.Integer, ForeignKey(Team.id), nullable=False, primary_key=True
    )
    team = db.relationship(
        Team,
        backref='memberships'
    )

    user_id = db.Column(
        db.Integer, ForeignKey(User.id), nullable=False, primary_key=True
    )
    user = db.relationship(
        User,
        backref='memberships'
    )

    is_admin = db.Column(
        db.Boolean, default=False, nullable=False
    )

    # __table_args__ = (
    #     db.ForeignKeyConstraint(
    #         columns=('team_id', 'user_id'),
    #         refcolumns=(Team.id, User.id),
    #         name='team_membership_team_id_user_id_fkey'
    #         # name='tab_item_team_id_person_id_fkey'
    #     ),
    # )


class Person(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    team_id = db.Column(
        db.Integer,
        ForeignKey(Team.id),
        nullable=False
    )
    team = db.relationship(
        Team,
        backref='persons'
    )

    disabled = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint(id, team_id),
    )

    def __repr__(self):
        return "<Person name='{}' team='{}'>".format(self.name, self.team.name)


class TabType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    price = db.Column(db.Numeric(precision=4, scale=2))

    team_id = db.Column(
        db.Integer,
        ForeignKey(Team.id),
        nullable=False
    )
    team = db.relationship(Team)

    def __repr__(self):
        return "<TabType name='{}' price='{}'>".format(
            self.name, self.price
        )


class TabItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String, nullable=False)

    price = db.Column(db.Numeric(precision=10, scale=2), nullable=False)
    amount = db.Column(db.Integer, nullable=False)

    @property
    def can_be_deleted(self):
        return (
            self.added_at + datetime.timedelta(hours=1) >
            datetime.datetime.now()
        )

    @property
    def total(self):
        return self.price * self.amount

    @hybrid_property
    def total(cls):
        return cls.price * cls.amount

    added_at = db.Column(db.DateTime, nullable=False)

    team_id = db.Column(
        db.Integer,
        ForeignKey(Team.id),
        nullable=False
    )
    team = db.relationship(Team)

    person_id = db.Column(
        db.Integer,
        ForeignKey(Person.id),
        nullable=False
    )
    person = db.relationship(
        Person,
        foreign_keys=[person_id]
    )

    adder_id = db.Column(
        db.Integer,
        ForeignKey(User.id),
        nullable=False
    )
    adder = db.relationship(User)


    __table_args__ = (
        db.ForeignKeyConstraint(
            columns=('team_id', 'person_id'),
            refcolumns=(Person.team_id, Person.id),
            name='tab_item_team_id_person_id_fkey'
        ),
    )

    def __repr__(self):
        return "<TabItem price='{}' amount='{}' total='{}' name='{}' >".format(
            self.price, self.amount, self.total, self.name
        )
