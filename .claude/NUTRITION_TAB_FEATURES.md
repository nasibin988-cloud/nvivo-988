# NVIVO Nutrition Tab - Comprehensive Feature Specification

## Overview

The NVIVO Nutrition Tab is designed to be the most clinically-accurate, personalized nutrition tracking experience available. It combines AI-powered food recognition (GPT-5.1) with DRI-based evaluation derived from authoritative sources (NIH, FDA, WHO, AHA).

**Design Philosophy:**
- **Descriptive, not prescriptive**: We inform and educate; we do not provide medical advice or prescribe treatments
- **Evidence-based**: All nutritional data sourced from peer-reviewed guidelines and government databases
- **Personalized**: Targets adapt to user demographics and self-reported health information
- **Empowering**: Help users understand their nutrition, not just track numbers

**Regulatory Compliance Note:**
This app provides nutritional information and education. It is not intended to diagnose, treat, cure, or prevent any disease. Users with health conditions should consult healthcare providers for personalized medical advice. All nutrient evaluations are based on generally-accepted Dietary Reference Intakes (DRI) established by the National Academies of Sciences, Engineering, and Medicine.

---

## Data Foundation

### Source of Truth: JSON Reference Data

All nutritional logic derives from six curated JSON files:

| File | Purpose | Size |
|------|---------|------|
| `dri_by_lifestage.json` | DRI values (RDA, AI, UL, AMDR, CDRR) by age/sex/lifestage | 95KB |
| `nutrient_definitions.json` | Nutrient metadata, units, classifications, clinical interpretations | 92KB |
| `macros_fiber_fatty_acids.json` | Detailed macronutrient definitions | 23KB |
| `fda_daily_values.json` | FDA Daily Values for nutrition labeling | 10KB |
| `fda_nutrient_content_claims.json` | Thresholds for "Free", "Low", "High" claims | 10KB |
| `clinical_thresholds_and_overrides.json` | Condition-specific adjustments (informational) | 14KB |

**Data Sources:**
- National Institutes of Health (NIH) Office of Dietary Supplements
- USDA Dietary Guidelines for Americans 2020-2025
- FDA 21 CFR 101 (Nutrition Labeling)
- National Academies DRI Tables
- World Health Organization (WHO) Guidelines
- American Heart Association (AHA) Recommendations

---

## Core Features

### 1. Food Logging

#### 1.1 Photo-Based Food Recognition
- **Technology**: GPT-5.1 vision model (`gpt-5.1-2025-11-13`)
- **Flow**:
  1. User takes photo of food/meal
  2. AI identifies individual food items with portion estimates
  3. User confirms/adjusts identified items
  4. Nutrition data retrieved and logged

**Capabilities:**
- Multi-item recognition (full plate with multiple foods)
- Portion size estimation (small/medium/large, cups, pieces)
- Meal type auto-detection (breakfast/lunch/dinner/snack based on time and context)
- Confidence scoring for each identified item
- Support for packaged foods, restaurant meals, and home cooking

#### 1.2 Text-Based Food Entry
- Natural language input: "grilled chicken breast with brown rice and steamed broccoli"
- AI parses into individual foods with estimated portions
- Fuzzy matching to USDA FoodData Central database

#### 1.3 Barcode Scanning
- UPC barcode recognition
- Links to packaged food nutrition data
- Falls back to manual entry if product not found

#### 1.4 USDA Food Search
- Search USDA FoodData Central database
- Filter by food category
- Select specific portion sizes
- View complete nutrient profile

#### 1.5 Quick Add Options
- **Favorites**: Save frequently eaten foods for one-tap logging
- **Recent**: Access last 20 logged items
- **Recurring Meals**: AI-detected meal patterns ("You often have oatmeal on weekday mornings")
- **Copy Meal**: Duplicate a previous meal to today

#### 1.6 Manual Entry
- Enter calories and macros directly
- Optional: add micronutrients
- Useful for restaurant meals with published nutrition info

---

### 2. Nutrition Evaluation System

#### 2.1 Personalized Daily Targets

Targets are computed based on user profile:

**Demographics:**
- Age (determines age bracket: 19-30, 31-50, 51-70, 70+)
- Biological sex (affects iron, calcium, and other sex-specific DRIs)
- Weight and height (for BMR calculation)
- Activity level (sedentary, light, moderate, high, athlete)

