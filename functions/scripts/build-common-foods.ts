/**
 * Build Common Foods Database from USDA FoodData Central API
 *
 * This script fetches nutrition data for ~200 commonly logged foods from the
 * USDA FoodData Central database and outputs a JSON file for the lookup system.
 *
 * Strategy:
 * 1. Use curated list of most commonly logged foods (based on food tracking apps data)
 * 2. Query USDA API for each food, preferring "Foundation" and "SR Legacy" data types
 * 3. Extract all 35+ nutrients with proper unit conversions
 * 4. Include multiple lookup keys for each food (variations, common names)
 *
 * Run: npx ts-node scripts/build-common-foods.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load API key from .secret.local
const secretPath = path.join(__dirname, '..', '.secret.local');
const secrets = fs.readFileSync(secretPath, 'utf-8');
const USDA_API_KEY = secrets.match(/USDA_API_KEY=(.+)/)?.[1]?.trim();

if (!USDA_API_KEY) {
  console.error('USDA_API_KEY not found in .secret.local');
  process.exit(1);
}

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';

// ============================================================================
// FOOD LIST - Curated list of most commonly logged foods
// Organized by category for completeness
// ============================================================================

interface FoodQuery {
  searchTerm: string;
  lookupKeys: string[];  // Keys to use in the lookup (lowercase)
  preferredServingDesc?: string;  // Preferred serving size description
  servingAmount?: number;  // Override serving amount
  servingUnit?: string;  // Override serving unit
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'unknown';
  fdcId?: number;  // Direct FDC ID if known (more accurate)
}

const COMMON_FOODS: FoodQuery[] = [
  // =========== FRUITS ===========
  { searchTerm: 'banana raw', lookupKeys: ['banana', 'bananas'], mealType: 'snack', servingUnit: 'medium (118g)' },
  { searchTerm: 'apple raw with skin', lookupKeys: ['apple', 'apples'], mealType: 'snack', servingUnit: 'medium (182g)' },
  { searchTerm: 'orange raw navels', lookupKeys: ['orange', 'oranges'], mealType: 'snack', servingUnit: 'medium (131g)' },
  { searchTerm: 'strawberries raw', lookupKeys: ['strawberries', 'strawberry'], mealType: 'snack', servingUnit: 'cup (144g)' },
  { searchTerm: 'blueberries raw', lookupKeys: ['blueberries', 'blueberry'], mealType: 'snack', servingUnit: 'cup (148g)' },
  { searchTerm: 'grapes red raw', lookupKeys: ['grapes', 'grape'], mealType: 'snack', servingUnit: 'cup (151g)' },
  { searchTerm: 'watermelon raw', lookupKeys: ['watermelon'], mealType: 'snack', servingUnit: 'cup diced (152g)' },
  { searchTerm: 'mangos raw', lookupKeys: ['mango', 'mangos', 'mangoes'], mealType: 'snack', servingUnit: 'cup (165g)' },
  { searchTerm: 'pineapple raw', lookupKeys: ['pineapple'], mealType: 'snack', servingUnit: 'cup chunks (165g)' },
  { searchTerm: 'peaches yellow raw', lookupKeys: ['peach', 'peaches'], mealType: 'snack', servingUnit: 'medium (150g)' },
  { searchTerm: 'pears raw', lookupKeys: ['pear', 'pears'], mealType: 'snack', servingUnit: 'medium (178g)' },
  { searchTerm: 'raspberries raw', lookupKeys: ['raspberries', 'raspberry'], mealType: 'snack', servingUnit: 'cup (123g)' },
  { searchTerm: 'cherries sweet raw', lookupKeys: ['cherries', 'cherry'], mealType: 'snack', servingUnit: 'cup (138g)' },
  { searchTerm: 'kiwifruit green raw', lookupKeys: ['kiwi', 'kiwifruit'], mealType: 'snack', servingUnit: 'medium (69g)' },
  { searchTerm: 'cantaloupe melon raw', lookupKeys: ['cantaloupe', 'melon'], mealType: 'snack', servingUnit: 'cup (160g)' },
  { searchTerm: 'avocados raw california', lookupKeys: ['avocado', 'avocados'], mealType: 'lunch', servingUnit: 'medium (150g)' },
  { searchTerm: 'grapefruit raw pink', lookupKeys: ['grapefruit'], mealType: 'breakfast', servingUnit: 'half (123g)' },
  { searchTerm: 'lemons raw without peel', lookupKeys: ['lemon', 'lemons'], mealType: 'unknown', servingUnit: 'medium (84g)' },
  { searchTerm: 'limes raw', lookupKeys: ['lime', 'limes'], mealType: 'unknown', servingUnit: 'medium (67g)' },
  { searchTerm: 'plums raw', lookupKeys: ['plum', 'plums'], mealType: 'snack', servingUnit: 'medium (66g)' },

  // =========== VEGETABLES ===========
  { searchTerm: 'broccoli cooked boiled', lookupKeys: ['broccoli', 'broccoli cooked'], mealType: 'dinner', servingUnit: 'cup (156g)' },
  { searchTerm: 'spinach raw', lookupKeys: ['spinach', 'spinach raw'], mealType: 'lunch', servingUnit: 'cup (30g)' },
  { searchTerm: 'carrot raw', lookupKeys: ['carrot', 'carrots'], mealType: 'snack', servingUnit: 'medium (61g)' },
  { searchTerm: 'tomato raw', lookupKeys: ['tomato', 'tomatoes'], mealType: 'lunch', servingUnit: 'medium (123g)' },
  { searchTerm: 'potato baked flesh and skin', lookupKeys: ['potato', 'baked potato'], mealType: 'dinner', servingUnit: 'medium (173g)' },
  { searchTerm: 'sweet potato baked', lookupKeys: ['sweet potato', 'yam'], mealType: 'dinner', servingUnit: 'medium (114g)' },
  { searchTerm: 'onion raw', lookupKeys: ['onion', 'onions'], mealType: 'unknown', servingUnit: 'medium (110g)' },
  { searchTerm: 'bell pepper red raw', lookupKeys: ['bell pepper', 'red pepper', 'pepper'], mealType: 'snack', servingUnit: 'medium (119g)' },
  { searchTerm: 'cucumber raw with peel', lookupKeys: ['cucumber', 'cucumbers'], mealType: 'snack', servingUnit: 'cup sliced (104g)' },
  { searchTerm: 'celery raw', lookupKeys: ['celery'], mealType: 'snack', servingUnit: 'stalk (40g)' },
  { searchTerm: 'lettuce iceberg raw', lookupKeys: ['lettuce', 'iceberg lettuce'], mealType: 'lunch', servingUnit: 'cup shredded (72g)' },
  { searchTerm: 'kale raw', lookupKeys: ['kale'], mealType: 'lunch', servingUnit: 'cup chopped (67g)' },
  { searchTerm: 'cauliflower raw', lookupKeys: ['cauliflower'], mealType: 'snack', servingUnit: 'cup (100g)' },
  { searchTerm: 'zucchini raw', lookupKeys: ['zucchini', 'courgette'], mealType: 'dinner', servingUnit: 'medium (196g)' },
  { searchTerm: 'mushrooms white raw', lookupKeys: ['mushroom', 'mushrooms'], mealType: 'dinner', servingUnit: 'cup sliced (70g)' },
  { searchTerm: 'asparagus cooked boiled', lookupKeys: ['asparagus'], mealType: 'dinner', servingUnit: 'cup (180g)' },
  { searchTerm: 'green beans cooked boiled', lookupKeys: ['green beans', 'string beans'], mealType: 'dinner', servingUnit: 'cup (125g)' },
  { searchTerm: 'corn sweet yellow cooked', lookupKeys: ['corn', 'sweet corn'], mealType: 'dinner', servingUnit: 'ear medium (90g)' },
  { searchTerm: 'peas green cooked', lookupKeys: ['peas', 'green peas'], mealType: 'dinner', servingUnit: 'cup (160g)' },
  { searchTerm: 'cabbage raw', lookupKeys: ['cabbage'], mealType: 'lunch', servingUnit: 'cup shredded (89g)' },
  { searchTerm: 'brussels sprouts cooked', lookupKeys: ['brussels sprouts', 'brussel sprouts'], mealType: 'dinner', servingUnit: 'cup (156g)' },
  { searchTerm: 'eggplant cooked', lookupKeys: ['eggplant', 'aubergine'], mealType: 'dinner', servingUnit: 'cup cubed (99g)' },
  { searchTerm: 'artichoke cooked', lookupKeys: ['artichoke', 'artichokes'], mealType: 'dinner', servingUnit: 'medium (120g)' },
  { searchTerm: 'beet raw', lookupKeys: ['beet', 'beets', 'beetroot'], mealType: 'lunch', servingUnit: 'cup (136g)' },

  // =========== PROTEINS - MEAT ===========
  { searchTerm: 'chicken breast roasted', lookupKeys: ['chicken breast', 'chicken', 'grilled chicken'], mealType: 'lunch', servingUnit: 'breast (172g)' },
  { searchTerm: 'beef ground 85% lean pan-browned', lookupKeys: ['ground beef', 'beef', 'hamburger meat'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'turkey breast roasted', lookupKeys: ['turkey breast', 'turkey'], mealType: 'lunch', servingUnit: '3 oz (85g)' },
  { searchTerm: 'pork chop boneless cooked', lookupKeys: ['pork chop', 'pork'], mealType: 'dinner', servingUnit: 'chop (145g)' },
  { searchTerm: 'bacon pork cooked', lookupKeys: ['bacon'], mealType: 'breakfast', servingUnit: '3 slices (34g)' },
  { searchTerm: 'sausage pork cooked', lookupKeys: ['sausage', 'pork sausage'], mealType: 'breakfast', servingUnit: 'link (25g)' },
  { searchTerm: 'ham sliced', lookupKeys: ['ham', 'deli ham'], mealType: 'lunch', servingUnit: '3 slices (84g)' },
  { searchTerm: 'steak beef ribeye grilled', lookupKeys: ['steak', 'ribeye', 'beef steak'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'lamb chop cooked', lookupKeys: ['lamb', 'lamb chop'], mealType: 'dinner', servingUnit: 'chop (80g)' },
  { searchTerm: 'chicken thigh roasted', lookupKeys: ['chicken thigh'], mealType: 'dinner', servingUnit: 'thigh (52g)' },
  { searchTerm: 'chicken wing roasted', lookupKeys: ['chicken wing', 'chicken wings'], mealType: 'dinner', servingUnit: 'wing (34g)' },
  { searchTerm: 'hot dog beef', lookupKeys: ['hot dog', 'hotdog', 'frankfurter'], mealType: 'lunch', servingUnit: '1 frank (45g)' },

  // =========== PROTEINS - SEAFOOD ===========
  { searchTerm: 'salmon atlantic cooked', lookupKeys: ['salmon', 'salmon fillet'], mealType: 'dinner', servingUnit: 'fillet (154g)' },
  { searchTerm: 'tuna light canned in water', lookupKeys: ['tuna', 'canned tuna', 'tuna fish'], mealType: 'lunch', servingUnit: '3 oz (85g)' },
  { searchTerm: 'shrimp cooked', lookupKeys: ['shrimp', 'prawns'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'tilapia cooked', lookupKeys: ['tilapia', 'tilapia fillet'], mealType: 'dinner', servingUnit: 'fillet (87g)' },
  { searchTerm: 'cod atlantic cooked', lookupKeys: ['cod', 'cod fish'], mealType: 'dinner', servingUnit: 'fillet (90g)' },
  { searchTerm: 'crab meat cooked', lookupKeys: ['crab', 'crab meat'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'lobster cooked', lookupKeys: ['lobster'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'sardines canned in oil', lookupKeys: ['sardines'], mealType: 'lunch', servingUnit: 'can (92g)' },
  { searchTerm: 'scallops cooked', lookupKeys: ['scallops'], mealType: 'dinner', servingUnit: '3 oz (85g)' },
  { searchTerm: 'trout rainbow cooked', lookupKeys: ['trout', 'rainbow trout'], mealType: 'dinner', servingUnit: 'fillet (71g)' },

  // =========== EGGS & DAIRY ===========
  { searchTerm: 'egg whole cooked scrambled', lookupKeys: ['egg', 'eggs', 'scrambled egg', 'scrambled eggs'], mealType: 'breakfast', servingUnit: 'large (50g)' },
  { searchTerm: 'egg whole hard-boiled', lookupKeys: ['boiled egg', 'hard boiled egg'], mealType: 'breakfast', servingUnit: 'large (50g)' },
  { searchTerm: 'egg whole fried', lookupKeys: ['fried egg'], mealType: 'breakfast', servingUnit: 'large (46g)' },
  { searchTerm: 'milk reduced fat 2%', lookupKeys: ['milk', '2% milk'], mealType: 'breakfast', servingUnit: 'cup (244g)' },
  { searchTerm: 'milk whole', lookupKeys: ['whole milk'], mealType: 'breakfast', servingUnit: 'cup (244g)' },
  { searchTerm: 'milk skim nonfat', lookupKeys: ['skim milk', 'nonfat milk', 'fat free milk'], mealType: 'breakfast', servingUnit: 'cup (245g)' },
  { searchTerm: 'yogurt greek plain nonfat', lookupKeys: ['greek yogurt', 'yogurt', 'plain yogurt'], mealType: 'breakfast', servingUnit: 'cup (245g)' },
  { searchTerm: 'cheese cheddar', lookupKeys: ['cheddar cheese', 'cheese', 'cheddar'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'cheese mozzarella', lookupKeys: ['mozzarella', 'mozzarella cheese'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'cheese parmesan grated', lookupKeys: ['parmesan', 'parmesan cheese'], mealType: 'dinner', servingUnit: 'tbsp (5g)' },
  { searchTerm: 'cheese swiss', lookupKeys: ['swiss cheese'], mealType: 'lunch', servingUnit: 'oz (28g)' },
  { searchTerm: 'cheese cream', lookupKeys: ['cream cheese'], mealType: 'breakfast', servingUnit: 'tbsp (14g)' },
  { searchTerm: 'cottage cheese low fat', lookupKeys: ['cottage cheese'], mealType: 'snack', servingUnit: 'cup (226g)' },
  { searchTerm: 'sour cream', lookupKeys: ['sour cream'], mealType: 'dinner', servingUnit: 'tbsp (12g)' },
  { searchTerm: 'butter salted', lookupKeys: ['butter'], mealType: 'breakfast', servingUnit: 'tbsp (14g)' },
  { searchTerm: 'ice cream vanilla', lookupKeys: ['ice cream', 'vanilla ice cream'], mealType: 'snack', servingUnit: 'cup (132g)' },

  // =========== GRAINS & CEREALS ===========
  { searchTerm: 'rice white cooked', lookupKeys: ['rice', 'white rice', 'steamed rice'], mealType: 'lunch', servingUnit: 'cup (158g)' },
  { searchTerm: 'rice brown cooked', lookupKeys: ['brown rice'], mealType: 'dinner', servingUnit: 'cup (195g)' },
  { searchTerm: 'bread whole wheat', lookupKeys: ['bread', 'whole wheat bread', 'wheat bread'], mealType: 'breakfast', servingUnit: 'slice (28g)' },
  { searchTerm: 'bread white', lookupKeys: ['white bread'], mealType: 'breakfast', servingUnit: 'slice (25g)' },
  { searchTerm: 'pasta cooked', lookupKeys: ['pasta', 'spaghetti', 'noodles'], mealType: 'dinner', servingUnit: 'cup (140g)' },
  { searchTerm: 'oatmeal cooked', lookupKeys: ['oatmeal', 'oats', 'porridge'], mealType: 'breakfast', servingUnit: 'cup (234g)' },
  { searchTerm: 'quinoa cooked', lookupKeys: ['quinoa'], mealType: 'lunch', servingUnit: 'cup (185g)' },
  { searchTerm: 'tortilla flour', lookupKeys: ['tortilla', 'flour tortilla'], mealType: 'lunch', servingUnit: 'medium (45g)' },
  { searchTerm: 'tortilla corn', lookupKeys: ['corn tortilla'], mealType: 'dinner', servingUnit: 'medium (26g)' },
  { searchTerm: 'bagel plain', lookupKeys: ['bagel'], mealType: 'breakfast', servingUnit: 'medium (98g)' },
  { searchTerm: 'cereal bran flakes', lookupKeys: ['cereal', 'bran flakes', 'breakfast cereal'], mealType: 'breakfast', servingUnit: 'cup (40g)' },
  { searchTerm: 'granola', lookupKeys: ['granola'], mealType: 'breakfast', servingUnit: 'cup (61g)' },
  { searchTerm: 'crackers saltine', lookupKeys: ['crackers', 'saltines'], mealType: 'snack', servingUnit: '5 crackers (15g)' },
  { searchTerm: 'croissant', lookupKeys: ['croissant'], mealType: 'breakfast', servingUnit: 'medium (57g)' },
  { searchTerm: 'english muffin', lookupKeys: ['english muffin'], mealType: 'breakfast', servingUnit: 'muffin (57g)' },
  { searchTerm: 'pancake', lookupKeys: ['pancake', 'pancakes'], mealType: 'breakfast', servingUnit: 'medium (38g)' },
  { searchTerm: 'waffle frozen', lookupKeys: ['waffle', 'waffles'], mealType: 'breakfast', servingUnit: 'waffle (35g)' },
  { searchTerm: 'couscous cooked', lookupKeys: ['couscous'], mealType: 'dinner', servingUnit: 'cup (157g)' },
  { searchTerm: 'cornbread', lookupKeys: ['cornbread'], mealType: 'dinner', servingUnit: 'piece (60g)' },

  // =========== LEGUMES & BEANS ===========
  { searchTerm: 'beans black cooked', lookupKeys: ['black beans', 'beans'], mealType: 'dinner', servingUnit: 'cup (172g)' },
  { searchTerm: 'beans kidney cooked', lookupKeys: ['kidney beans'], mealType: 'dinner', servingUnit: 'cup (177g)' },
  { searchTerm: 'chickpeas cooked', lookupKeys: ['chickpeas', 'garbanzo beans'], mealType: 'lunch', servingUnit: 'cup (164g)' },
  { searchTerm: 'lentils cooked', lookupKeys: ['lentils'], mealType: 'dinner', servingUnit: 'cup (198g)' },
  { searchTerm: 'peanuts dry roasted', lookupKeys: ['peanuts'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'peanut butter smooth', lookupKeys: ['peanut butter', 'pb'], mealType: 'snack', servingUnit: '2 tbsp (32g)' },
  { searchTerm: 'hummus', lookupKeys: ['hummus'], mealType: 'snack', servingUnit: 'tbsp (14g)' },
  { searchTerm: 'tofu firm', lookupKeys: ['tofu'], mealType: 'dinner', servingUnit: 'cup (126g)' },
  { searchTerm: 'edamame cooked', lookupKeys: ['edamame'], mealType: 'snack', servingUnit: 'cup (155g)' },
  { searchTerm: 'soybeans cooked', lookupKeys: ['soybeans'], mealType: 'dinner', servingUnit: 'cup (172g)' },

  // =========== NUTS & SEEDS ===========
  { searchTerm: 'almonds dry roasted', lookupKeys: ['almonds'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'walnuts', lookupKeys: ['walnuts'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'cashews dry roasted', lookupKeys: ['cashews'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'pistachios dry roasted', lookupKeys: ['pistachios'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'pecans', lookupKeys: ['pecans'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'macadamia nuts', lookupKeys: ['macadamia', 'macadamia nuts'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'sunflower seeds dry roasted', lookupKeys: ['sunflower seeds'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'chia seeds', lookupKeys: ['chia seeds', 'chia'], mealType: 'breakfast', servingUnit: 'oz (28g)' },
  { searchTerm: 'flaxseed', lookupKeys: ['flaxseed', 'flax'], mealType: 'breakfast', servingUnit: 'tbsp (7g)' },
  { searchTerm: 'pumpkin seeds', lookupKeys: ['pumpkin seeds', 'pepitas'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'almond butter', lookupKeys: ['almond butter'], mealType: 'snack', servingUnit: '2 tbsp (32g)' },
  { searchTerm: 'mixed nuts', lookupKeys: ['mixed nuts', 'trail mix'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'coconut meat raw', lookupKeys: ['coconut'], mealType: 'snack', servingUnit: 'cup shredded (80g)' },

  // =========== BEVERAGES ===========
  { searchTerm: 'coffee brewed', lookupKeys: ['coffee', 'black coffee', 'coffee black'], mealType: 'breakfast', servingUnit: 'cup (240ml)' },
  { searchTerm: 'tea brewed', lookupKeys: ['tea', 'black tea', 'green tea'], mealType: 'breakfast', servingUnit: 'cup (240ml)' },
  { searchTerm: 'orange juice', lookupKeys: ['orange juice', 'oj'], mealType: 'breakfast', servingUnit: 'cup (248g)' },
  { searchTerm: 'apple juice', lookupKeys: ['apple juice'], mealType: 'snack', servingUnit: 'cup (248g)' },
  { searchTerm: 'cola carbonated', lookupKeys: ['cola', 'coke', 'soda', 'soft drink'], mealType: 'lunch', servingUnit: 'can (355ml)' },
  { searchTerm: 'beer regular', lookupKeys: ['beer'], mealType: 'dinner', servingUnit: 'can (355ml)' },
  { searchTerm: 'wine red', lookupKeys: ['wine', 'red wine'], mealType: 'dinner', servingUnit: 'glass (148ml)' },
  { searchTerm: 'wine white', lookupKeys: ['white wine'], mealType: 'dinner', servingUnit: 'glass (148ml)' },
  { searchTerm: 'lemonade', lookupKeys: ['lemonade'], mealType: 'lunch', servingUnit: 'cup (248g)' },
  { searchTerm: 'smoothie fruit', lookupKeys: ['smoothie'], mealType: 'breakfast', servingUnit: 'cup (245g)' },
  { searchTerm: 'coconut water', lookupKeys: ['coconut water'], mealType: 'snack', servingUnit: 'cup (240ml)' },
  { searchTerm: 'almond milk unsweetened', lookupKeys: ['almond milk'], mealType: 'breakfast', servingUnit: 'cup (240ml)' },
  { searchTerm: 'oat milk', lookupKeys: ['oat milk'], mealType: 'breakfast', servingUnit: 'cup (240ml)' },
  { searchTerm: 'soy milk', lookupKeys: ['soy milk'], mealType: 'breakfast', servingUnit: 'cup (240ml)' },

  // =========== SWEETS & DESSERTS ===========
  { searchTerm: 'chocolate dark', lookupKeys: ['dark chocolate', 'chocolate'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'chocolate milk', lookupKeys: ['milk chocolate'], mealType: 'snack', servingUnit: 'oz (28g)' },
  { searchTerm: 'cookie chocolate chip', lookupKeys: ['cookie', 'chocolate chip cookie'], mealType: 'snack', servingUnit: 'cookie (16g)' },
  { searchTerm: 'brownie', lookupKeys: ['brownie'], mealType: 'snack', servingUnit: 'square (56g)' },
  { searchTerm: 'cake chocolate', lookupKeys: ['cake', 'chocolate cake'], mealType: 'snack', servingUnit: 'slice (95g)' },
  { searchTerm: 'donut glazed', lookupKeys: ['donut', 'doughnut'], mealType: 'breakfast', servingUnit: 'medium (60g)' },
  { searchTerm: 'muffin blueberry', lookupKeys: ['muffin', 'blueberry muffin'], mealType: 'breakfast', servingUnit: 'medium (57g)' },
  { searchTerm: 'pie apple', lookupKeys: ['pie', 'apple pie'], mealType: 'snack', servingUnit: 'slice (117g)' },
  { searchTerm: 'cheesecake', lookupKeys: ['cheesecake'], mealType: 'snack', servingUnit: 'slice (125g)' },
  { searchTerm: 'honey', lookupKeys: ['honey'], mealType: 'breakfast', servingUnit: 'tbsp (21g)' },
  { searchTerm: 'maple syrup', lookupKeys: ['maple syrup', 'syrup'], mealType: 'breakfast', servingUnit: 'tbsp (20g)' },
  { searchTerm: 'sugar white granulated', lookupKeys: ['sugar', 'white sugar'], mealType: 'unknown', servingUnit: 'tbsp (12g)' },
  { searchTerm: 'candy bar milk chocolate', lookupKeys: ['candy bar'], mealType: 'snack', servingUnit: 'bar (44g)' },

  // =========== CONDIMENTS & SAUCES ===========
  { searchTerm: 'ketchup', lookupKeys: ['ketchup'], mealType: 'lunch', servingUnit: 'tbsp (17g)' },
  { searchTerm: 'mustard yellow', lookupKeys: ['mustard'], mealType: 'lunch', servingUnit: 'tsp (5g)' },
  { searchTerm: 'mayonnaise', lookupKeys: ['mayonnaise', 'mayo'], mealType: 'lunch', servingUnit: 'tbsp (13g)' },
  { searchTerm: 'salsa', lookupKeys: ['salsa'], mealType: 'snack', servingUnit: 'tbsp (16g)' },
  { searchTerm: 'soy sauce', lookupKeys: ['soy sauce'], mealType: 'dinner', servingUnit: 'tbsp (16g)' },
  { searchTerm: 'olive oil', lookupKeys: ['olive oil'], mealType: 'dinner', servingUnit: 'tbsp (14g)' },
  { searchTerm: 'vegetable oil', lookupKeys: ['vegetable oil', 'cooking oil'], mealType: 'dinner', servingUnit: 'tbsp (14g)' },
  { searchTerm: 'ranch dressing', lookupKeys: ['ranch', 'ranch dressing'], mealType: 'lunch', servingUnit: 'tbsp (15g)' },
  { searchTerm: 'italian dressing', lookupKeys: ['italian dressing'], mealType: 'lunch', servingUnit: 'tbsp (15g)' },
  { searchTerm: 'balsamic vinegar', lookupKeys: ['balsamic vinegar', 'vinegar'], mealType: 'lunch', servingUnit: 'tbsp (16g)' },
  { searchTerm: 'hot sauce', lookupKeys: ['hot sauce'], mealType: 'lunch', servingUnit: 'tsp (5g)' },
  { searchTerm: 'bbq sauce', lookupKeys: ['bbq sauce', 'barbecue sauce'], mealType: 'dinner', servingUnit: 'tbsp (17g)' },
  { searchTerm: 'avocado dip guacamole', lookupKeys: ['guacamole', 'guac'], mealType: 'snack', servingUnit: 'tbsp (15g)' },
  { searchTerm: 'teriyaki sauce', lookupKeys: ['teriyaki sauce', 'teriyaki'], mealType: 'dinner', servingUnit: 'tbsp (18g)' },
  { searchTerm: 'marinara sauce', lookupKeys: ['marinara', 'tomato sauce', 'pasta sauce'], mealType: 'dinner', servingUnit: 'cup (132g)' },

  // =========== FAST FOOD / PREPARED ===========
  { searchTerm: 'pizza cheese', lookupKeys: ['pizza', 'cheese pizza'], mealType: 'dinner', servingUnit: 'slice (107g)' },
  { searchTerm: 'hamburger single patty', lookupKeys: ['hamburger', 'burger'], mealType: 'lunch', servingUnit: 'sandwich (110g)' },
  { searchTerm: 'french fries', lookupKeys: ['french fries', 'fries'], mealType: 'lunch', servingUnit: 'medium (117g)' },
  { searchTerm: 'burrito bean and cheese', lookupKeys: ['burrito'], mealType: 'lunch', servingUnit: 'burrito (163g)' },
  { searchTerm: 'taco beef', lookupKeys: ['taco'], mealType: 'dinner', servingUnit: 'taco (80g)' },
  { searchTerm: 'fried chicken', lookupKeys: ['fried chicken'], mealType: 'dinner', servingUnit: 'piece (96g)' },
  { searchTerm: 'chicken nuggets', lookupKeys: ['chicken nuggets', 'nuggets'], mealType: 'lunch', servingUnit: '6 pieces (96g)' },
  { searchTerm: 'sandwich turkey deli', lookupKeys: ['sandwich', 'turkey sandwich'], mealType: 'lunch', servingUnit: 'sandwich (240g)' },
  { searchTerm: 'nachos with cheese', lookupKeys: ['nachos'], mealType: 'snack', servingUnit: 'serving (113g)' },
  { searchTerm: 'quesadilla cheese', lookupKeys: ['quesadilla'], mealType: 'lunch', servingUnit: 'quesadilla (125g)' },
  { searchTerm: 'grilled cheese sandwich', lookupKeys: ['grilled cheese'], mealType: 'lunch', servingUnit: 'sandwich (119g)' },
  { searchTerm: 'mac and cheese', lookupKeys: ['mac and cheese', 'macaroni and cheese'], mealType: 'dinner', servingUnit: 'cup (189g)' },
  { searchTerm: 'ramen noodles', lookupKeys: ['ramen', 'instant noodles'], mealType: 'dinner', servingUnit: 'package (85g)' },
  { searchTerm: 'soup chicken noodle', lookupKeys: ['chicken soup', 'chicken noodle soup'], mealType: 'lunch', servingUnit: 'cup (241g)' },
  { searchTerm: 'soup tomato', lookupKeys: ['tomato soup'], mealType: 'lunch', servingUnit: 'cup (244g)' },
  { searchTerm: 'chili con carne', lookupKeys: ['chili', 'chili con carne'], mealType: 'dinner', servingUnit: 'cup (253g)' },
  { searchTerm: 'salad garden', lookupKeys: ['salad', 'garden salad', 'side salad'], mealType: 'lunch', servingUnit: 'cup (85g)' },
  { searchTerm: 'caesar salad', lookupKeys: ['caesar salad'], mealType: 'lunch', servingUnit: 'cup (100g)' },
  { searchTerm: 'sushi roll california', lookupKeys: ['sushi', 'california roll'], mealType: 'dinner', servingUnit: '6 pieces (180g)' },
  { searchTerm: 'fried rice', lookupKeys: ['fried rice'], mealType: 'dinner', servingUnit: 'cup (198g)' },

  // =========== BREAKFAST ITEMS ===========
  { searchTerm: 'cereal corn flakes', lookupKeys: ['corn flakes'], mealType: 'breakfast', servingUnit: 'cup (28g)' },
  { searchTerm: 'cereal cheerios', lookupKeys: ['cheerios'], mealType: 'breakfast', servingUnit: 'cup (28g)' },
  { searchTerm: 'toast bread wheat', lookupKeys: ['toast', 'wheat toast'], mealType: 'breakfast', servingUnit: 'slice (25g)' },
  { searchTerm: 'hash browns', lookupKeys: ['hash browns'], mealType: 'breakfast', servingUnit: 'cup (156g)' },
  { searchTerm: 'bacon and eggs', lookupKeys: ['bacon and eggs'], mealType: 'breakfast', servingUnit: 'serving' },
  { searchTerm: 'protein bar', lookupKeys: ['protein bar'], mealType: 'snack', servingUnit: 'bar (50g)' },
  { searchTerm: 'protein shake', lookupKeys: ['protein shake', 'protein powder'], mealType: 'snack', servingUnit: 'scoop (30g)' },
];

// ============================================================================
// USDA NUTRIENT IDs - Multiple IDs for same nutrient due to different data sources
// ============================================================================

const NUTRIENT_IDS: Record<string, number[]> = {
  // Energy - try both IDs
  calories: [1008, 2048, 2047],

  // Macros
  protein: [1003],
  carbs: [1005, 2039],
  fat: [1004],
  fiber: [1079, 2033],
  sugar: [2000, 1063, 2012], // Total sugars or Sugars, total including NLEA
  sodium: [1093],

  // Fats
  saturatedFat: [1258],
  transFat: [1257],
  monounsaturatedFat: [1292],
  polyunsaturatedFat: [1293],
  cholesterol: [1253],

  // Minerals
  calcium: [1087],
  iron: [1089],
  magnesium: [1090],
  phosphorus: [1091],
  potassium: [1092],
  zinc: [1095],
  copper: [1098],
  manganese: [1101],
  selenium: [1103],

  // Vitamins
  vitaminA: [1106, 1104], // RAE or IU
  vitaminC: [1162],
  vitaminD: [1114, 1110], // D2+D3 or D (IU)
  vitaminE: [1109],
  vitaminK: [1185, 1183], // Phylloquinone
  thiamin: [1165],
  riboflavin: [1166],
  niacin: [1167],
  vitaminB6: [1175],
  folate: [1177, 1187], // DFE or total
  vitaminB12: [1178],
  choline: [1180],

  // Other
  caffeine: [1057],
  water: [1051],
  alcohol: [1018],
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: Array<{
    nutrientId?: number;
    nutrientName?: string;
    value?: number;
    amount?: number;
    unitName?: string;
    nutrient?: {
      id: number;
      name: string;
      number: string;
      unitName: string;
    };
  }>;
  servingSize?: number;
  servingSizeUnit?: string;
  foodPortions?: Array<{
    gramWeight: number;
    portionDescription: string;
  }>;
}

interface SearchResult {
  foods: USDAFood[];
  totalHits: number;
}

async function searchUSDA(query: string): Promise<USDAFood | null> {
  const url = `${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR Legacy&pageSize=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API error for "${query}": ${response.status}`);
      return null;
    }

    const data: SearchResult = await response.json();

    if (data.foods && data.foods.length > 0) {
      // Prefer Foundation data, then SR Legacy
      const foundation = data.foods.find((f) => f.dataType === 'Foundation');
      return foundation || data.foods[0];
    }

    return null;
  } catch (error) {
    console.error(`Error searching for "${query}":`, error);
    return null;
  }
}

async function getFoodByFdcId(fdcId: number): Promise<USDAFood | null> {
  const url = `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`API error for FDC ID ${fdcId}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching FDC ID ${fdcId}:`, error);
    return null;
  }
}

function extractNutrient(food: USDAFood, nutrientIds: number[]): number {
  // Try each possible nutrient ID until we find one with data
  for (const id of nutrientIds) {
    // Handle different API response formats:
    // 1. Search API: { nutrientId, value }
    // 2. Food details API: { nutrient: { id }, amount }
    for (const n of food.foodNutrients) {
      const nId = n.nutrientId || n.nutrient?.id;
      const val = n.value ?? n.amount;
      if (nId === id && val !== undefined && val > 0) {
        return val;
      }
    }
  }
  return 0;
}

function round(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

interface CommonFoodEntry {
  name: string;
  quantity: number;
  unit: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  potassium: number;
  calcium: number;
  iron: number;
  magnesium: number;
  zinc: number;
  vitaminA: number;
  vitaminC: number;
  vitaminD: number;
  vitaminE: number;
  vitaminK: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitaminB6: number;
  folate: number;
  vitaminB12: number;
  choline: number;
  phosphorus: number;
  selenium: number;
  copper: number;
  manganese: number;
  caffeine: number;
  water: number;
}

function convertToEntry(food: USDAFood, query: FoodQuery, servingGrams: number): CommonFoodEntry {
  // USDA values are per 100g, scale to serving size
  const scale = servingGrams / 100;

  return {
    name: food.description,
    quantity: 1,
    unit: query.servingUnit || `${Math.round(servingGrams)}g`,
    mealType: query.mealType,
    calories: Math.round(extractNutrient(food, NUTRIENT_IDS.calories) * scale),
    protein: round(extractNutrient(food, NUTRIENT_IDS.protein) * scale),
    carbs: round(extractNutrient(food, NUTRIENT_IDS.carbs) * scale),
    fat: round(extractNutrient(food, NUTRIENT_IDS.fat) * scale),
    fiber: round(extractNutrient(food, NUTRIENT_IDS.fiber) * scale),
    sugar: round(extractNutrient(food, NUTRIENT_IDS.sugar) * scale),
    sodium: Math.round(extractNutrient(food, NUTRIENT_IDS.sodium) * scale),
    saturatedFat: round(extractNutrient(food, NUTRIENT_IDS.saturatedFat) * scale),
    transFat: round(extractNutrient(food, NUTRIENT_IDS.transFat) * scale),
    cholesterol: Math.round(extractNutrient(food, NUTRIENT_IDS.cholesterol) * scale),
    potassium: Math.round(extractNutrient(food, NUTRIENT_IDS.potassium) * scale),
    calcium: Math.round(extractNutrient(food, NUTRIENT_IDS.calcium) * scale),
    iron: round(extractNutrient(food, NUTRIENT_IDS.iron) * scale),
    magnesium: Math.round(extractNutrient(food, NUTRIENT_IDS.magnesium) * scale),
    zinc: round(extractNutrient(food, NUTRIENT_IDS.zinc) * scale),
    vitaminA: round(extractNutrient(food, NUTRIENT_IDS.vitaminA) * scale),
    vitaminC: round(extractNutrient(food, NUTRIENT_IDS.vitaminC) * scale),
    vitaminD: round(extractNutrient(food, NUTRIENT_IDS.vitaminD) * scale),
    vitaminE: round(extractNutrient(food, NUTRIENT_IDS.vitaminE) * scale),
    vitaminK: round(extractNutrient(food, NUTRIENT_IDS.vitaminK) * scale),
    thiamin: round(extractNutrient(food, NUTRIENT_IDS.thiamin) * scale, 2),
    riboflavin: round(extractNutrient(food, NUTRIENT_IDS.riboflavin) * scale, 2),
    niacin: round(extractNutrient(food, NUTRIENT_IDS.niacin) * scale),
    vitaminB6: round(extractNutrient(food, NUTRIENT_IDS.vitaminB6) * scale, 2),
    folate: round(extractNutrient(food, NUTRIENT_IDS.folate) * scale),
    vitaminB12: round(extractNutrient(food, NUTRIENT_IDS.vitaminB12) * scale, 2),
    choline: round(extractNutrient(food, NUTRIENT_IDS.choline) * scale),
    phosphorus: Math.round(extractNutrient(food, NUTRIENT_IDS.phosphorus) * scale),
    selenium: round(extractNutrient(food, NUTRIENT_IDS.selenium) * scale),
    copper: round(extractNutrient(food, NUTRIENT_IDS.copper) * scale, 2),
    manganese: round(extractNutrient(food, NUTRIENT_IDS.manganese) * scale, 2),
    caffeine: round(extractNutrient(food, NUTRIENT_IDS.caffeine) * scale),
    water: round(extractNutrient(food, NUTRIENT_IDS.water) * scale),
  };
}

function parseServingGrams(unit: string): number {
  // Extract grams from unit string like "medium (118g)" or "cup (244g)"
  const match = unit.match(/\((\d+)g?\)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  // Default serving sizes for common units
  const defaults: Record<string, number> = {
    'cup': 240,
    'tbsp': 15,
    'tsp': 5,
    'oz': 28,
    'slice': 28,
    'medium': 150,
    'large': 180,
    'small': 100,
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (unit.toLowerCase().includes(key)) {
      return value;
    }
  }

  return 100; // Default to 100g
}

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('Building Common Foods Database from USDA FoodData Central...\n');
  console.log(`Processing ${COMMON_FOODS.length} foods...\n`);

  const result: Record<string, CommonFoodEntry> = {};
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < COMMON_FOODS.length; i++) {
    const query = COMMON_FOODS[i];
    const progress = `[${i + 1}/${COMMON_FOODS.length}]`;

    // Rate limiting - USDA API allows 1000 requests/hour
    if (i > 0 && i % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    let food: USDAFood | null = null;

    if (query.fdcId) {
      food = await getFoodByFdcId(query.fdcId);
    } else {
      food = await searchUSDA(query.searchTerm);
    }

    if (!food) {
      console.log(`${progress} FAILED: ${query.searchTerm}`);
      failCount++;
      continue;
    }

    const servingGrams = parseServingGrams(query.servingUnit || '100g');
    const entry = convertToEntry(food, query, servingGrams);

    // Add entry for each lookup key
    for (const key of query.lookupKeys) {
      result[key] = entry;
    }

    console.log(`${progress} OK: ${query.lookupKeys[0]} → ${food.description} (${entry.calories} cal)`);
    successCount++;
  }

  console.log(`\n========================================`);
  console.log(`Success: ${successCount} / ${COMMON_FOODS.length}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total lookup keys: ${Object.keys(result).length}`);
  console.log(`========================================\n`);

  // Write output
  const outputPath = path.join(__dirname, '..', 'src', 'domains', 'nutrition', 'data', 'common_foods.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Written to: ${outputPath}`);
}

main().catch(console.error);
