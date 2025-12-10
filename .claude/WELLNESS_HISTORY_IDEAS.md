# Wellness History View Ideas

Ideas for showing comprehensive mood log history beyond graphs in the Wellness tab.

## 1. Scrollable Timeline/Feed ✅ IMPLEMENTED
- Vertical scrolling list of daily entries (compact pill style)
- Each card shows: date tile (day/dayNum/month), 5 metrics (mood/energy/stress/sleep/hours), tags, vitality score (0-100)
- Color-coded: vitality ≥70 green, ≥50 amber, <50 rose; positive tags green, negative tags rose
- Collapsible section with header
- Good for: browsing and reminiscing

## 2. Calendar Heatmap (GitHub-style) ✅ IMPLEMENTED
- Full month/year grid view
- Color intensity = overall wellness score
- Tap any day to see details in a bottom sheet
- Good for: spotting patterns at a glance ("I always feel worse on Mondays")

## 3. Weekly Summaries
- Collapsible week cards with averages and highlights
- "Best day: Tuesday (8.2 avg)" / "Challenging day: Friday"
- Shows which tags appeared most that week
- Good for: quick retrospective without information overload

## 4. Tag/Factor Analysis View
- Group entries by tags ("When I tagged 'Gym'...")
- Shows average scores when that tag is present vs absent
- "Days with 'Good sleep' tag: avg mood 7.8 vs 5.9 without"
- Good for: discovering what actually helps

## 5. Monthly Report Card
- Summary page with key stats and insights
- Comparison to previous month
- Most frequent symptoms, best/worst days
- Good for: tracking long-term progress

## 6. Search/Filter Mode
- Filter by score ranges, tags, symptoms, date range
- "Show me all days where stress > 7"
- "Show me days tagged with 'Anxiety'"
- Good for: investigating specific concerns

---

## Implementation Priority
1. Timeline Feed + Calendar Heatmap (immediate)
2. Tag/Factor Analysis (high value, medium complexity)
3. Weekly Summaries (nice to have)
4. Monthly Report Card (future)
5. Search/Filter Mode (future)