**Life Stage Adjustments:**
- Pregnancy (increased folate, iron, choline, etc.)
- Lactation (increased vitamin A, vitamin C, iodine, etc.)

**Self-Reported Health Information:**
Users may optionally indicate health conditions. When present, the app displays relevant educational information about how nutrition relates to these conditions. *The app does not provide medical advice or treatment recommendations.*

**Calorie Estimation:**
Uses Mifflin-St Jeor equation:
- Male: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age + 5
- Female: BMR = 10×weight(kg) + 6.25×height(cm) - 5×age - 161
- TDEE = BMR × activity multiplier
- Goal adjustment applied (weight management, maintenance, athletic performance)

#### 2.2 Nutrient Classification System

Each nutrient is classified by its nature:

| Classification | Nutrients | Interpretation |
|---------------|-----------|----------------|
| **Beneficial** | Protein, fiber, vitamins, calcium, iron, potassium, etc. | Higher intake (up to UL) is generally positive |
| **Limit** | Sodium, saturated fat, trans fat, added sugars, cholesterol | Lower intake is generally recommended |
| **Neutral** | Total fat, carbohydrates, total sugars, calories | Context-dependent; quality matters more than quantity |

#### 2.3 Intake Evaluation

For each nutrient, the system calculates:
- **Amount consumed** (from logged foods)
- **Daily target** (personalized DRI)
- **Percent of target** (amount ÷ target × 100)
- **Percent of Upper Limit** (if UL exists)
- **Classification** (based on thresholds below)

**Evaluation Thresholds:**

For beneficial nutrients (% of RDA/AI):
| Status | Threshold | Visual |
|--------|-----------|--------|
| Excellent | ≥100% | Green |
| Good | 67-99% | Light green |
| Below target | 33-66% | Yellow |
| Low | <33% | Orange |

For limit nutrients (% of limit/CDRR):
| Status | Threshold | Visual |
|--------|-----------|--------|
| Well within | <50% | Green |
| Moderate | 50-80% | Yellow |
| Approaching limit | 80-100% | Orange |
| Exceeds | >100% | Red |

#### 2.4 Daily Nutrition Score

An aggregate score (0-100) reflecting overall daily nutrition quality:

**Calculation:**
- Each of ~15 key nutrients contributes points
- Beneficial nutrients: points for meeting targets (max when at 100%+)
- Limit nutrients: points for staying under limits (max when well below)
- Weighted by nutrient importance (e.g., fiber and sodium weighted higher)
- Penalized for extremes (both deficiency and excess)

**Score Interpretation:**
| Score | Rating | Description |
|-------|--------|-------------|
| 90-100 | Excellent | Meeting nearly all targets |
| 75-89 | Good | Most targets met, minor gaps |
| 60-74 | Fair | Several nutrients need attention |
| 40-59 | Needs improvement | Multiple significant gaps |
| <40 | Poor | Significant nutritional imbalances |

*Note: This score is for personal tracking and education. It is not a medical assessment.*

---

### 3. Daily Dashboard

#### 3.1 Summary View

**Hero Section:**
- Daily nutrition score (0-100) with circular progress indicator
- Calorie summary: consumed vs. target with visual progress bar
- Quick stats: meals logged, water intake, streak count

**Macro Overview:**
- Four macro orbs: Protein, Carbs, Fat, Fiber
- Animated circular progress showing % of target
- Tap for detailed breakdown

**Key Nutrients Panel:**
- Scrollable cards for important nutrients
- Shows: current intake, target, % achieved
- Color-coded status indicators
- Priority order based on user profile (e.g., iron prioritized for menstruating women)

#### 3.2 Meal Timeline

Chronological view of today's logged foods:
- Meal type headers (Breakfast, Lunch, Dinner, Snacks)
- Individual food items with calories and key macros
- AI-analyzed badge for photo-logged items
- Expandable to see full nutrient breakdown
- Edit/delete options

#### 3.3 Water Tracker

- Glass-based tracking (8 oz per glass)
- Visual representation of daily goal
- Quick-add buttons (+1 glass, +bottle)
- Hydration streak tracking

