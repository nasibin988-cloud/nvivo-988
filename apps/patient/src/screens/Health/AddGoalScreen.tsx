/**
 * Add Goal Screen
 * Full page for creating a new weekly goal
 */

import { useState } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  Moon,
  Apple,
  Pill,
  Brain,
  Sparkles,
  Check,
  ChevronRight,
  Footprints,
  Timer,
  Flame,
  Droplets,
  Salad,
  Heart,
  Bike,
  Waves,
  Move,
  Clock,
  Smartphone,
  TreePine,
  Book,
  Sun,
  Beef,
  Cherry,
  Fish,
  Utensils,
  Candy,
  Wheat,
  Wind,
  Sunrise,
  BedDouble,
  Activity,
  Target,
} from 'lucide-react';

interface GoalCategory {
  id: string;
  name: string;
  icon: typeof Dumbbell;
  color: string;
  bgColor: string;
  borderColor: string;
  goals: GoalTemplate[];
}

interface GoalTemplate {
  id: string;
  name: string;
  icon: typeof Dumbbell;
  unit: string;
  defaultTarget: number;
  minTarget: number;
  maxTarget: number;
  step: number;
  description: string;
}

const goalCategories: GoalCategory[] = [
  {
    id: 'exercise',
    name: 'Exercise',
    icon: Dumbbell,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    goals: [
      {
        id: 'exercise_minutes',
        name: 'Exercise Minutes',
        icon: Timer,
        unit: 'min',
        defaultTarget: 150,
        minTarget: 30,
        maxTarget: 300,
        step: 15,
        description: 'Total minutes of exercise per week',
      },
      {
        id: 'step_days',
        name: '7K+ Step Days',
        icon: Footprints,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days hitting 7,000+ steps',
      },
      {
        id: 'workouts',
        name: 'Workouts',
        icon: Flame,
        unit: 'workouts',
        defaultTarget: 3,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Number of workout sessions per week',
      },
      {
        id: 'strength_days',
        name: 'Strength Training Days',
        icon: Dumbbell,
        unit: 'days',
        defaultTarget: 2,
        minTarget: 1,
        maxTarget: 6,
        step: 1,
        description: 'Days with strength/resistance training',
      },
      {
        id: 'cardio_sessions',
        name: 'Cardio Sessions',
        icon: Activity,
        unit: 'sessions',
        defaultTarget: 3,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Cardio workout sessions per week',
      },
      {
        id: 'stretching_days',
        name: 'Stretching/Yoga Days',
        icon: Move,
        unit: 'days',
        defaultTarget: 3,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days with stretching or yoga',
      },
      {
        id: 'cycling_miles',
        name: 'Cycling Miles',
        icon: Bike,
        unit: 'miles',
        defaultTarget: 20,
        minTarget: 5,
        maxTarget: 100,
        step: 5,
        description: 'Total miles cycled per week',
      },
      {
        id: 'swimming_laps',
        name: 'Swimming Laps',
        icon: Waves,
        unit: 'laps',
        defaultTarget: 20,
        minTarget: 5,
        maxTarget: 100,
        step: 5,
        description: 'Total laps swum per week',
      },
      {
        id: 'active_minutes',
        name: 'Active Minutes',
        icon: Target,
        unit: 'min',
        defaultTarget: 300,
        minTarget: 60,
        maxTarget: 600,
        step: 30,
        description: 'Total active minutes (any movement)',
      },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    icon: Moon,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    goals: [
      {
        id: 'sleep_nights',
        name: '7+ Hour Nights',
        icon: Moon,
        unit: 'nights',
        defaultTarget: 6,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Nights with 7+ hours of sleep',
      },
      {
        id: 'consistent_bedtime',
        name: 'Consistent Bedtime',
        icon: Clock,
        unit: 'nights',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Nights going to bed within 30 min of target',
      },
      {
        id: 'screen_free',
        name: 'Screen-Free Evenings',
        icon: Smartphone,
        unit: 'nights',
        defaultTarget: 4,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'No screens 1 hour before bed',
      },
      {
        id: 'early_nights',
        name: 'Early Nights',
        icon: BedDouble,
        unit: 'nights',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Asleep before midnight',
      },
    ],
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    icon: Apple,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    goals: [
      {
        id: 'veggie_days',
        name: '5+ Veggie Days',
        icon: Salad,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days eating 5+ vegetable servings',
      },
      {
        id: 'water_days',
        name: 'Hydration Days',
        icon: Droplets,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days drinking 8+ glasses of water',
      },
      {
        id: 'fruit_days',
        name: 'Fruit Days',
        icon: Cherry,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days eating 2+ fruit servings',
      },
      {
        id: 'protein_days',
        name: 'Protein Goal Days',
        icon: Beef,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days hitting protein target',
      },
      {
        id: 'no_sugar_days',
        name: 'Low Sugar Days',
        icon: Candy,
        unit: 'days',
        defaultTarget: 4,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days with minimal added sugar',
      },
      {
        id: 'home_cooked',
        name: 'Home Cooked Meals',
        icon: Utensils,
        unit: 'meals',
        defaultTarget: 10,
        minTarget: 3,
        maxTarget: 21,
        step: 1,
        description: 'Home-prepared meals per week',
      },
      {
        id: 'fiber_days',
        name: 'Fiber Goal Days',
        icon: Wheat,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days hitting 25g+ fiber',
      },
      {
        id: 'omega3_days',
        name: 'Omega-3 Days',
        icon: Fish,
        unit: 'days',
        defaultTarget: 3,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days eating omega-3 rich foods',
      },
    ],
  },
  {
    id: 'medication',
    name: 'Medication',
    icon: Pill,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    goals: [
      {
        id: 'medication_doses',
        name: 'Doses Taken',
        icon: Pill,
        unit: 'doses',
        defaultTarget: 14,
        minTarget: 1,
        maxTarget: 28,
        step: 1,
        description: 'Number of medication doses taken',
      },
      {
        id: 'supplement_doses',
        name: 'Supplement Doses',
        icon: Pill,
        unit: 'doses',
        defaultTarget: 7,
        minTarget: 1,
        maxTarget: 21,
        step: 1,
        description: 'Daily supplements taken',
      },
      {
        id: 'vitamin_d',
        name: 'Vitamin D Days',
        icon: Sun,
        unit: 'days',
        defaultTarget: 7,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days taking vitamin D',
      },
      {
        id: 'on_time_doses',
        name: 'On-Time Doses',
        icon: Clock,
        unit: 'doses',
        defaultTarget: 14,
        minTarget: 1,
        maxTarget: 28,
        step: 1,
        description: 'Doses taken within scheduled window',
      },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: Brain,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    goals: [
      {
        id: 'meditation_minutes',
        name: 'Meditation Minutes',
        icon: Brain,
        unit: 'min',
        defaultTarget: 30,
        minTarget: 5,
        maxTarget: 120,
        step: 5,
        description: 'Total minutes of meditation per week',
      },
      {
        id: 'mindful_days',
        name: 'Mindful Days',
        icon: Heart,
        unit: 'days',
        defaultTarget: 4,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days with mindfulness practice',
      },
      {
        id: 'journaling_days',
        name: 'Journaling Days',
        icon: Book,
        unit: 'days',
        defaultTarget: 3,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days writing in a journal',
      },
      {
        id: 'gratitude_days',
        name: 'Gratitude Practice',
        icon: Heart,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days practicing gratitude',
      },
      {
        id: 'breathing_sessions',
        name: 'Deep Breathing',
        icon: Wind,
        unit: 'sessions',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 14,
        step: 1,
        description: 'Deep breathing sessions per week',
      },
      {
        id: 'digital_detox',
        name: 'Digital Detox Hours',
        icon: Smartphone,
        unit: 'hours',
        defaultTarget: 10,
        minTarget: 2,
        maxTarget: 30,
        step: 2,
        description: 'Hours away from devices per week',
      },
      {
        id: 'outdoor_time',
        name: 'Outdoor Time',
        icon: TreePine,
        unit: 'hours',
        defaultTarget: 7,
        minTarget: 1,
        maxTarget: 20,
        step: 1,
        description: 'Hours spent outdoors per week',
      },
      {
        id: 'morning_routine',
        name: 'Morning Routine Days',
        icon: Sunrise,
        unit: 'days',
        defaultTarget: 5,
        minTarget: 1,
        maxTarget: 7,
        step: 1,
        description: 'Days completing morning routine',
      },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Sparkles,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    goals: [],
  },
];

type Step = 'category' | 'goal' | 'target' | 'confirm';

interface AddGoalScreenProps {
  onBack: () => void;
  onSave?: (goal: { categoryId: string; goalId: string; target: number }) => void;
}

export default function AddGoalScreen({ onBack, onSave }: AddGoalScreenProps) {
  const [step, setStep] = useState<Step>('category');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalTemplate | null>(null);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [customGoalName, setCustomGoalName] = useState('');
  const [customGoalUnit, setCustomGoalUnit] = useState('days');

  const handleCategorySelect = (category: GoalCategory) => {
    setSelectedCategory(category);
    if (category.id === 'custom') {
      setStep('target');
    } else if (category.goals.length === 1) {
      // Auto-select if only one goal option
      setSelectedGoal(category.goals[0]);
      setTargetValue(category.goals[0].defaultTarget);
      setStep('target');
    } else {
      setStep('goal');
    }
  };

  const handleGoalSelect = (goal: GoalTemplate) => {
    setSelectedGoal(goal);
    setTargetValue(goal.defaultTarget);
    setStep('target');
  };

  const handleConfirm = () => {
    setStep('confirm');
    // In a real app, this would save to backend
    if (onSave && selectedCategory && (selectedGoal || selectedCategory.id === 'custom')) {
      onSave({
        categoryId: selectedCategory.id,
        goalId: selectedGoal?.id || 'custom',
        target: targetValue,
      });
    }
  };

  const handleBack = () => {
    if (step === 'category') {
      onBack();
    } else if (step === 'goal') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'target') {
      if (selectedCategory?.id === 'custom' || selectedCategory?.goals.length === 1) {
        setStep('category');
        setSelectedCategory(null);
      } else {
        setStep('goal');
        setSelectedGoal(null);
      }
    } else if (step === 'confirm') {
      onBack();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'category':
        return 'Choose a Category';
      case 'goal':
        return `${selectedCategory?.name} Goals`;
      case 'target':
        return 'Set Your Target';
      case 'confirm':
        return 'Goal Added!';
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-lg hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-text-primary">Add New Goal</h1>
            <p className="text-xs text-text-muted">{getStepTitle()}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Step 1: Category Selection */}
        {step === 'category' && (
          <div className="space-y-3">
            {goalCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${category.bgColor} ${category.borderColor}`}
                >
                  <div className={`p-3 rounded-xl ${category.bgColor} border ${category.borderColor}`}>
                    <Icon size={24} className={category.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-text-primary">{category.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {category.id === 'custom'
                        ? 'Create your own goal'
                        : `${category.goals.length} goal${category.goals.length !== 1 ? 's' : ''} available`}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-text-muted" />
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Goal Selection */}
        {step === 'goal' && selectedCategory && (
          <div className="space-y-3">
            {selectedCategory.goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] bg-surface border-border`}
                >
                  <div className={`p-3 rounded-xl ${selectedCategory.bgColor} border ${selectedCategory.borderColor}`}>
                    <Icon size={20} className={selectedCategory.color} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-text-primary">{goal.name}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{goal.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-text-muted" />
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Target Setting */}
        {step === 'target' && (
          <div className="space-y-6">
            {/* Goal Preview */}
            {selectedCategory && (
              <div className={`flex items-center gap-4 p-4 rounded-2xl ${selectedCategory.bgColor} border ${selectedCategory.borderColor}`}>
                <div className={`p-3 rounded-xl ${selectedCategory.bgColor} border ${selectedCategory.borderColor}`}>
                  {selectedGoal ? (
                    <selectedGoal.icon size={24} className={selectedCategory.color} />
                  ) : (
                    <selectedCategory.icon size={24} className={selectedCategory.color} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-text-primary">
                    {selectedGoal?.name || 'Custom Goal'}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedGoal?.description || 'Create your own weekly goal'}
                  </p>
                </div>
              </div>
            )}

            {/* Custom Goal Name Input */}
            {selectedCategory?.id === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Goal Name</label>
                <input
                  type="text"
                  value={customGoalName}
                  onChange={(e) => setCustomGoalName(e.target.value)}
                  placeholder="e.g., Read 30 minutes"
                  className="w-full px-4 py-3 bg-surface rounded-xl border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-amber-500/50"
                />
              </div>
            )}

            {/* Target Value Slider */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-text-secondary">Weekly Target</label>

              <div className="text-center py-6">
                <span className="text-5xl font-bold text-text-primary">{targetValue}</span>
                <span className="text-xl text-text-muted ml-2">
                  {selectedGoal?.unit || customGoalUnit}
                </span>
              </div>

              {selectedGoal ? (
                <input
                  type="range"
                  min={selectedGoal.minTarget}
                  max={selectedGoal.maxTarget}
                  step={selectedGoal.step}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-teal-500"
                />
              ) : (
                <>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full h-2 bg-surface-2 rounded-full appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex gap-2 mt-4">
                    {['days', 'times', 'min', 'hours'].map((unit) => (
                      <button
                        key={unit}
                        onClick={() => setCustomGoalUnit(unit)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          customGoalUnit === unit
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                            : 'bg-surface border border-border text-text-muted'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedGoal && (
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{selectedGoal.minTarget} {selectedGoal.unit}</span>
                  <span>{selectedGoal.maxTarget} {selectedGoal.unit}</span>
                </div>
              )}
            </div>

            {/* Add Goal Button */}
            <button
              onClick={handleConfirm}
              disabled={selectedCategory?.id === 'custom' && !customGoalName}
              className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              Add Goal
            </button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Goal Added!</h2>
            <p className="text-text-muted mb-8">
              {selectedGoal?.name || customGoalName} has been added to your weekly goals.
            </p>

            <div className="bg-surface rounded-2xl border border-border p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Target</span>
                <span className="text-lg font-bold text-text-primary">
                  {targetValue} {selectedGoal?.unit || customGoalUnit}
                </span>
              </div>
            </div>

            <button
              onClick={onBack}
              className="w-full py-4 bg-surface border border-border text-text-primary font-semibold rounded-xl transition-all hover:bg-surface-2"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
