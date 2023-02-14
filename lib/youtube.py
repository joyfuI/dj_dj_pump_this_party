import re
from dataclasses import dataclass
from typing import Any

import yt_dlp

_p = re.compile(
    r"(http:|https:)?(\/\/)?(www\.)?(youtube.com|youtu.be)\/(watch|embed)?(\?v=|\/)?(\S+)?"
)


@dataclass
class Youtube:
    id: int
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
        self.url: str = self.info["webpage_url"]
        self.title: str = (
            f"{self.info['title']} - {self.info['artist']}"
            if self.info.get("artist")
            else self.info["title"]
        )
        self.thumbnail: str = self.info["thumbnail"]
        self.duration: int = self.info["duration"]

    def refresh_info(self) -> None:
        ydl_opts = {
            "format": "m4a/bestaudio/best",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            self.info = ydl.extract_info(self.url, download=False)

    def get_bast_audio(self) -> dict[str, Any]:
        self.refresh_info()
        formats = self.info["formats"]
        format_id = self.info["format_id"].split("+")[-1]
        formats = list(filter(lambda format: format["format_id"] == format_id, formats))
        return formats[0]

    def get_bast_audio_url(self) -> str:
        return self.get_bast_audio()["url"]
