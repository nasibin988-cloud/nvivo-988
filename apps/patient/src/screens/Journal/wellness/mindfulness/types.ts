/**
 * Mindfulness Types and Constants
 */

export interface MindfulnessModule {
  id: string;
  title: string;
  description: string;
  category: 'Focus' | 'Sleep' | 'Stress' | 'Vitality';
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export type AmbientSound = 'none' | 'rain' | 'ocean' | 'forest' | 'fireplace' | 'brownnoise' | 'pinknoise' | 'singing-bowl' | 'theta' | 'nature' | 'stream';

// Audio file mappings
export const AMBIENT_AUDIO_FILES: Record<Exclude<AmbientSound, 'none'>, string> = {
  rain: '/audio/ambience/12-Rain-Window.mp3',
  ocean: '/audio/ambience/6-Ocean-Waves.mp3',
  forest: '/audio/ambience/11-Forest-1.mp3',
  fireplace: '/audio/ambience/8-Fireplace.mp3',
  brownnoise: '/audio/ambience/19-Brown-Noise.mp3',
  pinknoise: '/audio/ambience/3-Pink-Noise.mp3',
  'singing-bowl': '/audio/ambience/10-Singing-Bowl.mp3',
  theta: '/audio/ambience/9-Theta-Waves.mp3',
  nature: '/audio/ambience/4-Nature-1.mp3',
  stream: '/audio/ambience/2-Gentle-Stream.mp3',
};

// Default sounds for each meditation module (matching JSON ambience URLs)
export const MODULE_DEFAULT_SOUNDS: Record<string, AmbientSound> = {
  'mindfulness-01': 'nature',      // Morning Clarity
  'mindfulness-02': 'stream',      // Lunch Break Reset
  'mindfulness-03': 'pinknoise',   // Power Nap
  'mindfulness-04': 'nature',      // Walking Meditation
  'mindfulness-05': 'singing-bowl', // Breath Awareness
  'mindfulness-06': 'ocean',       // Deep Rest
  'mindfulness-07': 'ocean',       // Sleep Drift
  'mindfulness-08': 'fireplace',   // Evening Wind Down
  'mindfulness-09': 'theta',       // Body Scan for Sleep
  'mindfulness-10': 'singing-bowl', // Pain Management
  'mindfulness-11': 'nature',      // Anxiety Release
  'mindfulness-12': 'rain',        // Commute Calm
  'mindfulness-13': 'nature',      // Gratitude Practice
  'mindfulness-14': 'forest',      // Loving Kindness
  'mindfulness-15': 'pinknoise',   // Focus Flow
  'mindfulness-16': 'singing-bowl', // Sound Bath
  'mindfulness-17': 'rain',        // Rain Sounds
  'mindfulness-18': 'forest',      // Forest Ambience
  'mindfulness-19': 'brownnoise',  // Deep White Noise
  'mindfulness-20': 'theta',       // Beta Waves
};

// All 20 Mindfulness Modules
export const MINDFULNESS_MODULES: MindfulnessModule[] = [
  // Vitality (5 modules)
  { id: 'mindfulness-01', title: 'Morning Clarity', description: 'Start your day with intention and a clear mind. A brief practice to set a positive tone for the hours ahead.', category: 'Vitality', duration: 5, difficulty: 'Beginner' },
  { id: 'mindfulness-02', title: 'Lunch Break Reset', description: 'A quick energy boost to overcome the midday slump. Clear mental fog and return to your day refreshed.', category: 'Vitality', duration: 5, difficulty: 'Beginner' },
  { id: 'mindfulness-03', title: 'Power Nap', description: 'Guided relaxation followed by a gentle wake-up call to recharge your battery without grogginess.', category: 'Vitality', duration: 20, difficulty: 'Beginner' },
  { id: 'mindfulness-04', title: 'Walking Meditation', description: 'Transform a simple walk into a grounding practice. Connect with your surroundings and your body in motion.', category: 'Vitality', duration: 15, difficulty: 'Intermediate' },
  { id: 'mindfulness-05', title: 'Breath Awareness', description: 'The fundamental practice of observing the breath. Builds focus and calms the nervous system.', category: 'Vitality', duration: 10, difficulty: 'Beginner' },
  // Sleep (5 modules)
  { id: 'mindfulness-06', title: 'Deep Rest', description: 'A guided body scan to help you release tension and drift into a state of deep relaxation.', category: 'Sleep', duration: 15, difficulty: 'Beginner' },
  { id: 'mindfulness-07', title: 'Sleep Drift', description: 'Visualize floating on calm waters under a starry sky. Designed to transition you seamlessly into sleep.', category: 'Sleep', duration: 20, difficulty: 'Beginner' },
  { id: 'mindfulness-08', title: 'Evening Wind Down', description: "Process the day's events and mentally put them away, clearing space for a restful night.", category: 'Sleep', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-09', title: 'Body Scan for Sleep', description: 'Systematically relax every muscle group from toe to head, signaling safety to your nervous system.', category: 'Sleep', duration: 15, difficulty: 'Intermediate' },
  { id: 'mindfulness-10', title: 'Pain Management', description: 'Techniques to soften resistance to physical discomfort, allowing for greater ease and rest.', category: 'Sleep', duration: 15, difficulty: 'Advanced' },
  // Stress (4 modules)
  { id: 'mindfulness-11', title: 'Anxiety Release', description: 'Breathwork techniques to instantly lower cortisol levels and ground you in the present moment.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-12', title: 'Commute Calm', description: 'Turn travel time into "me time". Release road rage or transit stress and arrive feeling composed.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-13', title: 'Gratitude Practice', description: 'Shift your perspective from what is lacking to what is abundant. A powerful antidote to stress.', category: 'Stress', duration: 10, difficulty: 'Beginner' },
  { id: 'mindfulness-14', title: 'Loving Kindness', description: 'Cultivate feelings of compassion for yourself and others. Melts away anger and resentment.', category: 'Stress', duration: 15, difficulty: 'Intermediate' },
  // Focus (6 modules)
  { id: 'mindfulness-15', title: 'Focus Flow', description: 'A countdown technique to enter a state of deep, undistracted work. Ideal before starting a big project.', category: 'Focus', duration: 20, difficulty: 'Intermediate' },
  { id: 'mindfulness-16', title: 'Sound Bath', description: 'Immersive crystal singing bowls at 432Hz. Use for deep meditation or creative work.', category: 'Focus', duration: 30, difficulty: 'Advanced' },
  { id: 'mindfulness-17', title: 'Rain Sounds', description: 'Consistent, heavy rainfall on a roof. Natural white noise to block out distractions.', category: 'Focus', duration: 60, difficulty: 'Beginner' },
  { id: 'mindfulness-18', title: 'Forest Ambience', description: 'Birds, wind in the trees, and gentle rustling. Bring the calm of nature to your workspace.', category: 'Focus', duration: 45, difficulty: 'Beginner' },
  { id: 'mindfulness-19', title: 'Deep White Noise', description: 'Pure brown noise. A consistent, low-frequency hum that masks sudden sounds and aids concentration.', category: 'Focus', duration: 60, difficulty: 'Beginner' },
  { id: 'mindfulness-20', title: 'Beta Waves', description: 'Binaural beats designed to stimulate beta brainwave activity for active thinking and problem solving.', category: 'Focus', duration: 45, difficulty: 'Intermediate' },
];
