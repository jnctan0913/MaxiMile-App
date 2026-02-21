# PM Reference: Roadmap & Backlog

---

## Phase 3b.1: Product Roadmap

A product roadmap is a **high-level visual summary** that outlines the direction of a product over time. It communicates the **why, what, and when** of development and helps align stakeholders.

### Roadmap Elements

- **Timeline and Milestones**: Planned duration, key delivery dates
- **Themes or Initiatives**: Broader areas of focus / strategic goals
- **Prioritization and Phasing**: Order of feature delivery, resource allocation
- **Communication and Transparency**: Shared view of strategic direction
- **Flexibility and Adaptability**: Not set in stone; reviewed and updated regularly

### Roadmap Template (Timeline View)

```markdown
## Product Roadmap

| Timeframe | Theme/Initiative | Key Deliverables | Milestone |
|-----------|-----------------|------------------|-----------|
| Month 1-2 | | | |
| Month 3-4 | | | |
| Month 5-6 | | | |
```

### Roadmap vs Gantt Chart

- **Roadmap** = strategic, high-level, theme-based, flexible
- **Gantt Chart** = tactical, task-level, date-specific, rigid
- Use the roadmap for stakeholder communication; Gantt for execution tracking

---

## Phase 3b.2: Product Backlog

The product backlog is a **prioritized list** of features, functionalities, and enhancements the product team plans to develop over time. The Product Owner (PM) is responsible for defining and communicating a clear product vision, prioritizing backlog items based on value and customer feedback, and collaborating with stakeholders to maximize product value.

### Backlog Organization Hierarchy

The product backlog is broken down into smaller, more manageable chunks. Each level provides context for the levels below it:

```
Initiative (Theme)     -- Large, high-level strategic requirement
  +-- Epic             -- Significant feature area broken from the initiative
       +-- User Story  -- Individual, discrete chunk of functionality providing value
            +-- Task   -- Specific, actionable item to deliver a user story
                +-- Subtask -- Granular work item within a task
```

- **Initiatives/Themes**: Large requirements that align with strategic goals (e.g., "Wishlist functionality")
- **Epics**: Broken down from initiatives; too large for a single sprint (e.g., "As a customer, I want wishlists so I can come back to buy products later")
- **User Stories**: Discrete, valuable chunks of functionality (e.g., "As a customer, I want to save a product to my wishlist so I can view it again later")
- **Tasks**: Specific actionable items to complete a story (e.g., "Put 'Add to wishlist' button on each product page", "Create new DB to store wishlist items")

### Backlog Evolution (Granularity over Time)

| Level | Items | State |
|-------|-------|-------|
| **Planned** (Top) | Desirement, Increment, Dependency, Action, Constraint | Sprintable -- ready for dev |
| **Refined** (Middle) | Desirement, Opportunity, Functionality, Dependency, Option | Actionable, well understood |
| **Future** (Bottom) | Idea, Option | Intentions, hopes and dreams |

### Backlog Principles

- **Prioritized**: Organized by customer needs, market trends, and product strategy
- **Agile**: A living document, regularly updated based on feedback and evolving needs
- **Clarity**: Each item should be clearly defined with acceptance criteria and sufficient detail

### Backlog Items Template

```markdown
## Product Backlog

| Priority | Item | Type | Status | Sprint |
|----------|------|------|--------|--------|
| P0 | | Feature/Bug/Enhancement | Planned/Refined/Future | |
| P1 | | | | |
| P2 | | | | |
```

---

## MVP Definition

### What Is an MVP?

A **Minimum Viable Product (MVP)** is a product with **enough features** to attract early adopter customers and **validate a product idea early** in the development cycle. The MVP concept is to build a product with the **minimum set of core features** that solve the user's need and deliver value to early adopters.

### Henrik Kniberg's Iterative Value Delivery

The correct approach to building an MVP:

- **NOT**: Build component by component (wheel -> chassis -> body -> car) where no value is delivered until the end
- **YES**: Build iteratively with usable value at each stage (skateboard -> bicycle -> motorcycle -> car)
- Each iteration must deliver a **complete, usable product** that solves the core problem at increasing levels of sophistication

### MVP Checklist

- [ ] Solves the ONE core user problem identified in discovery
- [ ] Delivers value to early adopters from day one
- [ ] Is testable and generates feedback for next iteration
- [ ] Contains only P0 (Must-Have) features from RICE/Kano analysis
- [ ] Anti-feature-jam check: no feature exists without mapping to the core friction
