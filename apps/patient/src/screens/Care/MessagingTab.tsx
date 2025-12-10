/**
 * Messaging Tab
 */

import { useState } from 'react';
import {
  emojiCategories,
  conversations,
  availableRecipients,
  ConversationsList,
  ConversationDetail,
  NewMessageView,
} from './messaging-tab';

export default function MessagingTab(): React.ReactElement {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageText, setNewMessageText] = useState('');

  const activeConvo = conversations.find((c) => c.id === selectedConvo);

  const handleNewMessageBack = (): void => {
    setShowNewMessage(false);
    setNewMessageRecipient('');
    setNewMessageText('');
  };

  const handleSendNewMessage = (): void => {
    // In real app, would send the message
    handleNewMessageBack();
  };

  // New Message View
  if (showNewMessage) {
    return (
      <NewMessageView
        recipients={availableRecipients}
        selectedRecipientId={newMessageRecipient}
        messageText={newMessageText}
        onSelectRecipient={setNewMessageRecipient}
        onMessageChange={setNewMessageText}
        onSend={handleSendNewMessage}
        onBack={handleNewMessageBack}
      />
    );
  }

  // Conversation Detail View
  if (activeConvo) {
    return (
      <ConversationDetail
        conversation={activeConvo}
        emojiCategories={emojiCategories}
        onBack={() => setSelectedConvo(null)}
      />
    );
  }

  // Conversations List View
  return (
    <ConversationsList
      conversations={conversations}
      onSelectConversation={setSelectedConvo}
      onNewMessage={() => setShowNewMessage(true)}
    />
  );
}
