# Market Researcher -- Reference Material

This document contains detailed reference information for the market-researcher skill, including source maps, research process steps, and the primary research decision framework.

---

## Information Sources Map

| Category | Sources | What You Get |
|----------|---------|-------------|
| **Market Size & Growth** | Statista, IBISWorld, Grand View Research, Allied Market Research, Fortune Business Insights | TAM, CAGR, revenue forecasts |
| **Competitive Intelligence** | Crunchbase, PitchBook, G2, Capterra, Product Hunt, App Store/Play Store | Funding, features, reviews, pricing |
| **Consumer Behavior** | Pew Research, Nielsen, Google Trends, Think with Google, Comscore | Usage patterns, demographics, preferences |
| **Industry Trends** | Gartner Hype Cycle, CB Insights, a16z, McKinsey Global Institute | Emerging tech, investment trends, predictions |
| **Academic Research** | Google Scholar, SSRN, ResearchGate, ACM Digital Library | Theoretical frameworks, empirical studies |
| **Government & Public Data** | Census.gov, BLS, World Bank, OECD, WHO | Demographics, economic indicators, regulations |
| **Social Listening** | Reddit, Twitter/X, Product Hunt discussions, Hacker News | Sentiment, pain points, feature requests |
| **Patent & IP** | Google Patents, USPTO, WIPO | Innovation direction, competitive moats |

---

## Research Process

```
Step 1: Define research questions (what do we need to know?)
Step 2: Identify relevant sources for each question
Step 3: Gather data systematically
Step 4: Cross-reference findings across multiple sources
Step 5: Note data gaps and confidence levels
Step 6: Synthesize into actionable insights
```

### Step-by-Step Guidance

**Step 1 -- Define Research Questions**
- Start with the core product or problem area
- Formulate a primary research question (the single most important thing to answer)
- Derive 2-3 secondary questions that support the primary
- Ensure questions are specific, measurable, and answerable with available methods

**Step 2 -- Identify Relevant Sources**
- Map each research question to the Information Sources table above
- For each question, identify at least 2 source categories to enable triangulation
- Prioritize Tier 1 and Tier 2 sources (see Source Hierarchy below)

**Step 3 -- Gather Data Systematically**
- Use web search to find recent reports, articles, and datasets
- Record the source URL, date, author/publisher, and key data points
- Track which research question each data point addresses

**Step 4 -- Cross-Reference Findings**
- Compare data points from multiple independent sources
- Flag contradictions or significant discrepancies
- Note where sources agree (higher confidence) vs. diverge (lower confidence)

**Step 5 -- Note Data Gaps and Confidence Levels**
- For each research question, assess: Do we have sufficient data?
- Rate confidence as High (multiple Tier 1-2 sources agree), Medium (limited sources or some disagreement), or Low (single source, anecdotal, or outdated)
- Document specific gaps that primary research could fill

**Step 6 -- Synthesize into Actionable Insights**
- Translate raw data into findings (what the data tells us)
- Derive implications (what it means for the product)
- Formulate recommendations (what to do about it)

---

## Primary Research Decision Framework

```
IF sufficient secondary data exists AND data is recent (<2 years)
   -> No primary research needed. Cite secondary sources.

IF data gaps exist BUT they are non-critical
   -> Note gaps, proceed with caveats. Recommend future research.

IF critical data gaps exist OR problem is highly niche
   -> Design and recommend a user survey/interview study.
```

### When to Recommend Primary Research

Recommend a user survey or interview study when:
- [ ] Secondary data is insufficient or outdated (>2 years old)
- [ ] The target segment is niche and not well-covered by existing research
- [ ] You need to validate specific hypotheses about user behavior
- [ ] Competitive landscape is unclear from public data alone
- [ ] The problem space is novel with limited existing literature
- [ ] You need to quantify the intensity of pain points
- [ ] Pricing sensitivity needs to be understood

### Primary Research Method Selection

| Situation | Recommended Method | Rationale |
|-----------|-------------------|-----------|
| Need to quantify behaviors or preferences at scale | **Survey** | Statistical validity, large sample |
| Need deep understanding of motivations and context | **Interviews** | Rich qualitative data, follow-up probing |
| Need to test specific feature/pricing hypotheses | **Survey with Van Westendorp** | Structured quantitative validation |
| Need to explore an unknown problem space | **Interviews first, then Survey** | Qualitative discovery followed by quantitative validation |
| Need both breadth and depth | **Mixed methods** | Interviews for depth, survey for breadth |

---

## Source Hierarchy (Detailed)

### Tier 1 -- Most Credible
- Government databases: Census.gov, Bureau of Labor Statistics (BLS), World Health Organization (WHO), World Bank Open Data, OECD Data
- Peer-reviewed journals: Published in indexed academic journals with peer review
- Official regulatory filings: SEC filings (10-K, 10-Q, S-1), patent office records (USPTO, WIPO)
- National statistical agencies: Any country's official statistics bureau

**When to use**: Always prefer Tier 1 when available. Required for market sizing claims in FULL tier.

### Tier 2 -- Highly Credible
- Industry analyst reports: Gartner, McKinsey, Statista, IBISWorld, CB Insights, Forrester, IDC
- Established news outlets: Reuters, Bloomberg, Financial Times, Wall Street Journal
- Company filings: Annual reports, investor presentations, earnings call transcripts
- Established research firms: Pew Research Center, Nielsen, Comscore

**When to use**: Primary sources for competitive intelligence and market trends. Acceptable for all tiers.

### Tier 3 -- Credible
- Reputable tech/business publications: TechCrunch, Harvard Business Review, Forbes, Wired, The Information
- Well-known research firms: App Annie/data.ai, Sensor Tower, SimilarWeb
- Industry associations: Trade group reports and publications
- App store data: Official metrics from Apple App Store, Google Play Store

**When to use**: Good for trend analysis, competitive signals, and supporting evidence. Sufficient for QUICK and STANDARD tiers.

### Tier 4 -- Use with Caveat
- Blog posts and opinion pieces
- Social media discussions (Twitter/X, LinkedIn posts)
- Reddit and forum analysis
- User reviews (G2, Capterra, App Store reviews)
- Wikipedia (use only as a starting point, then find the cited primary source)

**When to use**: Qualitative/anecdotal evidence only. Always label as such. Useful for sentiment analysis and identifying pain points. Never use as sole source for quantitative claims.

---

## Cross-Referencing Best Practices

1. **Rule of Two**: Every major claim should be supported by at least 2 independent sources
2. **Source Independence**: Two articles citing the same original report count as ONE source, not two
3. **Recency Weighting**: More recent data takes precedence when sources conflict
4. **Methodology Check**: Prefer sources that disclose their methodology and sample size
5. **Geographic Match**: Ensure the data's geographic scope matches your research scope
