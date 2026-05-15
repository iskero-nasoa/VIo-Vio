import React from 'react';

export function highlightSearchText(text, query) {
  if (!query || !text) return text;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{part}</mark> 
          : part
      )}
    </span>
  );
}

export function formatSearchResult(result, type) {
  switch (type) {
    case 'user':
      return {
        id: result._id,
        title: result.username,
        subtitle: result.email,
        image: result.avatar,
        status: result.status
      };
    case 'chat':
      return {
        id: result._id,
        title: result.name || result.chatName,
        subtitle: result.lastMessage?.content || 'No messages yet',
        image: result.avatar,
        unread: result.unreadCount
      };
    case 'message':
      return {
        id: result._id,
        title: result.sender?.username || 'System',
        subtitle: result.content,
        image: result.sender?.avatar,
        timestamp: result.createdAt,
        chatName: result.chat?.name || result.chat?.chatName
      };
    default:
      return result;
  }
}

export function groupSearchResults(results) {
  const groups = {
    users: results.users || [],
    chats: results.chats || [],
    messages: results.messages || []
  };
  return groups;
}
