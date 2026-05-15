export function validateGroupName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Group name must be at least 2 characters long' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Group name must be less than 50 characters' };
  }
  return { valid: true };
}

export function validateGroupDescription(description) {
  if (description && description.length > 150) {
    return { valid: false, error: 'Description must be less than 150 characters' };
  }
  return { valid: true };
}

export function validateTopicName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Topic name must be at least 2 characters long' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Topic name must be less than 50 characters' };
  }
  return { valid: true };
}

export function validateGroupMembers(memberIds) {
  if (!memberIds || memberIds.length < 2) {
    return { valid: false, error: 'A group must have at least 2 members' };
  }
  if (memberIds.length > 500) {
    return { valid: false, error: 'Maximum 500 members allowed' };
  }
  return { valid: true };
}

export function validateTopics(topics) {
  if (!topics || topics.length < 1) {
    return { valid: false, error: 'A supergroup must have at least 1 topic' };
  }
  return { valid: true };
}
