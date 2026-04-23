# BiteGenie — Eat smarter

A production-grade AI smart meal planner built with Next.js App Router, MongoDB, Mongoose, JWT auth, Tailwind CSS, Framer Motion, Recharts, SWR, and OpenAI.

## What’s included

- Premium SaaS landing page and protected product shell
- JWT authentication with secure cookie sessions and bcrypt password hashing
- Personalized weekly meal plan generation based on calories, diet, goals, and budget
- Dynamic serving updates with real-time nutrition recalculation
- Meal swap and meal regeneration flows
- AI meal generator with structured JSON validation, retry logic, and MongoDB cache
- Saved recipes and favorites
- Grocery list extraction with duplicate merging and category grouping
- Dashboard analytics for calorie patterns, target completion, and insights
- Settings page that directly drives planning and AI personalization

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- SWR
- MongoDB + Mongoose
- OpenAI API
- Recharts
- Sonner

## Project structure

```text
src/
  app/
    (auth)/
      login/
      signup/
    (app)/
      dashboard/
      planner/
      generator/
      grocery/
      settings/
    api/
      auth/
      dashboard/
      generate-meal/
      grocery-list/
      meal-plan/
      profile/
      recipes/
  components/
    app-shell/
    charts/
    dashboard/
    forms/
    generator/
    grocery/
    planner/
    providers/
    settings/
    ui/
  lib/
    api-client.ts
    auth.ts
    db.ts
    env.ts
    http.ts
    nutrition.ts
    utils.ts
  server/
    controllers/
    data/
    models/
    services/
    validators/
  types/
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `OPENAI_API_KEY` or `GROQ_API_KEY` or `XAI_API_KEY`
- `AI_BASE_URL` when using Groq or xAI
- `OPENAI_MODEL`
- `NEXT_PUBLIC_APP_URL`

### Groq setup

This app can use Groq through the OpenAI-compatible API.

Example `.env.local` values:

```env
GROQ_API_KEY=your-groq-key
AI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_MODEL=llama-3.3-70b-versatile
```

### xAI setup

This app can also use xAI's Grok models through the OpenAI-compatible API.

Example `.env.local` values:

```env
XAI_API_KEY=your-xai-key
AI_BASE_URL=https://api.x.ai/v1
OPENAI_MODEL=grok-4.20-beta-latest-non-reasoning
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. Start the dev server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Data model

### Users

- `name`
- `email`
- `password`
- `preferences`

### Recipes

- `name`
- `slug`
- `mealType`
- `dietaryTags`
- `ingredients`
- `steps`
- `cookingTime`
- `nutrition`
- `estimatedCost`
- `createdBy`
- `source`
- `likedBy`
- `cachedKey`

### MealPlans

- `userId`
- `startDate`
- `endDate`
- `days`
- `totalNutrition`
- `estimatedCost`
- `reuseSuggestions`
- `insights`

### GroceryLists

- `userId`
- `linkedMealPlanId`
- `items`

### GeneratedMeals

- `cacheKey`
- `inputIngredients`
- `mealType`
- `dietaryPreference`
- `cookingTimeLimit`
- `generatedRecipe`

## API surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/profile`
- `PATCH /api/profile`
- `GET /api/dashboard`
- `GET /api/meal-plan`
- `POST /api/meal-plan`
- `PATCH /api/meal-plan/:planId`
- `GET /api/recipes`
- `POST /api/recipes`
- `POST /api/recipes/:recipeId/favorite`
- `POST /api/generate-meal`
- `GET /api/grocery-list`

## Deployment

### Render + MongoDB Atlas Free

This app can be deployed on Render as a Node web service while keeping MongoDB on the Atlas free tier.

1. Create a free MongoDB Atlas cluster (`M0`) and create a database user.
2. In Atlas, allow access from anywhere for the app by adding `0.0.0.0/0` to the IP access list.
3. Copy the Atlas SRV connection string and replace the username and password placeholders.
4. In Render, create a new Blueprint from this repository. The included `render.yaml` creates the `bitegenie` web service.
5. Set these environment variables in Render when prompted:
   `MONGODB_URI`
   `NEXT_PUBLIC_APP_URL`
   `OPENAI_API_KEY` or `GROQ_API_KEY` or `XAI_API_KEY`
   `AI_BASE_URL` when using Groq or xAI
   `OPENAI_MODEL`
6. After the first deploy finishes, set `NEXT_PUBLIC_APP_URL` to your Render service URL and redeploy once.

Notes:

- Render free web services spin down when idle, so the first request after inactivity can be slow.
- The Atlas free tier is suitable for demos and small personal projects, not heavy production traffic.

### Vercel

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables from `.env.example`.
4. Set the production `NEXT_PUBLIC_APP_URL` to your deployed domain.
5. Deploy.

### Replit

1. Import the project into Replit as a Node.js app.
2. Run `npm install`.
3. Add the environment variables to Replit Secrets.
4. Start with `npm run dev` or `npm run build && npm run start`.

## Validation completed

- `npm run lint`
- `npm run build`
