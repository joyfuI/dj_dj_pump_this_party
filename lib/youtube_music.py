from typing import Any

from ytmusicapi import YTMusic

# ytmusic = YTMusic(language="ko")
ytmusic = YTMusic("headers_auth.json", language="ko")


def _convert_data(item: dict[str, Any]) -> dict[str, Any]:
    artist = map(lambda artist: artist["name"], item["artists"])
    artist = filter(lambda artist: not artist.startswith("조회수"), artist)
    artist = filter(lambda artist: not artist.startswith("좋아요"), artist)
    artist = ", ".join(list(artist))
    thumbnail = item.get("thumbnails", item.get("thumbnail"))
    thumbnail = thumbnail[-1]["url"]
    return {
        "video_id": item["videoId"],
        "url": f"https://www.youtube.com/watch?v={item['videoId']}",
        "title": f'{item["title"]} - {artist}',
        "thumbnail": thumbnail,
    }


def search_song(query: str) -> list[dict]:
    result = ytmusic.search(query, filter="songs")
    result = list(map(_convert_data, result))
    return result


def get_charts(category: str) -> list[dict]:
    # songs: 인기곡, videos: 인기 뮤직비디오, trending: 인기 급상승 동영상
    charts = ytmusic.get_charts("KR")
    result = charts.get(category, None)
    if result is None:
        result = charts["songs"]
    result = list(map(_convert_data, result["items"]))
    return result


def related_song(videoId: str) -> list[dict]:
    result = ytmusic.get_watch_playlist(videoId)
    result = list(map(_convert_data, result["tracks"]))
    return result
