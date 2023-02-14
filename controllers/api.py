import os

from flask import Blueprint, jsonify, request

from lib.player import Player
from lib.youtube_music import search_song

basename = os.path.basename(__file__)
name = os.path.splitext(basename)[0]
blueprint = Blueprint(name, __name__, url_prefix="/api")

player = Player()


@blueprint.route("/player", methods=["GET"])
def get_player():
    playlist = player.playlist.playlist
    is_playing = player.is_playing()
    current = player.playlist.get_current().id
    return jsonify({"playlist": playlist, "isPlaying": is_playing, "current": current})


@blueprint.route("/item", methods=["POST"])
def post_item():
    nickname = request.headers.get('DDPTP-name')
    data = request.get_json()
    url = data["url"]
    player.playlist.add_after_last(url, nickname)
    return jsonify({})


@blueprint.route("/item/<int:yt_id>", methods=["DELETE"])
def delete_item(yt_id: int):
    player.playlist.del_id(yt_id)
    return jsonify({})


@blueprint.route("/item/<int:yt_id>/up", methods=["PUT"])
def put_item_up(yt_id: int):
    player.playlist.up_id(yt_id)
    return jsonify({})


@blueprint.route("/item/<int:yt_id>/down", methods=["PUT"])
def put_item_down(yt_id: int):
    player.playlist.down_id(yt_id)
    return jsonify({})


@blueprint.route("/player/play", methods=["PUT"])
def put_player_play():
    if player.is_playing():
        player.stop()
    else:
        player.play()
    return jsonify({})


@blueprint.route("/player/prev", methods=["PUT"])
def put_player_prev():
    if player.is_playing():
        player.stop()
        player.playlist.prev()
        player.play()
    else:
        player.playlist.prev()
    return jsonify({})


@blueprint.route("/player/next", methods=["PUT"])
def put_player_next():
    if player.is_playing():
        player.stop()
        player.playlist.next()
        player.play()
    else:
        player.playlist.next()
    return jsonify({})


@blueprint.route("/search", methods=["GET"])
def get_search_song():
    q = request.args["q"]
    result = search_song(q)
    return jsonify({"result": result})
