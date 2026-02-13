# Milestone 1

This document should be completed and submitted during **Unit 5** of this course. You **must** check off all completed tasks in this document in order to receive credit for your work.

## Checklist

This unit, be sure to complete all tasks listed below. To complete a task, place an `x` between the brackets.

- [X] Read and understand all required features
  - [X] Understand you **must** implement **all** baseline features and **two** custom features
- [X] In `readme.md`: update app name to your app's name
- [X] In `readme.md`: add all group members' names
- [X] In `readme.md`: complete the **Description and Purpose** section
- [X] In `readme.md`: complete the **Inspiration** section
- [x] In `readme.md`: list a name and description for all features (minimum 6 for full points) you intend to include in your app (in future units, you will check off features as you complete them and add GIFs demonstrating the features)
- [X] In `planning/user_stories.md`: add all user stories (minimum 10 for full points)
- [X] In `planning/user_stories.md`: use 1-3 unique user roles in your user stories
- [x] In this document, complete all thre questions in the **Reflection** section below

## Reflection

### 1. What went well during this unit?

The planning and wireframing process was highly productive, allowing me to clearly define the app's scope and user flow. I successfully identified my database schema with all three relationship types and mapped out how my 50+ statistical metrics would be organized into meaningful categories. My feature selection aligned well with the course requirements while staying true to my vision of creating a comprehensive soccer analytics platform.

### 2. What were some challenges your group faced in this unit?

My biggest challenge was scoping the project appropriately for the timeline—I initially wanted to include machine learning predictions and all 40,000+ data files but had to focus on core visualization features for the MVP. I also struggled with organizing my extensive statistics (50+ fields) into intuitive categories (General, Attacking, Defensive, Cumulative) that would make sense to users. Additionally, designing the round-range filtering feature proved more complex than anticipated, as I needed to determine how to aggregate statistics across custom time periods effectively.

### 3. What additional support will you need in upcoming units as you continue to work on your final project?

I'll need guidance on optimizing PostgreSQL queries for my large dataset, especially when calculating derived statistics on-the-fly for filtered round ranges. Help with React state management for my multi-team comparison feature (handling up to 5 teams with dynamic selection/deselection) would be valuable. I'd also appreciate support on database deployment strategies for Render, particularly around migrating and seeding my extensive historical dataset in production.
