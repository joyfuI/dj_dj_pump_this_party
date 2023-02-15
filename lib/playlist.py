from typing import Any

from lib.utill import find_index
from lib.youtube import Youtube


class Playlist:
    def __init__(self):
        self.playlist: list[Youtube] = []
        self.index: int = 0

    def get_current(self) -> Youtube:
        return self.playlist[self.index]

    def add_after_current(self, url: str) -> None:
        self.playlist.insert(self.index + 1, Youtube(url))

    def add_after_last(self, url: str, extra: Any = None) -> None:
        self.playlist.append(Youtube(url, extra))

    def del_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        self.playlist.pop(index)

    def up_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        if index > 0:
            self.playlist[index], self.playlist[index - 1] = (
                self.playlist[index - 1],
                self.playlist[index],
            )

    def down_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        if index < len(self.playlist) - 1:
            self.playlist[index], self.playlist[index + 1] = (
                self.playlist[index + 1],
                self.playlist[index],
            )

    def next(self) -> Youtube:
        if self.index < len(self.playlist) - 1:
            self.index += 1
            return self.get_current()
        return None

    def prev(self) -> Youtube:
        if self.index > 0:
            self.index -= 1
            return self.get_current()
        return None
