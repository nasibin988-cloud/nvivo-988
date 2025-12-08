"use strict";
/**
 * MicroWins Challenge Library
 *
 * A curated library of 50 daily health challenges.
 * In the future, AI will select optimal challenges based on:
 * - Patient's health conditions
 * - Current care plan goals
 * - Recent activity/completion patterns
 * - Time of day / day of week
 * - Seasonal relevance
 *
 * For now, challenges are randomly selected during seeding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHALLENGE_LIBRARY = void 0;
exports.getChallengesByCategory = getChallengesByCategory;
exports.getChallengesByDifficulty = getChallengesByDifficulty;
exports.getChallengesByTag = getChallengesByTag;
exports.selectRandomChallenges = selectRandomChallenges;
exports.templateToMicroWin = templateToMicroWin;
exports.generateDailyMicroWins = generateDailyMicroWins;
/**
 * The master library of 50 challenges - detailed and actionable
 * Each challenge has specific instructions that tell the user exactly what to do.
 */
exports.CHALLENGE_LIBRARY = [
    // ============================================================================
    // PHYSICAL ACTIVITY (10 challenges)
    // ============================================================================
    {
        id: 'pa-001',
        title: 'Take a 5-minute post-meal walk',
        description: 'Walk around your home or office for 5 minutes after your next meal. Set a timer on your phone and walk until it goes off. Even pacing in place counts!',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['walking', 'outdoor', 'cardio', 'blood-sugar'],
    },
    {
        id: 'pa-002',
        title: 'Do 5 desk stretches right now',
        description: 'Perform these 5 stretches at your desk: (1) Neck rolls - 5 each direction, (2) Shoulder shrugs - hold 3 seconds, release, (3) Wrist circles - 10 each direction, (4) Seated spinal twist - hold 10 seconds each side, (5) Ankle circles - 10 each foot.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['stretching', 'flexibility', 'indoor', 'desk-work'],
    },
    {
        id: 'pa-003',
        title: 'Take the stairs instead of elevator once',
        description: 'The next time you need to go up or down 1-3 floors, take the stairs. Hold the railing for safety. Walk at your own pace - speed doesn\'t matter.',
        category: 'physical_activity',
        difficulty: 'medium',
        estimatedMinutes: 5,
        tags: ['stairs', 'cardio', 'daily-activity'],
    },
    {
        id: 'pa-004',
        title: 'Stand up and sit down 5 times',
        description: 'From a seated position in a sturdy chair, stand up fully, then sit back down slowly. Repeat 5 times. Use armrests for support if needed. This mimics daily movements and builds functional strength.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 3,
        tags: ['strength', 'legs', 'indoor', 'functional'],
    },
    {
        id: 'pa-005',
        title: 'March in place for 2 minutes',
        description: 'Stand up right now and march in place. Lift your knees to hip height if possible. Swing your arms naturally. You can do this while watching TV or waiting for something.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['movement', 'cardio', 'indoor'],
    },
    {
        id: 'pa-006',
        title: 'Dance to one full song',
        description: 'Put on your favorite upbeat song (3-4 minutes) and move your body however feels good. No choreography needed - just let yourself move to the music!',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 4,
        tags: ['dancing', 'cardio', 'fun'],
    },
    {
        id: 'pa-007',
        title: 'Do 10 wall push-ups',
        description: 'Stand arm\'s length from a wall. Place palms flat against wall at shoulder height. Bend elbows to bring chest toward wall, then push back. Do 10 repetitions at your own pace.',
        category: 'physical_activity',
        difficulty: 'medium',
        estimatedMinutes: 3,
        tags: ['strength', 'upper-body', 'indoor'],
    },
    {
        id: 'pa-008',
        title: 'Walk to the end of your street and back',
        description: 'Step outside your front door. Walk to the end of your street or block, then turn around and walk back. That\'s it! Note how long it takes so you can track improvement.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 10,
        tags: ['walking', 'outdoor', 'neighborhood'],
    },
    {
        id: 'pa-009',
        title: 'Do 5 calf raises while brushing teeth',
        description: 'While brushing your teeth tonight, rise up onto your tiptoes, hold for 2 seconds, then lower. Repeat 5 times. Hold the counter for balance if needed.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['strength', 'balance', 'habit-stacking'],
    },
    {
        id: 'pa-010',
        title: 'Stand on one foot for 30 seconds each side',
        description: 'Stand near a wall or counter for support. Lift one foot slightly off the ground. Hold for 30 seconds (or as long as you can). Switch sides. This builds stability and prevents falls.',
        category: 'physical_activity',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['balance', 'stability', 'indoor'],
    },
    // ============================================================================
    // NUTRITION (8 challenges)
    // ============================================================================
    {
        id: 'nt-001',
        title: 'Eat one cup of colorful vegetables',
        description: 'At your next meal, add 1 cup (about the size of your fist) of non-starchy vegetables. Choose colorful options: broccoli, bell peppers, tomatoes, spinach, or carrots. Raw or cooked both count.',
        category: 'nutrition',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['vegetables', 'healthy-eating', 'fiber'],
    },
    {
        id: 'nt-002',
        title: 'Choose a protein-rich snack',
        description: 'For your next snack, pick something with at least 5g protein: Greek yogurt, a handful of almonds (about 23), a hard-boiled egg, string cheese, or 2 tablespoons of peanut butter with apple slices.',
        category: 'nutrition',
        difficulty: 'medium',
        estimatedMinutes: 5,
        tags: ['protein', 'snack', 'healthy-eating'],
    },
    {
        id: 'nt-003',
        title: 'Eat one piece of whole fruit',
        description: 'Eat one whole fruit today: an apple, banana, orange, pear, or a cup of berries. Choose whole fruit over juice to get the fiber. Wash it, eat it slowly, and enjoy the natural sweetness.',
        category: 'nutrition',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['fruit', 'vitamins', 'snack'],
    },
    {
        id: 'nt-004',
        title: 'Add a healthy fat to your next meal',
        description: 'Include one serving of healthy fat at your next meal: 1/4 avocado, 1 tablespoon olive oil on salad, a small handful of walnuts, or 2 tablespoons of seeds (chia, flax, pumpkin).',
        category: 'nutrition',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['healthy-fats', 'nutrition', 'brain-health'],
    },
    {
        id: 'nt-005',
        title: 'Eat slowly for one meal today',
        description: 'For your next meal: Put your fork down between bites. Chew each bite 15-20 times. Take at least 20 minutes to finish your meal. Notice the flavors and textures.',
        category: 'nutrition',
        difficulty: 'medium',
        estimatedMinutes: 20,
        tags: ['mindful-eating', 'digestion', 'habits'],
    },
    {
        id: 'nt-006',
        title: 'Prep one healthy ingredient',
        description: 'Take 10 minutes to prep one healthy ingredient for the week: Wash and chop vegetables, cook a batch of grains, hard-boil eggs, or portion out nuts into snack bags.',
        category: 'nutrition',
        difficulty: 'medium',
        estimatedMinutes: 10,
        tags: ['meal-prep', 'planning', 'healthy-eating'],
    },
    {
        id: 'nt-007',
        title: 'Read the label on one food item',
        description: 'Pick up a food item in your kitchen. Read the nutrition label completely: serving size, calories, sodium, sugar, fiber, protein. Notice if the serving size matches what you actually eat.',
        category: 'nutrition',
        difficulty: 'easy',
        estimatedMinutes: 3,
        tags: ['awareness', 'labels', 'education'],
    },
    {
        id: 'nt-008',
        title: 'Eat one meal without screens',
        description: 'For your next meal, put your phone in another room or face-down. Turn off the TV. Sit at a table and focus only on your food and any companions. Notice how it feels different.',
        category: 'nutrition',
        difficulty: 'medium',
        estimatedMinutes: 20,
        tags: ['mindful-eating', 'focus', 'habits'],
    },
    // ============================================================================
    // HYDRATION (5 challenges)
    // ============================================================================
    {
        id: 'hy-001',
        title: 'Drink 8oz of water right now',
        description: 'Pour yourself one full glass (8oz/240ml) of water and drink it before doing anything else. Room temperature water is easier to drink quickly. Set your glass down empty.',
        category: 'hydration',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['water', 'hydration', 'immediate'],
    },
    {
        id: 'hy-002',
        title: 'Drink water before your next meal',
        description: 'Before sitting down for breakfast, lunch, or dinner, drink one full glass of water first. Wait 5 minutes, then eat. This simple habit aids digestion and may reduce overeating.',
        category: 'hydration',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['water', 'digestion', 'routine'],
    },
    {
        id: 'hy-003',
        title: 'Set 3 water reminder alarms',
        description: 'Right now, set 3 alarms on your phone for mid-morning, mid-afternoon, and evening. Label them "Drink water now!" When they go off today, drink a glass immediately.',
        category: 'hydration',
        difficulty: 'easy',
        estimatedMinutes: 3,
        tags: ['water', 'habit', 'reminder'],
    },
    {
        id: 'hy-004',
        title: 'Replace your next drink with water',
        description: 'When you would normally reach for soda, juice, or coffee, choose water instead. Add a slice of lemon or cucumber if plain water feels boring. Just for this one drink.',
        category: 'hydration',
        difficulty: 'medium',
        estimatedMinutes: 1,
        tags: ['water', 'sugar-reduction', 'healthy-swap'],
    },
    {
        id: 'hy-005',
        title: 'Finish one full water bottle today',
        description: 'Fill a reusable water bottle (16-20oz) and commit to finishing it by end of day. Take sips throughout the day rather than chugging. Refill if you finish early.',
        category: 'hydration',
        difficulty: 'medium',
        estimatedMinutes: 5,
        tags: ['water', 'daily-goal', 'tracking'],
    },
    // ============================================================================
    // SLEEP (5 challenges)
    // ============================================================================
    {
        id: 'sl-001',
        title: 'Set a screens-off alarm for 30min before bed',
        description: 'Right now, set an alarm for 30 minutes before your target bedtime tonight. When it goes off, put all screens (phone, tablet, TV) in another room or face-down. Read a book or do gentle stretches instead.',
        category: 'sleep',
        difficulty: 'medium',
        estimatedMinutes: 30,
        tags: ['screen-time', 'sleep-hygiene', 'routine'],
    },
    {
        id: 'sl-002',
        title: 'Set your bedtime alarm for tonight',
        description: 'Choose a specific bedtime for tonight (aim for 7-8 hours before your wake time). Set an alarm 15 minutes before as a "start winding down" reminder. When it goes off, begin your bedtime routine.',
        category: 'sleep',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['routine', 'planning', 'consistency'],
    },
    {
        id: 'sl-003',
        title: 'Prepare your sleep environment tonight',
        description: 'Before bed tonight: (1) Set thermostat to 65-68°F, (2) Close blinds or use blackout curtains, (3) Remove or silence electronic devices, (4) Have a glass of water nearby. A prepared room signals sleep time to your brain.',
        category: 'sleep',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['environment', 'darkness', 'sleep-quality'],
    },
    {
        id: 'sl-004',
        title: 'Skip caffeine after 2pm today',
        description: 'No coffee, tea, soda, or energy drinks after 2pm today. Caffeine has a 6-hour half-life, meaning half is still in your system 6 hours later. Switch to water, herbal tea, or decaf.',
        category: 'sleep',
        difficulty: 'medium',
        estimatedMinutes: 1,
        tags: ['caffeine', 'sleep-hygiene', 'habits'],
    },
    {
        id: 'sl-005',
        title: 'Do a 5-minute wind-down routine',
        description: 'Before bed tonight, do this 5-minute routine: (1) Dim all lights, (2) Do 5 slow neck rolls, (3) Take 10 deep breaths, (4) Write down one thing you\'re looking forward to tomorrow, (5) Say goodnight to yourself.',
        category: 'sleep',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['routine', 'relaxation', 'habits'],
    },
    // ============================================================================
    // MINDFULNESS (7 challenges)
    // ============================================================================
    {
        id: 'mf-001',
        title: 'Take 5 box breaths right now',
        description: 'Do this now: Breathe in for 4 counts, hold for 4 counts, exhale for 4 counts, hold empty for 4 counts. That\'s one box breath. Repeat 5 times. Close your eyes if comfortable.',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['breathing', 'relaxation', 'stress-relief'],
    },
    {
        id: 'mf-002',
        title: 'Write 3 specific gratitude items',
        description: 'Write down 3 things you\'re grateful for that happened in the last 24 hours. Be specific: not "family" but "Mom called to check on me." Not "health" but "I was able to walk to the mailbox today."',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['gratitude', 'journaling', 'positivity'],
    },
    {
        id: 'mf-003',
        title: 'Do a 2-minute body scan',
        description: 'Sit comfortably, close your eyes. Notice sensations starting from your toes: any tension? Move attention slowly up through feet, legs, hips, belly, chest, hands, arms, shoulders, neck, face, head. Just notice without judging.',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['body-awareness', 'relaxation', 'tension-release'],
    },
    {
        id: 'mf-004',
        title: 'Do a 1-minute sensory grounding',
        description: 'Name out loud: 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste. This takes about 1 minute and anchors you to the present.',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 1,
        tags: ['grounding', 'anxiety-relief', 'presence'],
    },
    {
        id: 'mf-005',
        title: 'Sit in silence for 3 minutes',
        description: 'Set a 3-minute timer. Sit somewhere quiet, put your phone face down. Close your eyes or soften your gaze. When thoughts come, let them pass like clouds. No phone, no talking, just being.',
        category: 'mindfulness',
        difficulty: 'medium',
        estimatedMinutes: 3,
        tags: ['meditation', 'calm', 'stillness'],
    },
    {
        id: 'mf-006',
        title: 'Practice mindful hand washing',
        description: 'Next time you wash your hands, pay full attention: Feel the temperature of the water. Notice the texture of the soap. Watch the bubbles form. Feel the towel drying your hands. 30 seconds of full presence.',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 1,
        tags: ['presence', 'daily-activity', 'awareness'],
    },
    {
        id: 'mf-007',
        title: 'Notice 5 pleasant moments today',
        description: 'Throughout today, pause to notice 5 small pleasant moments: warm sunlight, a good smell, a friendly face, comfortable clothing, a tasty bite. Mentally label each one: "This is pleasant."',
        category: 'mindfulness',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['awareness', 'positivity', 'presence'],
    },
    // ============================================================================
    // MEDICATION (5 challenges)
    // ============================================================================
    {
        id: 'md-001',
        title: 'Take your next dose on time',
        description: 'Check when your next medication dose is due. Set an alarm for that exact time. When the alarm goes off, take your medication immediately - don\'t snooze or delay. Mark it complete in your tracker.',
        category: 'medication',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['adherence', 'timing', 'reminders'],
    },
    {
        id: 'md-002',
        title: 'Do a medication inventory check',
        description: 'Right now, check the supply of each medication you take. Count how many pills/doses remain. If any have fewer than 7 days\' supply, call your pharmacy or doctor today to request a refill.',
        category: 'medication',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['organization', 'planning', 'safety'],
    },
    {
        id: 'md-003',
        title: 'Review one medication\'s purpose',
        description: 'Pick one medication you take. Look up or recall: What is it for? What time should you take it? Should it be taken with food? Any side effects to watch for? Know your medicines!',
        category: 'medication',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['education', 'awareness', 'safety'],
    },
    {
        id: 'md-004',
        title: 'Take medications with a full glass of water',
        description: 'When you take your next medication dose, drink a full 8oz glass of water with it (not just a sip). This helps pills dissolve properly and reach your stomach without getting stuck.',
        category: 'medication',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['hydration', 'absorption', 'safety'],
    },
    {
        id: 'md-005',
        title: 'Set up a weekly pill organizer',
        description: 'If you don\'t already use one, get a weekly pill organizer (7-day pillbox). Fill it for the upcoming week. Place it somewhere you\'ll see it daily - by your toothbrush or coffee maker.',
        category: 'medication',
        difficulty: 'medium',
        estimatedMinutes: 10,
        tags: ['organization', 'adherence', 'habit'],
    },
    // ============================================================================
    // SOCIAL (5 challenges)
    // ============================================================================
    {
        id: 'so-001',
        title: 'Send a thinking-of-you text',
        description: 'Think of someone you haven\'t contacted in a while. Send them a specific, personal text: "I was thinking about that time we [specific memory]. Hope you\'re doing well!" Send it in the next 5 minutes.',
        category: 'social',
        difficulty: 'easy',
        estimatedMinutes: 3,
        tags: ['connection', 'messaging', 'relationships'],
    },
    {
        id: 'so-002',
        title: 'Call one person for 5 minutes',
        description: 'Pick up the phone and call a friend or family member. Even a short 5-minute check-in counts. Ask them one specific question about their life and listen to their answer before sharing about yours.',
        category: 'social',
        difficulty: 'medium',
        estimatedMinutes: 5,
        tags: ['phone-call', 'connection', 'listening'],
    },
    {
        id: 'so-003',
        title: 'Give a genuine compliment today',
        description: 'Compliment someone today - in person, by phone, or text. Make it specific and genuine: Not "You\'re nice" but "I really appreciated how you helped me with [specific thing]" or "That color looks great on you."',
        category: 'social',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['kindness', 'appreciation', 'positivity'],
    },
    {
        id: 'so-004',
        title: 'Ask someone how they\'re really doing',
        description: 'Ask someone close to you "How are you really doing?" Then listen without immediately offering advice. Acknowledge what they share: "That sounds hard" or "I\'m glad that\'s going well." Just listen.',
        category: 'social',
        difficulty: 'easy',
        estimatedMinutes: 10,
        tags: ['connection', 'listening', 'empathy'],
    },
    {
        id: 'so-005',
        title: 'Schedule a future social activity',
        description: 'Right now, text or call someone to schedule a specific activity for this week or next: coffee, a walk, a phone call, watching something together. Put it on your calendar with a reminder.',
        category: 'social',
        difficulty: 'medium',
        estimatedMinutes: 5,
        tags: ['planning', 'connection', 'anticipation'],
    },
    // ============================================================================
    // SELF CARE (4 challenges)
    // ============================================================================
    {
        id: 'sc-001',
        title: 'Take a 10-minute break doing nothing',
        description: 'Set a timer for 10 minutes. Sit or lie down somewhere comfortable. Don\'t look at screens, read, or "be productive." Just rest. Stare out a window, close your eyes, or watch clouds. Rest is productive.',
        category: 'self_care',
        difficulty: 'medium',
        estimatedMinutes: 10,
        tags: ['rest', 'relaxation', 'mental-health'],
    },
    {
        id: 'sc-002',
        title: 'Spend 15 minutes on something you enjoy',
        description: 'Set a timer for 15 minutes and do something purely for enjoyment: read a few pages, play a game, garden, draw, play music, or whatever brings you joy. This is not optional - it\'s necessary.',
        category: 'self_care',
        difficulty: 'easy',
        estimatedMinutes: 15,
        tags: ['hobby', 'enjoyment', 'recreation'],
    },
    {
        id: 'sc-003',
        title: 'Tidy one small space for 5 minutes',
        description: 'Set a 5-minute timer. Pick one small area: a countertop, your nightstand, one shelf, or your desk. Tidy only that area until the timer goes off. A clear space helps create a clear mind.',
        category: 'self_care',
        difficulty: 'easy',
        estimatedMinutes: 5,
        tags: ['organization', 'environment', 'clarity'],
    },
    {
        id: 'sc-004',
        title: 'Write down one thing you did well today',
        description: 'Before bed tonight, write down one thing you did well today. It can be small: "I drank enough water" or "I was patient when I felt frustrated." Acknowledge your own efforts.',
        category: 'self_care',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['self-compassion', 'reflection', 'positivity'],
    },
    // ============================================================================
    // HEALTH MONITORING (3 challenges)
    // ============================================================================
    {
        id: 'hm-001',
        title: 'Check and log your blood pressure',
        description: 'If you have a blood pressure monitor, take a reading now: sit quietly for 5 minutes first, then measure. Log both numbers in the app. If you don\'t have a monitor, schedule a pharmacy visit to get checked.',
        category: 'health_monitoring',
        difficulty: 'easy',
        estimatedMinutes: 7,
        tags: ['vitals', 'tracking', 'heart-health'],
    },
    {
        id: 'hm-002',
        title: 'Weigh yourself and log it',
        description: 'Step on a scale first thing tomorrow morning (after using the bathroom, before eating). Log your weight in the app. Weigh yourself weekly at the same time for the most accurate tracking.',
        category: 'health_monitoring',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['weight', 'tracking', 'routine'],
    },
    {
        id: 'hm-003',
        title: 'Rate your energy level right now',
        description: 'On a scale of 1-10, how is your energy level right now? Log it in the app along with a brief note about what might be affecting it (sleep, food, stress, activity). Tracking patterns helps identify what helps.',
        category: 'health_monitoring',
        difficulty: 'easy',
        estimatedMinutes: 2,
        tags: ['energy', 'tracking', 'awareness'],
    },
];
/**
 * Get challenges by category
 */