#### 3.4 Nutrient Gaps & Highlights

**Today's Highlights** (top 3 well-met nutrients):
- "Great job on fiber today - 115% of target"
- "Strong protein intake - 98% of target"

**Areas to Consider** (top 3 gaps):
- "Vitamin D at 45% of target"
- "Potassium at 52% of target"

*Presented as observations, not directives.*

---

### 4. Nutrient Deep Dives

#### 4.1 Nutrient Detail View

Tap any nutrient to see comprehensive information:

**Current Status:**
- Today's intake vs. target
- Visual progress bar
- 7-day average
- Trend indicator (improving/stable/declining)

**About This Nutrient:**
Pulled from `clinicalInterpretation` in JSON:
- **What it does**: Role in the body
- **Signs of low intake**: General symptoms associated with deficiency
- **Considerations for high intake**: Information about upper limits
- **Common food sources**: List of foods rich in this nutrient

**Your Intake History:**
- Line chart showing past 7/30/90 days
- Target line overlay
- Tap data points for daily details

**Top Sources in Your Diet:**
- Pie chart of foods contributing to this nutrient
- "Your top sources this week: Spinach (23%), Chicken breast (18%), Greek yogurt (15%)"

#### 4.2 Macronutrient Distribution

Visual breakdown of calorie sources:
- Donut chart: % from carbs, protein, fat, alcohol
- Comparison to AMDR ranges
- "Your distribution: 48% carbs, 22% protein, 30% fat"
- "AMDR ranges: 45-65% carbs, 10-35% protein, 20-35% fat"

---

### 5. History & Trends

#### 5.1 Calendar Heatmap

Monthly view with color-coded days:
- Intensity based on daily nutrition score
- Tap any day to see summary
- Visual patterns emerge (weekends different from weekdays, etc.)

#### 5.2 Trend Charts

**Nutrient Trends:**
- Select any nutrient to view over time
- 7-day, 30-day, 90-day, 1-year views
- Target line overlay
- Moving average smoothing option

**Score Trends:**
- Daily nutrition score over time
- Weekly averages
- Identify improvement patterns

#### 5.3 Pattern Recognition

AI-detected insights (observational, not prescriptive):
- "Your sodium intake is typically higher on weekends"
- "You tend to meet fiber goals more often when you eat breakfast"
- "Your vitamin D intake has been below target for the past 3 weeks"

---

### 6. Food Analysis Tools

#### 6.1 Menu Scanner

For restaurant menus:
1. Photograph menu
2. OCR extracts menu items
3. AI estimates nutrition for each item
4. Compare options side-by-side
5. See how each would affect daily totals

**Output:**
- Estimated calories, macros, sodium for each item
- Relative comparison ("Option A has ~40% less sodium than Option B")
- Disclaimer: "Estimates based on typical recipes; actual values may vary"

#### 6.2 Food Comparison Tool

Compare two foods side-by-side:
- Nutrient-by-nutrient comparison
- Visual bar charts
- Highlight significant differences
- "Per serving, almonds have 6x more vitamin E than peanuts"

#### 6.3 Recipe Analyzer

Enter or photograph a recipe:
- AI parses ingredients
- Calculates total and per-serving nutrition
- Breakdown by ingredient contribution
- "The butter contributes 65% of the saturated fat in this recipe"

#### 6.4 "What If" Simulator

Preview how a food would affect your day:
- Enter a food you're considering
- See projected daily totals
- "Adding this would bring your sodium to 95% of target"
- Make informed decisions before eating

---

### 7. Nutrition Education

#### 7.1 Nutrient Encyclopedia

Comprehensive reference for all tracked nutrients:
- Searchable index
- Categories: Macronutrients, Vitamins, Minerals, Other
- Each entry includes:
  - Description and function
  - DRI values by demographic
  - Food sources
  - Absorption factors
  - Clinical interpretation
- All content sourced from authoritative references

#### 7.2 Learning Modules

Short educational content:
- "Understanding Nutrition Labels"
- "What Are DRIs and Why They Matter"
- "Fiber: Types and Benefits"
- "Sodium and Your Health"
- "Omega-3 Fatty Acids Explained"

*Educational content only - not medical advice*

