/**
 * Messaging Tab
 */

import { useState, useRef } from 'react';
import { Search, Plus, CheckCheck, ArrowLeft, Send, Paperclip, Image, Smile, X, File, FileText } from 'lucide-react';

// Common emojis for quick access
const emojiCategories = [
  {
    name: 'Smileys',
    emojis: ['😊', '😀', '😄', '🙂', '😌', '😍', '🥰', '😘', '😂', '🤣', '😅', '😎', '🤔', '🤗', '😴', '🤒'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '✌️', '👋', '🤞', '❤️', '💙', '💚', '💜', '🧡', '💛'],
  },
  {
    name: 'Medical',
    emojis: ['💊', '💉', '🩺', '🏥', '🩹', '🌡️', '😷', '🤧', '🏃', '🧘', '🥗', '🍎', '💧', '😴', '⭐', '✅'],
  },
];

// Mock data for conversations
const conversations = [
  {
    id: '1',
    provider: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: 'Your lab results look good. Keep up with the current medication routine.',
    timestamp: '2:30 PM',
    unread: 2,
    isOnline: true,
    messages: [
      { id: 'm1', text: 'Hi! I wanted to check in about your recent lab results.', fromMe: false, time: '2:15 PM' },
      { id: 'm2', text: 'Your cholesterol levels have improved significantly since last visit.', fromMe: false, time: '2:16 PM' },
      { id: 'm3', text: "That's great news! I've been following the diet plan.", fromMe: true, time: '2:20 PM' },
      { id: 'm4', text: 'Your lab results look good. Keep up with the current medication routine.', fromMe: false, time: '2:30 PM' },
    ],
  },
  {
    id: '2',
    provider: 'Sarah Bennett',
    title: 'Care Coordinator',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: 'I\'ve scheduled your follow-up appointment for next week.',
    timestamp: '11:45 AM',
    unread: 0,
    isOnline: true,
    messages: [
      { id: 'm1', text: 'Hi! I need to schedule a follow-up appointment.', fromMe: true, time: '11:30 AM' },
      { id: 'm2', text: "Of course! Let me check Dr. Warren's availability.", fromMe: false, time: '11:35 AM' },
      { id: 'm3', text: "I've scheduled your follow-up appointment for next week.", fromMe: false, time: '11:45 AM' },
    ],
  },
  {
    id: '3',
    provider: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: 'Please remember to take your blood pressure readings twice daily.',
    timestamp: 'Yesterday',
    unread: 0,
    isOnline: false,
    messages: [
      { id: 'm1', text: 'How are you feeling after the medication adjustment?', fromMe: false, time: 'Yesterday' },
      { id: 'm2', text: 'Much better, no more dizziness.', fromMe: true, time: 'Yesterday' },
      { id: 'm3', text: 'Please remember to take your blood pressure readings twice daily.', fromMe: false, time: 'Yesterday' },
    ],
  },
  {
    id: '4',
    provider: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: 'Here\'s the meal plan we discussed. Let me know if you have questions!',
    timestamp: 'Dec 5',
    unread: 0,
    isOnline: false,
    messages: [
      { id: 'm1', text: "Here's the meal plan we discussed. Let me know if you have questions!", fromMe: false, time: 'Dec 5' },
    ],
  },
];

interface Attachment {
  name: string;
  type: 'file' | 'image';
  size: string;
  preview?: string;
}

