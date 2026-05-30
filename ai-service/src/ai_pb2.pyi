from google.protobuf.internal import containers as _containers
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from collections.abc import Iterable as _Iterable, Mapping as _Mapping
from typing import ClassVar as _ClassVar, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class AIRequest(_message.Message):
    __slots__ = ("prompt",)
    PROMPT_FIELD_NUMBER: _ClassVar[int]
    prompt: str
    def __init__(self, prompt: _Optional[str] = ...) -> None: ...

class AIResponse(_message.Message):
    __slots__ = ("response",)
    RESPONSE_FIELD_NUMBER: _ClassVar[int]
    response: str
    def __init__(self, response: _Optional[str] = ...) -> None: ...

class ChatMessage(_message.Message):
    __slots__ = ("username", "message", "created_at")
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    username: str
    message: str
    created_at: str
    def __init__(self, username: _Optional[str] = ..., message: _Optional[str] = ..., created_at: _Optional[str] = ...) -> None: ...

class GroupDetails(_message.Message):
    __slots__ = ("group_id", "group_name")
    GROUP_ID_FIELD_NUMBER: _ClassVar[int]
    GROUP_NAME_FIELD_NUMBER: _ClassVar[int]
    group_id: int
    group_name: str
    def __init__(self, group_id: _Optional[int] = ..., group_name: _Optional[str] = ...) -> None: ...

class ProcessQueryRequest(_message.Message):
    __slots__ = ("group", "chats", "query", "user_id", "username")
    GROUP_FIELD_NUMBER: _ClassVar[int]
    CHATS_FIELD_NUMBER: _ClassVar[int]
    QUERY_FIELD_NUMBER: _ClassVar[int]
    USER_ID_FIELD_NUMBER: _ClassVar[int]
    USERNAME_FIELD_NUMBER: _ClassVar[int]
    group: GroupDetails
    chats: _containers.RepeatedCompositeFieldContainer[ChatMessage]
    query: str
    user_id: str
    username: str
    def __init__(self, group: _Optional[_Union[GroupDetails, _Mapping]] = ..., chats: _Optional[_Iterable[_Union[ChatMessage, _Mapping]]] = ..., query: _Optional[str] = ..., user_id: _Optional[str] = ..., username: _Optional[str] = ...) -> None: ...

class ProcessQueryResponse(_message.Message):
    __slots__ = ("response",)
    RESPONSE_FIELD_NUMBER: _ClassVar[int]
    response: str
    def __init__(self, response: _Optional[str] = ...) -> None: ...
