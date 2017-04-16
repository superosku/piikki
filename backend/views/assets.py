from flask import Blueprint, render_template, send_from_directory

assets = Blueprint('assets', __name__)


@assets.route('/')
def index():
    return send_from_directory('../', 'index.html')


@assets.route('/<path:path>')
def asset(path):
    return send_from_directory('../build', path)
