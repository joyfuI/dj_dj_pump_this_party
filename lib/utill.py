import os
import sys
from typing import Callable, List, TypeVar


def add_path_env(path: str) -> None:
    path_list = os.environ["PATH"].split(os.pathsep)
    path_list.append(path)
    path_list = list(filter(None, path_list))
    os.environ["PATH"] = os.pathsep.join(path_list)


T = TypeVar("T")


def find(pred: Callable[[T], bool], iterable: List[T]) -> T:
    for item in iterable:
        if pred(item):
            return item
    return None


def find_index(pred: Callable[[T], bool], iterable: List[T]) -> int:
    for index, item in enumerate(iterable):
        if pred(item):
            return index
    return None


def get_execute_path() -> str:
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    else:
        return os.path.dirname(os.path.abspath(os.path.join(__file__, "..")))
