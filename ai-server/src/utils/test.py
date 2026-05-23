# import asyncio
# from datetime import datetime, timedelta
# from pydantic import BaseModel
# from typing import List, Optional

# # Replicating necessary schemas for a self-contained test
# class ChatSchema(BaseModel):
#     username: str
#     message: str
#     created_at: datetime

# class ChatChunkSchema(BaseModel):
#     chats_set: str
#     sent_by_users: List[str]
#     start_time: Optional[datetime]
#     end_time: Optional[datetime]

# class TestChatChunking:
#     def __init__(self):
#         self.MAX_TIME_GAP_MINUTES = 10

#     async def _chunk_chat_history(self, chats: list[ChatSchema]) -> list[ChatChunkSchema]:
#         chunks: list[ChatChunkSchema] = []
#         last_chat_time: datetime | None = None
#         current_chunk_text = ""
#         chunk_start_time: datetime | None = None
#         current_chunk_usernames: list[str] = []
        
        
#         for chat in chats:
#             current_chat_time = chat.created_at
            
#             # [10:01 AM] Alice: Hey
#             formatted_text = f"[{current_chat_time.strftime('%H:%M')}] {chat.username}: {chat.message}\n"
#             current_user = chat.username
            
#             # If first chat or we fine 10 mins gap, then start new text
#             if last_chat_time is None or (current_chat_time - last_chat_time) > timedelta(minutes=self.MAX_TIME_GAP_MINUTES):
                
#                 if current_chunk_text:
#                     chunks.append(
#                         ChatChunkSchema(
#                             chats_set=current_chunk_text.strip(), 
#                             start_time=chunk_start_time, 
#                             end_time=last_chat_time,
#                             sent_by_users=current_chunk_usernames, 
#                         )
#                     )
#                     current_chunk_text = ""
#                     current_chunk_usernames.clear()
                    
#                 current_chunk_usernames.append(current_user)
#                 current_chunk_text = formatted_text
#                 chunk_start_time = current_chat_time
                
            
#             else:
#                 current_chunk_text += formatted_text
#                 current_chunk_usernames.append(current_user)
                
#             last_chat_time = current_chat_time
            
#         # Appending final chunk, since it will surely miss outside the loop
#         if current_chunk_text:
#             chunks.append(
#                 ChatChunkSchema(
#                     chats_set=current_chunk_text.strip(), 
#                     start_time=chunk_start_time, 
#                     end_time=last_chat_time,
#                     sent_by_users=current_chunk_usernames, 
#                 )
#             )
        
        
#         return chunks

# async def main():
#     # Dummy data from the user's request body
#     chat_data = [
#         {
#             "username": "alice",
#             "message": "So whats up everone??",
#             "created_at": "2024-12-25T15:30:00"
#         },
#         {
#             "username": "bob",
#             "message": "Nothing just chillin",
#             "created_at": "2024-12-25T15:32:01"
#         },
#         {
#             "username": "alice",
#             "message": "Looks good",
#             "created_at": "2024-12-25T15:34:04"
#         },
#         {
#             "username": "charlie",
#             "message": "looks like I replied late..",
#             "created_at": "2024-12-25T15:50:20"
#         }
#     ]

#     # Parse the raw data into ChatSchema objects
#     chats = [ChatSchema(**data) for data in chat_data]

#     # Instantiate the test class and run the method
#     tester = TestChatChunking()
#     chunks_result = await tester._chunk_chat_history(chats)

#     # Print the results
#     print(f"Total chunks created: {len(chunks_result)}\n")
#     for i, chunk in enumerate(chunks_result):
#         print(f"--- Chunk {i+1} ---")
#         print(f"Users: {chunk.sent_by_users}")
#         print(f"Start Time: {chunk.start_time}")
#         print(f"End Time: {chunk.end_time}")
#         print("Transcript:")
#         print(chunk.chats_set)
#         print("-" * (13 + len(str(i+1))))
#         print("\n")


# if __name__ == "__main__":
#     asyncio.run(main())