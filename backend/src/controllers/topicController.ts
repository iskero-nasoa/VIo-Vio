// Topics are managed through supergroupController — re-export for backwards compat
export {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicMessages,
} from "./supergroupController";
