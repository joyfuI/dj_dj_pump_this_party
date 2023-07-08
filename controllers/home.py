from flask import Blueprint, render_template

name = "home"
blueprint = Blueprint(name, __name__, url_prefix="/")


@blueprint.route("/")
def index():
    arg = {"name": name}
    return render_template(f"{name}.jinja", arg=arg)
