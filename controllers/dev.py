import os

from flask import Blueprint, jsonify, render_template, request

from lib.youtube_music import related_song

basename = os.path.basename(__file__)
name = os.path.splitext(basename)[0]
blueprint = Blueprint(name, __name__, url_prefix="/dev")


@blueprint.route("/")
def index():
    arg = {"name": name}
    return render_template(f"{name}.jinja", arg=arg)


@blueprint.route("/related", methods=["GET"])
def get_chart():
    q = request.args["q"]
    result = related_song(q)
    return jsonify(result)
