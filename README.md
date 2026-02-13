# ScoreCast

CodePath WEB103 Final Project

Designed and developed by: modufade

🔗 Link to deployed app: 

## About

### Description and Purpose

ScoreCast is a comprehensive soccer statistics analytics platform that enables users to explore and compare team performance statistics across multiple European soccer leagues. The application provides in-depth statistical analysis through interactive visualizations, allowing users to gain insights into team performance patterns, trends, and comparative strengths across different time periods.

Users can navigate through **5 major European leagues (Premier League, La Liga, Serie A, Bundesliga, Ligue 1) plus MLS**, compare up to 5 teams simultaneously, and filter data by specific seasons and round ranges. The platform automatically calculates advanced derived metrics including team form, rolling averages, and efficiency ratios to provide a holistic view of team performance beyond basic match statistics.

### Inspiration

The inspiration for ScoreCast came from the challenge of making soccer analytics accessible and meaningful for casual fans, fantasy football players, and sports enthusiasts who want to make informed decisions about team performance. Traditional soccer statistics platforms often overwhelm users with raw data without providing intuitive ways to compare teams or understand performance trends over time.

I wanted to create a tool that not only displays match statistics but also derives meaningful insights through calculated metrics like team form components, possession efficiency, and rolling averages. By enabling multi-team comparisons with flexible filtering options, ScoreCast empowers users to answer questions like "How did Arsenal perform in the first 10 rounds compared to Manchester City?" or "What are Liverpool's attacking statistics over the last 5 matches?"

The project also addresses the need for a comprehensive historical database spanning multiple seasons, allowing users to analyze how teams have evolved over time and compare current performance against past seasons.

## Tech Stack

Frontend:

- React
- React Router
- Recharts (for data visualization)
- Tailwind CSS

Backend:

- Node.js
- Express.js
- PostgreSQL
- REST API

## Features

### Multi-League Navigation System

Browse and switch between multiple European soccer leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1) with historical data spanning multiple seasons (2017/18 onwards). Users can seamlessly navigate between leagues through an intuitive navigation bar.

### League Overview Dashboard

View comprehensive league standings with full table displaying Position, Team, Played, Wins, Draws, Losses, Goals For, Goals Against, Goal Difference, and Points. Includes visual bar charts comparing team performance metrics across the league.

[gif goes here]

### Advanced Multi-Team Comparison (up to 5 teams)

Search and select up to 5 teams using a searchable dropdown interface. Selected teams appear as removable pills with X icons for easy deselection. Users can view individual team overview cards showing key metrics (wins, losses, goals) before accessing detailed comparison visualizations. Teams can be dynamically added or removed from the comparison view.

[gif goes here]

### Categorized Statistical Analysis

Toggle between four comprehensive statistical view categories to analyze team performance from different angles:

- General Stats - Overall team performance metrics including possession, passes, and match outcomes
- Attacking Stats - Goals scored, shots on target, shot accuracy, conversion rates, and offensive efficiency
- Defensive Stats - Tackles won, clearances, interceptions, goals conceded, and defensive solidity
- Cumulative Stats - Rolling averages, team form components, trailing statistics, and aggregated performance metrics

### Round Range Filtering System ⭐ CUSTOM FEATURE

Filter match statistics by selecting a specific round range using two dropdown selectors (start round and end round). Statistics automatically update to show aggregate performance within the selected round range, enabling users to analyze team performance across specific portions of the season. For example, users can compare how teams performed in "Rounds 10-20" versus "Rounds 21-30" to identify trends and momentum shifts.

### Team Season Performance Analysis ⭐ CUSTOM FEATURE

Provides comprehensive season-level statistics and historical performance tracking for teams across leagues. Users can explore aggregated team performance data to identify trends, compare teams, and analyze how squads have evolved over multiple seasons.


### Season Selection & Historical Data Access

Browse historical data across multiple seasons (2017/18 through current season) for all supported leagues. Users can switch between seasons using dropdown selectors to compare how teams performed in different time periods, analyze year-over-year improvements, or study historical matchups between rival teams.

### RESTful Team & Match Management API

Full CRUD operations for managing team and match data through a well-designed RESTful API:

 - GET - Retrieve team statistics, match data, league standings, and derived metrics with filtering parameters
- POST - Add new match results and team information (for data population and admin functions)
- PATCH - Update existing match statistics, correct data errors, or modify team information
- DELETE - Remove incorrect match entries or outdated team records

The API implements proper RESTful naming conventions and returns structured JSON responses for seamless frontend integration.

## Installation Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

### Backend Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd scorecast
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Create a PostgreSQL database:
```bash
createdb scorecast_db
```

