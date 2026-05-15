export function formatTimestamp(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.getDate() === now.getDate() && 
                  date.getMonth() === now.getMonth() && 
                  date.getFullYear() === now.getFullYear();
                  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.getDate() === yesterday.getDate() && 
                      date.getMonth() === yesterday.getMonth() && 
                      date.getFullYear() === yesterday.getFullYear();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeString; // or `Today ${timeString}` based on preference
  } else if (isYesterday) {
    return `Yesterday`; // or `Yesterday ${timeString}`
  } else {
    // e.g., "Jan 15"
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function formatMessageTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatMessageContent(content) {
  if (!content) return '';
  
  // Escape HTML
  let formatted = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Replace URLs with clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formatted = formatted.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });

  // Replace newlines with <br>
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

export function groupMessagesByDate(messages) {
  if (!messages || messages.length === 0) return {};
  
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt);
    // Use local date string as key, e.g., "5/15/2026"
    const dateKey = date.toLocaleDateString();
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    
    return groups;
  }, {});
}