export default function MessagingTab() {
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newMessageRecipient, setNewMessageRecipient] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeConvo = conversations.find((c) => c.id === selectedConvo);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files;
    if (files) {
      const newAttachments: Attachment[] = [];
      Array.from(files).forEach((file) => {
        const attachment: Attachment = {
          name: file.name,
          type,
          size: formatFileSize(file.size),
        };
        if (type === 'image' && file.type.startsWith('image/')) {
          attachment.preview = URL.createObjectURL(file);
        }
        newAttachments.push(attachment);
      });
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // New Message View
  if (showNewMessage) {
    const availableRecipients = [
      { id: '1', name: 'Dr. Elizabeth Warren', title: 'Primary Care Physician', avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80' },
      { id: '2', name: 'Sarah Bennett', title: 'Care Coordinator', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80' },
      { id: '3', name: 'Dr. Michael Anderson', title: 'Cardiologist', avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80' },
      { id: '4', name: 'Dr. Jennifer Collins', title: 'Nutritionist', avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80' },
      { id: '5', name: 'Dr. Robert Campbell', title: 'Psychologist', avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80' },
    ];

    return (
      <div className="flex flex-col h-[calc(100vh-220px)] -mx-4 -my-2">
        {/* Header */}
        <div className="relative px-4 py-3 bg-gradient-to-b from-surface to-transparent border-b border-white/[0.04]">
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => {
                setShowNewMessage(false);
                setNewMessageRecipient('');
                setNewMessageText('');
              }}
              className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary">New Message</h4>
              <p className="text-xs text-text-muted">Select a recipient</p>
            </div>
          </div>
        </div>

        {/* Recipient Selection */}
        {!newMessageRecipient ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            <p className="text-xs text-text-muted mb-3 px-1">Your Care Team</p>
            {availableRecipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => setNewMessageRecipient(recipient.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all text-left"
              >
                <img
                  src={recipient.avatarUrl}
                  alt={recipient.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/5"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary">{recipient.name}</h4>
                  <p className="text-xs text-text-muted">{recipient.title}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Selected Recipient */}
            <div className="px-4 py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">To:</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <img
                    src={availableRecipients.find(r => r.id === newMessageRecipient)?.avatarUrl}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-xs text-blue-400 font-medium">
                    {availableRecipients.find(r => r.id === newMessageRecipient)?.name}
                  </span>
                  <button
                    onClick={() => setNewMessageRecipient('')}
                    className="ml-1 text-blue-400/60 hover:text-blue-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Message Compose Area */}
            <div className="flex-1 px-4 py-4">
              <textarea
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full h-full min-h-[200px] bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
                autoFocus
              />
            </div>

            {/* Send Button */}
            <div className="px-4 py-3 border-t border-white/[0.04]">
              <button
                onClick={() => {
                  // In real app, would send the message
                  setShowNewMessage(false);
                  setNewMessageRecipient('');
                  setNewMessageText('');
                }}
                disabled={!newMessageText.trim()}
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  newMessageText.trim()
                    ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25'
                    : 'bg-surface border border-border text-text-muted cursor-not-allowed'
                }`}
              >
                <Send size={16} />
                Send Message
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Conversation Detail View
  if (activeConvo) {
    return (
      <div className="flex flex-col h-[calc(100vh-220px)] -mx-4 -my-2">
        {/* Header */}
        <div className="relative px-4 py-3 bg-gradient-to-b from-surface to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] to-transparent" />
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setSelectedConvo(null)}
              className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <img
                src={activeConvo.avatarUrl}
                alt={activeConvo.provider}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
              />
              {activeConvo.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-text-primary text-sm">{activeConvo.provider}</h4>
              <p className="text-xs text-text-muted">{activeConvo.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {activeConvo.messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`relative max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.fromMe
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-[0_4px_16px_rgba(59,130,246,0.3)]'
                    : 'bg-surface border border-white/[0.06] text-text-primary rounded-bl-md'
                }`}
              >
                {!msg.fromMe && index === 0 && (
                  <div className="absolute -left-12 top-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/5">
                    <img src={activeConvo.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`flex items-center gap-1 mt-1 ${msg.fromMe ? 'justify-end' : ''}`}>
                  <span className={`text-[10px] ${msg.fromMe ? 'text-white/60' : 'text-text-muted'}`}>
                    {msg.time}
                  </span>
                  {msg.fromMe && <CheckCheck size={12} className="text-white/60" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-gradient-to-t from-surface via-surface to-transparent">
          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="relative group"
                >
                  {att.preview ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                      <img src={att.preview} alt={att.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-lg border border-white/[0.06]">
                      {att.name.endsWith('.pdf') ? (
                        <FileText size={16} className="text-red-400" />
                      ) : (
                        <File size={16} className="text-blue-400" />
                      )}
                      <div className="max-w-[100px]">
                        <p className="text-xs text-text-primary truncate">{att.name}</p>
                        <p className="text-[10px] text-text-muted">{att.size}</p>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-1 w-5 h-5 bg-white/[0.06] hover:bg-red-500/20 rounded-full flex items-center justify-center text-text-muted hover:text-red-400 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 right-4 bg-surface border border-white/[0.08] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-text-primary">Emoji</span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] text-text-muted"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {emojiCategories.map((category) => (
                  <div key={category.name}>
                    <p className="text-xs text-text-muted mb-2">{category.name}</p>
                    <div className="grid grid-cols-8 gap-1">
                      {category.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-white/[0.08] transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
            onChange={(e) => handleFileSelect(e, 'file')}
          />
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e, 'image')}
          />

          <div className="relative flex items-center gap-2 p-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-all"
            >
              <Paperclip size={18} />
            </button>
            <button
              onClick={() => imageInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-text-muted hover:text-text-secondary transition-all"
            >
              <Image size={18} />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none py-2"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-all ${showEmojiPicker ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/[0.06] text-text-muted hover:text-text-secondary'}`}
            >
              <Smile size={18} />
            </button>
            <button
              className={`p-2.5 rounded-xl transition-all ${
                messageInput.trim() || attachments.length > 0
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)] hover:scale-105'
                  : 'bg-white/[0.04] text-text-muted cursor-not-allowed'
              }`}
              disabled={!messageInput.trim() && attachments.length === 0}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Conversations List View
  return (
    <div className="space-y-4">
      {/* Search and New Message */}
      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl border border-white/[0.04] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/30 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all"
          />
        </div>
        <button
          onClick={() => setShowNewMessage(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/25 hover:border-blue-500/50 transition-all"
        >
          <Plus size={18} />
          New
        </button>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => setSelectedConvo(convo.id)}
            className={`relative rounded-2xl border p-4 cursor-pointer transition-all duration-200 group overflow-hidden ${
              convo.unread > 0
                ? 'bg-gradient-to-br from-blue-500/[0.06] to-surface border-blue-500/15 shadow-[0_4px_20px_rgba(59,130,246,0.1)] hover:shadow-[0_6px_24px_rgba(59,130,246,0.15)]'
                : 'bg-surface border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08]'
            }`}
          >
            {/* Glow effect for unread */}
            {convo.unread > 0 && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            )}

            {/* Unread indicator line */}
            {convo.unread > 0 && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            )}

            <div className="relative flex items-start gap-4">
              {/* Avatar with online indicator */}
              <div className="relative flex-shrink-0">
                <img
                  src={convo.avatarUrl}
                  alt={convo.provider}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-white/10 transition-all"
                />
                {convo.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm text-text-primary">{convo.provider}</h4>
                  <span className={`text-xs ${convo.unread > 0 ? 'text-blue-400 font-medium' : 'text-text-muted'}`}>
                    {convo.timestamp}
                  </span>
                </div>
                <span className="inline-block px-2 py-0.5 mb-2 rounded-full bg-white/[0.04] text-xs text-text-muted">
                  {convo.title}
                </span>
                <p className={`text-sm truncate ${convo.unread > 0 ? 'text-text-secondary font-medium' : 'text-text-muted'}`}>
                  {convo.lastMessage}
                </p>
              </div>

              {/* Unread badge or read status */}
              <div className="flex-shrink-0 pt-1">
                {convo.unread > 0 ? (
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-medium shadow-[0_2px_8px_rgba(59,130,246,0.4)]">
                    {convo.unread}
                  </span>
                ) : (
                  <CheckCheck size={16} className="text-blue-400/40" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
