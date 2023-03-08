import os

from flask import Blueprint, jsonify, request
from yt_dlp.utils import DownloadError

from lib.player import Player
from lib.youtube_music import get_charts, search_song

basename = os.path.basename(__file__)
name = os.path.splitext(basename)[0]
blueprint = Blueprint(name, __name__, url_prefix="/api")

player = Player()


@blueprint.route("/player", methods=["GET"])
def get_player():
    playlist = player.playlist.playlist
    is_playing = player.is_playing()
    current = player.get_current()
    volume = player.get_volume()
    position = player.get_position()
    auto_add = player.get_auto_add()
    return jsonify(
        {
            "playlist": playlist,
            "isPlaying": is_playing,
            "current": current.id if current is not None else None,
            "volume": volume,
            "position": position,
            "isAutoAdd": auto_add,
        }
    )


@blueprint.route("/item", methods=["POST"])
def post_item():
    data = request.get_json()
    url = data["url"]
    position = data.get("position")
    if position == "current":
        player.playlist.add_after_current(url, request.remote_addr)  # 현재 곡 뒤에 추가
    else:
        player.playlist.add_after_last(url, request.remote_addr)  # 맨 마지막에 추가
    return jsonify({})


@blueprint.route("/item/<int:yt_id>", methods=["DELETE"])
def delete_item(yt_id: int):
    if player.is_playing() and player.get_current() == player.playlist.find_id(yt_id):
        player.stop()
        player.playlist.del_id(yt_id)
        player.play()
    else:
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


@blueprint.route("/items", methods=["DELETE"])
def delete_items():
    data = request.get_json()
    delete_type = data.get("type")
    if delete_type == "all":
        player.stop()
        for item in player.playlist.playlist:
            player.playlist.del_id(item.id)
    elif delete_type == "past":
        for i in reversed(range(player.playlist.index)):
            player.playlist.del_id(player.playlist.get(i).id)
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


@blueprint.route("/player/volume", methods=["PUT"])
def put_player_volume():
    data = request.get_json()
    volume = data["volume"]
    player.set_volume(volume)
    return jsonify({})


@blueprint.route("/search", methods=["GET"])
def get_search():
    q = request.args["q"]
    result = search_song(q)
    return jsonify({"result": result})


@blueprint.route("/chart/<category>", methods=["GET"])
def get_chart(category: str):
    result = get_charts(category)
    return jsonify({"result": result})


@blueprint.route("/player/autoadd", methods=["PUT"])
def put_player_autoadd():
    player.toggle_auto_add()
    return jsonify({})


# 유튜브 영상 정보 가져오기 오류 처리
@blueprint.app_errorhandler(DownloadError)
def download_error(e: DownloadError):
    return jsonify({"message": e.msg}), 404


# 잘못된 URL 오류 처리
@blueprint.app_errorhandler(ValueError)
def value_error(e: ValueError):
    return jsonify({"message": str(e)}), 400