#### 7.3 Contextual Tips

Non-prescriptive suggestions based on patterns:
- "Vitamin C helps with iron absorption - foods rich in both can be complementary"
- "Fiber intake is associated with digestive health"
- "Staying hydrated supports overall wellness"

Framed as general nutrition education, not personal medical recommendations.

---

### 8. Reports & Exports

#### 8.1 Weekly Summary

Automated weekly digest (in-app and optional email):
- Average daily score
- Nutrients consistently met vs. gaps
- Top food sources (positive contributors)
- Comparison to previous week
- Observational insights

#### 8.2 Custom Date Range Reports

Generate reports for any date range:
- Average intake for all nutrients
- Comparison to DRI targets
- Visual charts
- Export as PDF

#### 8.3 Healthcare Provider Export

Generate a summary to share with healthcare providers:
- Professional formatting
- Date range selection
- Includes: average intake, trends, nutrient breakdown
- Clearly labeled as "self-reported dietary intake data"
- Disclaimer: "This report reflects user-logged food intake and is not a medical assessment"

#### 8.4 Data Export

Export raw data:
- CSV format
- All logged foods with timestamps
- Nutrient totals by day
- For personal records or third-party analysis

---

### 9. Personalization & Settings

#### 9.1 Profile Configuration

**Basic Info:**
- Date of birth
- Biological sex
- Height and weight
- Activity level

**Goals:**
- Weight management (maintenance, gradual loss, gradual gain)
- Athletic performance
- General wellness

**Life Stage:**
- Pregnancy status
- Lactation status

**Health Information (Optional):**
Users may indicate conditions for educational context:
- Displays relevant general nutrition information
- Does NOT change targets without explicit user action
- Clear labeling: "For informational purposes only"

#### 9.2 Nutrient Preferences

**Priority Nutrients:**
- Select which nutrients to highlight on dashboard
- Default set based on demographic profile
- User can customize

**Display Preferences:**
- Show/hide specific nutrients
- Compact vs. detailed view
- Color theme

#### 9.3 Notification Settings

**Optional Reminders:**
- Meal logging reminders
- Water intake reminders
- Weekly summary notifications

**Digest Preferences:**
- Daily summary: on/off, time
- Weekly report: on/off, day

---

### 10. Smart Features

#### 10.1 Intelligent Suggestions

Based on logged intake patterns (observational):
- "You haven't logged any food sources of vitamin D today"
- "Your fiber intake is at 40% - foods like beans, berries, or whole grains are good sources"
- "You've met your protein target - nice work!"

*Suggestions reference food categories, not specific prescriptive actions*

#### 10.2 Meal Pattern Recognition

AI learns from user's eating habits:
- Identifies common meals
- Suggests quick-logging for repeated patterns
- "Log your usual breakfast?" (one-tap)

#### 10.3 Gap Identification

Daily analysis of nutrient gaps:
- Highlights nutrients below 50% of target
- Lists common food sources for those nutrients
- "Foods high in [nutrient]: [list]"

*Informational only - user decides what to eat*

#### 10.4 Food Source Recommendations

When viewing a low nutrient:
- Display foods from USDA database high in that nutrient
- Filter by user's dietary preferences (vegetarian, etc.)
- Show serving size needed to meet percentage of target

---

### 11. Gamification & Engagement

#### 11.1 Streaks

- Logging streak (consecutive days with food logged)
- Hydration streak (meeting water goal)
- "Complete day" streak (logging all meals)

#### 11.2 Achievements

Milestone badges:
- First photo log
- 7-day logging streak
- 30 days of meeting fiber target
- Logged 100 different foods
- First weekly report

#### 11.3 Progress Celebrations

- Confetti animation when hitting daily score milestones
- Weekly improvement acknowledgment
- Monthly nutrition summary with highlights

#### 11.4 Challenges (Optional)

Self-set goals:
- "Log every meal this week"
- "Try 5 new vegetables this month"
- "Meet fiber target for 7 consecutive days"

*User-driven, not prescriptive*

---

### 12. Integration Features

#### 12.1 Wearable Device Sync

Import activity data for calorie adjustment:
- Apple Health
- Google Fit
- Fitbit
- Garmin
- Other Terra-supported devices

