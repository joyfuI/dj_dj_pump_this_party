import os

from dotenv import load_dotenv

from lib.playlist import Playlist
from lib.utill import add_path_env
from lib.youtube import Youtube

load_dotenv(verbose=True)
VLC_PATH = os.getenv("VLC_PATH")
if VLC_PATH:
    add_path_env(VLC_PATH)

# import vlc
vlc = __import__("vlc")


class Player:
    def __init__(self):
        self.player = None
        self.volume = 100
        self.playlist = Playlist()

    def new_player(self, mrl: str):
        instance = vlc.MediaPlayer()
        # 재생 종료 콜백
        instance.event_manager().event_attach(
            vlc.EventType.MediaPlayerEndReached, self._callback_end
        )
        # 일시정지 콜백
        instance.event_manager().event_attach(
            vlc.EventType.MediaPlayerPaused, self._callback_pause
        )
        # 재생오류 콜백
        instance.event_manager().event_attach(
            vlc.EventType.MediaPlayerEncounteredError, self._callback_error
        )
        instance.audio_set_volume(self.volume)
        instance.set_mrl(mrl)
        return instance

    def is_playing(self) -> bool:
        if self.player is None:
            return False
        return bool(self.player.is_playing())

    def get_current(self) -> Youtube:
        return self.playlist.get_current()

    def play(self) -> bool:
        yt = self.get_current()
        print("재생", yt)
        if not yt:
            return False
        url = yt.get_bast_audio_url()
        self.player = self.new_player(url)
        result = self.player.play()  # 성공: 0, 실패: -1
        return result == 0

    def stop(self):
        if self.player is not None:
            self.player.stop()

    def pause(self) -> bool:
        playing = self.is_playing()
        if self.player is not None:
            self.player.pause()
        return not playing

    def get_volume(self) -> int:
        return self.volume  # 0 ~ 100

    def set_volume(self, volume: int) -> bool:
        if self.player is None:
            self.volume = volume
            return True
        result = self.player.audio_set_volume(volume)  # 성공: 0, 실패: -1
        if result == 0:
            self.volume = volume
        return result == 0

    def get_position(self) -> int:
        if self.player is None:
            return 0
        result = self.player.get_position()
        if result < 0:
            # -1을 반환할 때가 있음
            return 0
        return result * 100  # 0 ~ 100

    def set_position(self, position: int):
        return self.player.set_position(position / 100)

    # 재생 종료 콜백
    def _callback_end(self, _):
        print("영상종료")
        # 다음영상 재생
        if self.playlist.next() is None:
            # 마지막 영상이 끝나면 처음 영상부터 다시시작
            self.playlist.index = 0
        self.play()

    # 일시정지 콜백
    def _callback_pause(self, _):
        print("일시정지")

    # 재생오류 콜백
    def _callback_error(self, _):
        print("오류")
        # 재시도
        self.play()
