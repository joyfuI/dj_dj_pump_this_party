import os

from dotenv import load_dotenv

from lib.playlist import Playlist
from lib.utill import add_path_env

load_dotenv(verbose=True)
VLC_PATH = os.getenv("VLC_PATH")
if VLC_PATH:
    add_path_env(VLC_PATH)

# import vlc
vlc = __import__("vlc")


class Player:
    def __init__(self):
        self.player = vlc.MediaPlayer()
        self.playlist = Playlist()
        # 재생이 끝나면 콜백 호출
        self.player.event_manager().event_attach(
            vlc.EventType.MediaPlayerEndReached, self._callback_end
        )

    def is_playing(self) -> bool:
        return bool(self.player.is_playing())

    def play(self) -> bool:
        yt = self.playlist.get_current()
        print("재생", yt)
        if not yt:
            return False
        print("재생1")
        url = yt.get_bast_audio_url()
        print("재생2", url)
        self.player.set_mrl(url)
        print("재생3")
        result = self.player.play()  # 성공: 0, 실패: -1
        print("재생4", result)
        return result == 0

    def stop(self) -> None:
        self.player.stop()

    def pause(self) -> bool:
        playing = self.is_playing()
        self.player.pause()
        return not playing

    def _callback_end(self, _):
        print("재생 종료")
        self.playlist.next()
        print("재생 종료1")
        self.play()  # 여기가 문제
        print("재생 종료2")