Activity adjusts TDEE calculation for more accurate calorie targets.

#### 12.2 Health App Integration

Export nutrition data to:
- Apple Health (iOS)
- Google Fit (Android)
- Other compatible apps

#### 12.3 Calendar Integration

- View logged meals on calendar
- Optional meal planning integration
- Reminders synced with device calendar

---

### 13. Accessibility & Inclustic Design

#### 13.1 Accessibility Features

- VoiceOver/TalkBack support
- High contrast mode
- Adjustable text sizes
- Color-blind friendly palettes
- Screen reader optimized

#### 13.2 Language Support

- Multi-language UI (English, Spanish initially)
- Localized food databases where available
- Metric/Imperial unit options

#### 13.3 Dietary Accommodation

Filters and preferences for:
- Vegetarian/Vegan
- Gluten-free
- Dairy-free
- Halal/Kosher
- Common allergens

Affects food suggestions and search results.

---

## Technical Specifications

### AI Model

- **Model**: GPT-5.1 (`gpt-5.1-2025-11-13`)
- **Capabilities**: Vision, natural language understanding, structured output
- **Use Cases**: Photo food recognition, text parsing, menu scanning, recipe analysis

### Data Sources

- **USDA FoodData Central**: Primary food composition database
- **JSON Reference Files**: DRI values, nutrient definitions, clinical interpretations
- **User Profile**: Firestore document with demographics and preferences

### Evaluation Engine

- **Location**: Cloud Functions (`functions/src/domains/nutrition/`)
- **Architecture**: JSON-first - all reference data from JSON files
- **Performance Target**: <100ms evaluation per food item

### Frontend

- **Framework**: React Native (patient app)
- **State Management**: React Query for server state
- **Charts**: React Native SVG Charts / Victory Native
- **Animations**: React Native Reanimated

---

## Regulatory & Compliance Notes

### FDA Compliance

This application is classified as a **general wellness product** providing:
- Nutrition tracking and logging
- Educational information about nutrients
- Personalized reference values based on published DRIs

**The application does NOT:**
- Diagnose any disease or condition
- Prescribe treatments or specific diets
- Make claims about preventing, treating, or curing diseases
- Provide medical advice

### Disclaimers (Displayed in App)

**General Disclaimer:**
> "NVIVO provides nutrition information for educational purposes only. This app is not intended to diagnose, treat, cure, or prevent any disease. The information provided is based on Dietary Reference Intakes (DRIs) established by the National Academies of Sciences, Engineering, and Medicine. Always consult with a qualified healthcare provider before making changes to your diet, especially if you have a medical condition."

**Evaluation Disclaimer:**
> "Nutrient evaluations are based on your self-reported profile and generally-accepted dietary reference values. Individual needs may vary. This is not a medical assessment."

**AI Analysis Disclaimer:**
> "Nutrition estimates from photos are approximations based on AI analysis. Actual values may differ. For precise nutrition information, refer to food packaging or USDA database entries."

### Data Privacy

- All food logs stored securely in user's private Firestore document
- No nutrition data shared with third parties without explicit consent
- Export and delete options available
- HIPAA-compliant infrastructure (when integrated with clinical features)

---

## Future Considerations

*The following features are under consideration for future releases:*

- Lab result integration (with explicit user consent and appropriate disclaimers)
- Healthcare provider portal access (patient-initiated sharing)
- Meal planning tools
- Grocery list generation
- Family nutrition tracking
- Social features (opt-in challenges with friends)
- Advanced trend analysis and predictions

---

## Summary

The NVIVO Nutrition Tab combines:

1. **Effortless Logging**: Photo AI, barcode scanning, natural language, quick-add
2. **Clinical Accuracy**: DRI-based targets from authoritative sources
3. **Personalization**: Adapts to demographics and user preferences
4. **Rich Education**: Comprehensive nutrient information and interpretations
5. **Insightful Analytics**: Trends, patterns, and observational insights
6. **Engaging Experience**: Streaks, achievements, and progress celebrations
7. **Responsible Design**: Descriptive, educational, non-prescriptive

This creates the most comprehensive, accurate, and user-friendly nutrition tracking experience available - empowering users with knowledge while respecting the boundaries of consumer health applications.
