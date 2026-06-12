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

class EmbedMessageRequest(_message.Message):
    __slots__ = ("message_id", "conversation_id", "sender_id", "content", "created_at", "is_group")
    MESSAGE_ID_FIELD_NUMBER: _ClassVar[int]
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    SENDER_ID_FIELD_NUMBER: _ClassVar[int]
    CONTENT_FIELD_NUMBER: _ClassVar[int]
    CREATED_AT_FIELD_NUMBER: _ClassVar[int]
    IS_GROUP_FIELD_NUMBER: _ClassVar[int]
    message_id: str
    conversation_id: str
    sender_id: str
    content: str
    created_at: str
    is_group: bool
    def __init__(self, message_id: _Optional[str] = ..., conversation_id: _Optional[str] = ..., sender_id: _Optional[str] = ..., content: _Optional[str] = ..., created_at: _Optional[str] = ..., is_group: bool = ...) -> None: ...

class EmbedMessageResponse(_message.Message):
    __slots__ = ("success", "error")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    ERROR_FIELD_NUMBER: _ClassVar[int]
    success: bool
    error: str
    def __init__(self, success: bool = ..., error: _Optional[str] = ...) -> None: ...

class SeedChatsRequest(_message.Message):
    __slots__ = ("conversation_id", "is_group", "chats")
    CONVERSATION_ID_FIELD_NUMBER: _ClassVar[int]
    IS_GROUP_FIELD_NUMBER: _ClassVar[int]
    CHATS_FIELD_NUMBER: _ClassVar[int]
    conversation_id: str
    is_group: bool
    chats: _containers.RepeatedCompositeFieldContainer[ChatMessage]
    def __init__(self, conversation_id: _Optional[str] = ..., is_group: bool = ..., chats: _Optional[_Iterable[_Union[ChatMessage, _Mapping]]] = ...) -> None: ...

class SeedChatsResponse(_message.Message):
    __slots__ = ("success", "message")
    SUCCESS_FIELD_NUMBER: _ClassVar[int]
    MESSAGE_FIELD_NUMBER: _ClassVar[int]
    success: bool
    message: str
    def __init__(self, success: bool = ..., message: _Optional[str] = ...) -> None: ...