4. Set up environment variables:
Create a `.env` file in the server directory:
```
DATABASE_URL=postgresql://username:password@localhost:5432/scorecast_db
PORT=3000
NODE_ENV=development
```

5. Run database migrations:
```bash
npm run migrate
```

6. Seed the database with initial data:
```bash
npm run seed
```

7. Start the backend server:
```bash
npm run dev
```

The API should now be running on `http://localhost:3000`

### Frontend Setup

1. Install frontend dependencies:
```bash
cd client
npm install
```

2. Set up environment variables:
Create a `.env` file in the client directory:
```
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The application should now be running on `http://localhost:5173`

### Database Reset

To reset the database to its default state:
```bash
cd server
npm run reset-db
```

This will drop all tables, run migrations, and reseed with default data.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Leagues
- `GET /leagues` - Get all leagues
- `GET /leagues/:id` - Get specific league details
- `GET /leagues/:id/teams` - Get all teams in a league
- `GET /leagues/:id/standings` - Get league standings

#### Teams
- `GET /teams` - Get all teams
- `GET /teams/:id` - Get specific team details
- `GET /teams/:id/matches` - Get all matches for a team
- `GET /teams/:id/statistics` - Get team statistics with optional filters
  - Query params: `season`, `startRound`, `endRound`
- `POST /teams` - Create new team
- `PATCH /teams/:id` - Update team information
- `DELETE /teams/:id` - Delete team

#### Matches
- `GET /matches` - Get all matches with optional filters
  - Query params: `season`, `league`, `round`, `teamId`
- `GET /matches/:id` - Get specific match details
- `POST /matches` - Create new match
- `PATCH /matches/:id` - Update match information
- `DELETE /matches/:id` - Delete match

#### Statistics
- `GET /statistics/team/:teamId` - Get derived statistics for a team
  - Query params: `season`, `startRound`, `endRound`
- `GET /statistics/compare` - Compare multiple teams
  - Query params: `teamIds[]`, `season`, `startRound`, `endRound`

## Database Schema

### Tables

**leagues**
- `id` (Primary Key)
- `name` (VARCHAR)
- `country` (VARCHAR)
- `created_at` (TIMESTAMP)

**seasons**
- `id` (Primary Key)
- `name` (VARCHAR) - e.g., "2023_2024"
- `start_date` (DATE)
- `end_date` (DATE)

**teams**
- `id` (Primary Key)
- `league_id` (Foreign Key → leagues)
- `name` (VARCHAR)
- `team_key` (VARCHAR)
- `created_at` (TIMESTAMP)

**matches**
- `id` (Primary Key)
- `season_id` (Foreign Key → seasons)
- `round` (INTEGER)
- `date` (DATE)
- `home_team_id` (Foreign Key → teams)
- `away_team_id` (Foreign Key → teams)
- `home_goals` (INTEGER)
- `away_goals` (INTEGER)
- `[50+ statistical fields...]`

**team_match_statistics** (Join Table)
- `id` (Primary Key)
- `match_id` (Foreign Key → matches)
- `team_id` (Foreign Key → teams)
- `is_home` (BOOLEAN)
- `goals_scored` (INTEGER)
- `[statistical fields specific to team performance...]`

**derived_statistics** (One-to-One with team_match_statistics)
- `id` (Primary Key)
- `team_match_stat_id` (Foreign Key → team_match_statistics) - UNIQUE
- `predictive_cumulative` (JSONB)
- `predictive` (JSONB)
- `visualization_cumulative` (JSONB)
- `visualization` (JSONB)
- `match_metrics` (JSONB)

### Relationships

1. **One-to-Many:**
   - leagues → teams
   - seasons → matches
   - teams → team_match_statistics

2. **Many-to-Many:**
   - teams ↔ matches (via team_match_statistics join table)

3. **One-to-One:**
   - team_match_statistics → derived_statistics

## Future Enhancements

- **Match Prediction Algorithm** - Implement machine learning models (Bradley-Terry) to predict match outcomes
- **Player-Level Statistics** - Expand to individual player performance tracking
- **User Accounts & Favorites** - Allow users to save favorite teams and custom comparisons
- **Export Functionality** - Enable users to export statistical reports as PDF or CSV
- **Real-time Match Updates** - Integrate live match data feeds for current season matches
- **Mobile Responsive Design** - Optimize interface for mobile and tablet devices
- **Advanced Visualizations** - Add radar charts, heat maps, and trend line projections

## License

Copyright © 2024 [Your Name]. All rights reserved.

## Acknowledgments

- Data sourced from Flashscore.com
- Built as part of CodePath WEB103 Advanced Web Development course
- Special thanks to our instructors and peers for feedback and support
