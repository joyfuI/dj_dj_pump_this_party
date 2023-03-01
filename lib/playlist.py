from typing import Any

from lib.utill import find_index
from lib.youtube import Youtube


class Playlist:
    def __init__(self):
        self.playlist: list[Youtube] = []
        self.index: int = 0

    def get_current(self) -> Youtube:
        try:
            return self.playlist[self.index]
        except IndexError:
            return None

    def get(self, index: int) -> Youtube:
        try:
            return self.playlist[index]
        except IndexError:
            return None

    def add_after_current(self, url: str, extra: Any = None) -> None:
        self.playlist.insert(self.index + 1, Youtube(url, extra))

    def add_after_last(self, url: str, extra: Any = None) -> None:
        self.playlist.append(Youtube(url, extra))

    def del_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        if index < self.index:
            self.prev()
        self.playlist.pop(index)

    def up_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        if index > 0:
            if self.get_current() in [self.playlist[index], self.playlist[index - 1]]:
                if self.playlist[index] == self.get_current():
                    self.prev()
                else:
                    self.next()
            self.playlist[index], self.playlist[index - 1] = (
                self.playlist[index - 1],
                self.playlist[index],
            )

    def down_id(self, yt_id: int) -> None:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        if index < len(self.playlist) - 1:
            if self.get_current() in [self.playlist[index], self.playlist[index + 1]]:
                if self.playlist[index] == self.get_current():
                    self.next()
                else:
                    self.prev()
            self.playlist[index], self.playlist[index + 1] = (
                self.playlist[index + 1],
                self.playlist[index],
            )

    def next(self) -> Youtube:
        if self.index < len(self.playlist) - 1:
            self.index += 1
            return self.get_current()
        self.index = len(self.playlist) - 1
        return None

    def prev(self) -> Youtube:
        if self.index > 0:
            self.index -= 1
            return self.get_current()
        self.index = 0
        return None

    def find_id(self, yt_id: int) -> Youtube:
        index = find_index(lambda yt: yt.id == yt_id, self.playlist)
        return self.playlist[index]
