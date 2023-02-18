from typing import Any

from ytmusicapi import YTMusic

# ytmusic = YTMusic(language="ko")
ytmusic = YTMusic("headers_auth.json", language="ko")


def _convert_data(item: dict[str, Any]) -> dict[str, Any]:
    artist = list(map(lambda artist: artist["name"], item["artists"]))
    artist = ", ".join(artist)
    return {
        "url": f"https://www.youtube.com/watch?v={item['videoId']}",
        "title": f'{item["title"]} - {artist}',
        "thumbnail": item["thumbnails"][-1]["url"],
    }


def search_song(query: str) -> list[dict]:
    result = ytmusic.search(query, filter="songs")
    result = list(map(_convert_data, result))
    return result
