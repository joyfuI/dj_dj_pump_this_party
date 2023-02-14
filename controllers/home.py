import os

from flask import Blueprint, render_template

basename = os.path.basename(__file__)
name = os.path.splitext(basename)[0]
blueprint = Blueprint(name, __name__, url_prefix="/")


@blueprint.route("/")
def index():
    arg = {"name": name}
    return render_template(f"{name}.jinja", arg=arg)