function getChallengesByCategory(category) {
    return exports.CHALLENGE_LIBRARY.filter((c) => c.category === category);
}
/**
 * Get challenges by difficulty
 */
function getChallengesByDifficulty(difficulty) {
    return exports.CHALLENGE_LIBRARY.filter((c) => c.difficulty === difficulty);
}
/**
 * Get challenges by tag
 */
function getChallengesByTag(tag) {
    return exports.CHALLENGE_LIBRARY.filter((c) => c.tags.includes(tag));
}
/**
 * Select random challenges from the library
 * @param count Number of challenges to select
 * @param options Optional filters
 */
function selectRandomChallenges(count, options) {
    var _a, _b;
    let pool = [...exports.CHALLENGE_LIBRARY];
    // Apply filters
    if ((_a = options === null || options === void 0 ? void 0 : options.excludeIds) === null || _a === void 0 ? void 0 : _a.length) {
        pool = pool.filter((c) => !options.excludeIds.includes(c.id));
    }
    if ((_b = options === null || options === void 0 ? void 0 : options.categories) === null || _b === void 0 ? void 0 : _b.length) {
        pool = pool.filter((c) => options.categories.includes(c.category));
    }
    if (options === null || options === void 0 ? void 0 : options.maxDifficulty) {
        const difficultyOrder = ['easy', 'medium', 'hard'];
        const maxIndex = difficultyOrder.indexOf(options.maxDifficulty);
        pool = pool.filter((c) => difficultyOrder.indexOf(c.difficulty) <= maxIndex);
    }
    // Shuffle and select
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}
/**
 * Convert a challenge template to a MicroWin challenge for storage
 */
function templateToMicroWin(template) {
    return {
        id: template.id,
        title: template.title,
        description: template.description,
        completed: false,
        skipped: false,
        completedAt: null,
    };
}
/**
 * Generate daily MicroWins from the library
 * In the future, this will be replaced with AI-based selection
 */
function generateDailyMicroWins(count = 3, options) {
    const templates = selectRandomChallenges(count, options);
    return templates.map(templateToMicroWin);
}
//# sourceMappingURL=challengeLibrary.js.map