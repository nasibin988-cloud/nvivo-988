/**
 * Messaging Tab Data - Static data and mock data
 */

import type { EmojiCategory, Conversation, Recipient } from './types';

export const emojiCategories: EmojiCategory[] = [
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

export const conversations: Conversation[] = [
  {
    id: '1',
    provider: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
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
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: "I've scheduled your follow-up appointment for next week.",
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
    avatarUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
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
    avatarUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
    lastMessage: "Here's the meal plan we discussed. Let me know if you have questions!",
    timestamp: 'Dec 5',
    unread: 0,
    isOnline: false,
    messages: [
      { id: 'm1', text: "Here's the meal plan we discussed. Let me know if you have questions!", fromMe: false, time: 'Dec 5' },
    ],
  },
];

export const availableRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '2',
    name: 'Sarah Bennett',
    title: 'Care Coordinator',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '3',
    name: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '4',
    name: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl:
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '5',
    name: 'Dr. Robert Campbell',
    title: 'Psychologist',
    avatarUrl:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80',
  },
];
