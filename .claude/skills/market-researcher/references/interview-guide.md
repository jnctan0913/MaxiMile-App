# Interview Guide

This reference contains the full interview guide design template for the market-researcher skill. Used primarily in FULL tier research when qualitative depth is needed.

---

## Phase 3.3: User Interview Guide

### Interview Metadata

```markdown
## User Interview Guide

### Interview Metadata
| Field | Value |
|-------|-------|
| **Objective** | [What we want to learn] |
| **Format** | Semi-structured, 30-45 minutes |
| **Target Participants** | [Profile] |
| **Recommended Sample** | 5-8 participants (for thematic saturation) |
| **Recording** | With consent; transcribe for analysis |
```

**Sample Size Guidance**:
- 5-8 participants typically sufficient for thematic saturation in a focused domain
- If your target population is highly diverse, consider 10-12 participants across segments
- For niche B2B segments, 5-6 may be sufficient if participants are highly knowledgeable
- Track theme emergence: when 2-3 consecutive interviews yield no new themes, saturation is reached

---

### Interview Protocol

#### Opening (5 min)
- Introduce yourself and the purpose (research, not sales)
- Confirm consent to record
- "There are no right or wrong answers -- we want your honest experience"
- Set expectations: "This will take about 30-45 minutes. I'll ask some questions about [topic], and I'd love to hear about your experiences in your own words."

#### Section 1: Context & Background (5 min)
1. Tell me about your role / daily routine related to [topic].
2. How long have you been dealing with [problem area]?

**Interviewer notes**: Establish rapport. Let the participant talk freely. Note their language and terminology for use in later questions.

#### Section 2: Current Behavior (10 min)
3. Walk me through how you currently handle [task/problem].
4. What tools or methods do you use today?
5. What works well? What frustrates you?
   - **Probe**: Can you give me a specific example of when that was frustrating?
   - **Probe**: How often does that happen?
   - **Probe**: What did you do about it?

**Interviewer notes**: Focus on concrete behaviors, not hypotheticals. Ask "show me" or "walk me through" to get specifics. Listen for workarounds -- they signal unmet needs.

#### Section 3: Pain Points (10 min)
6. What's the hardest part about [problem]?
7. How much time/money does this cost you?
   - **Probe**: How does that compare to what you'd consider acceptable?
   - **Probe**: Have you tried to quantify the impact?
8. Have you tried other solutions? What happened?
   - **Probe**: What made you switch / stay / stop using it?
   - **Probe**: What was missing?

**Interviewer notes**: Quantify where possible (time, money, frequency). Note emotional intensity -- strong frustration signals high-value pain points.

#### Section 4: Solution Exploration (10 min)
9. If you could wave a magic wand, what would the ideal solution look like?
10. [Show concept/description] -- What's your initial reaction?
    - **Probe**: What would make you more/less likely to use this?
    - **Probe**: What concerns do you have?
    - **Probe**: How does this compare to what you use today?
11. What would you be willing to pay for something like this?
    - **Probe**: How does that compare to what you currently spend on [alternatives]?

**Interviewer notes**: Present the concept neutrally. Do not sell or defend. Note both positive and negative reactions. Watch body language for enthusiasm or hesitation.

#### Closing (5 min)
12. Is there anything I didn't ask about that you think is important?
13. Would you be open to a follow-up conversation?
14. Is there anyone else you'd recommend we speak with?

**Interviewer notes**: The "anything else" question often surfaces the most valuable insights. Always ask for referrals to build your participant pipeline.

---

### Interview Best Practices

**Do**:
- Use open-ended questions (who, what, how, tell me about)
- Follow the participant's lead -- deviate from the script if they surface something interesting
- Embrace silence -- let the participant think and elaborate
- Take notes on non-verbal cues (enthusiasm, frustration, confusion)
- Ask "why" and "tell me more" to go deeper

**Do Not**:
- Ask leading questions ("Don't you think X is a problem?")
- Offer your own opinions or validate/invalidate their answers
- Interrupt or rush to the next question
- Ask yes/no questions when open-ended would work
- Show more than one concept at a time (avoid comparison bias)

---

### Analysis Framework

#### Affinity Mapping
- After all interviews, write each distinct insight/observation on a virtual sticky note
- Group similar notes into clusters
- Name each cluster with a theme label
- Identify hierarchy: major themes and sub-themes

#### Quote Bank
- Collect verbatim quotes for each theme
- Tag each quote with participant ID, section, and sentiment (positive/negative/neutral)
- Select the most representative and vivid quotes for the research report
- Use direct quotes to bring the voice of the customer into product decisions

#### Frequency Count
- Track how many participants mentioned each theme
- Calculate the percentage of participants per theme
- Higher frequency = more widespread need; lower frequency does not mean unimportant (could be a niche high-value insight)

#### Severity Rating
- Rate each pain point by: **Frequency** (how many mentioned it) x **Intensity** (how strongly they feel about it)
- Create a 2x2 matrix:

```
                HIGH FREQUENCY
                     |
   Monitor closely   |   TOP PRIORITY
   (widespread but   |   (widespread and
    mild)            |    intense)
  -------------------+-------------------
   Low priority      |   Niche opportunity
   (rare and mild)   |   (rare but intense)
                     |
                LOW FREQUENCY
   LOW INTENSITY ------------ HIGH INTENSITY
```

#### Synthesis Template

```markdown
## Interview Findings Summary

### Participants
| ID | Role | Experience | Segment |
|----|------|-----------|---------|
| P1 | | | |
| P2 | | | |

### Theme Summary
| Theme | Frequency (n/N) | Intensity | Key Quote | Implication |
|-------|-----------------|-----------|-----------|-------------|
| [Theme 1] | [X/N participants] | High/Medium/Low | "[Quote]" -- P[X] | [Product implication] |
| [Theme 2] | [X/N participants] | High/Medium/Low | "[Quote]" -- P[X] | [Product implication] |

### Top Pain Points (Ranked)
1. **[Pain point]** -- Frequency: X/N, Intensity: High -- "[Best quote]"
2. **[Pain point]** -- Frequency: X/N, Intensity: Medium -- "[Best quote]"

### Unexpected Findings
- [Anything surprising that emerged]

### Recommendations for Product
1. [Actionable recommendation based on findings]
2. [Actionable recommendation based on findings]
```
