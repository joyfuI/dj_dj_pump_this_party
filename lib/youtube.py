import re
from dataclasses import dataclass
from typing import Any

import yt_dlp

_p = re.compile(
    r"^https?://((www\.|music\.)?youtube\.com|youtu.be)/(watch\?v=\S+|playlist\?list=\S+|\S+|browse/\S+)"
)


@dataclass
class Youtube:
    id: int
    video_id: str
    url: str
    title: str
    thumbnail: str
    duration: int
    extra: Any

    def __init__(self, url: str, extra: Any = None):
        if _p.match(url) is None:
            raise ValueError("유튜브 URL이 아닙니다.")
        self.id = id(self)
        self.url = url
        self.extra = extra
        self.refresh_info()
        self.video_id: str = self.info["id"]
        self.url: str = self.info["webpage_url"]
        self.title: str = (
            f"{self.info['title']} - {self.info['artist']}"
            if self.info.get("artist")
            else self.info["title"]
        )
        self.thumbnail: str = self.info["thumbnail"]
        self.duration: int = self.info["duration"]

    def refresh_info(self) -> None:
        self.info = Youtube.get_info(self.url)

    def get_bast_audio(self) -> dict[str, Any]:
        self.refresh_info()
        formats = self.info["formats"]
        format_id = self.info["format_id"].split("+")[-1]
        formats = list(filter(lambda format: format["format_id"] == format_id, formats))
        return formats[0]

    def get_bast_audio_url(self) -> str:
        return self.get_bast_audio()["url"]

    @staticmethod
    def get_info(url: str) -> dict[str, Any]:
        ydl_opts = {
            "format": "m4a/bestaudio/best",
            "noplaylist": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info

    @staticmethod
    def get_playlist_info(url: str) -> dict[str, Any]:
        ydl_opts = {
            "extract_flat": "in_playlist",
            "playlist_items": "1:100",
            "lazy_playlist": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            if info["_type"] != "playlist":
                raise ValueError("플레이리스트 URL이 아닙니다.")
            return info
