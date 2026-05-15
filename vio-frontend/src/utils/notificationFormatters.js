import { formatDistanceToNow } from 'date-fns';

export function getNotificationTitle(type, data) {
  switch (type) {
    case 'message':
      return data.sender?.username || 'New Message';
    case 'call':
      return `Incoming ${data.callType || 'Audio'} Call`;
    case 'call_missed':
      return 'Missed Call';
    case 'group_invite':
      return 'Group Invitation';
    case 'status_change':
      return 'Status Update';
    default:
      return 'Notification';
  }
}

export function getNotificationBody(type, data) {
  switch (type) {
    case 'message':
      return data.content || 'Sent an attachment';
    case 'call':
      return `${data.initiator?.username || 'Someone'} is calling you`;
    case 'call_missed':
      return `You missed a call from ${data.caller?.username || 'Someone'}`;
    case 'group_invite':
      return `You've been invited to join ${data.groupName || 'a group'}`;
    case 'status_change':
      return `${data.username} is now ${data.status}`;
    default:
      return '';
  }
}

export function getNotificationIcon(type) {
  const icons = {
    message: 'MessageSquare',
    call: 'Phone',
    call_missed: 'PhoneMissed',
    group_invite: 'UserPlus',
    status_change: 'User',
  };
  return icons[type] || 'Bell';
}

export function formatNotificationTime(timestamp) {
  if (!timestamp) return '';
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}
