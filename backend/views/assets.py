import os

import sys
from flask import Blueprint, send_from_directory, render_template

from webpack_manifest import webpack_manifest

assets = Blueprint('assets', __name__)


@assets.route('/')
def index():
    manifest = webpack_manifest.load(
        path=os.path.join(sys.path[0], 'build', 'webpack_manifest.json'),
        static_url='/'
    )
    js_path = manifest.javascript.rel_js[0].split('/')[-1]
    css_path = manifest.styles.rel_css[0].split('/')[-1]
    # from pdb import set_trace; set_trace()
    return render_template('index.html', js_path=js_path, css_path=css_path)


@assets.route('/<path:path>')
def asset(path):
    return send_from_directory('../build', path)
