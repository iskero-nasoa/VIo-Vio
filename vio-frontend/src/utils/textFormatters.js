export function escapeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function linkifyText(text) {
  if (!text) return '';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
  });
}

export function formatMentions(text) {
  if (!text) return '';
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  return text.replace(mentionRegex, function(match, username) {
    return `<span class="text-primary font-semibold bg-primary/10 px-1 rounded cursor-pointer hover:bg-primary/20">${match}</span>`;
  });
}

export function splitIntoLines(text) {
  if (!text) return [];
  return text.split('\n');
}
