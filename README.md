ProbSol Materialised

A personal problem and solution repository designed to capture thoughts before they disappear.

⸻

Why This Project Exists

In day-to-day life, we constantly encounter:

* Improvement ideas
* Learning topics
* Technical observations
* Process inefficiencies
* Potential solutions
* Personal insights

Most of these thoughts are forgotten because:

* There is no time to act immediately
* The solution is incomplete
* Work takes priority
* Notes are scattered across multiple places

Over time these become a personal “Dead Letter Queue” of unresolved thoughts.

ProbSol Materialised was created to solve this problem.

The goal is simple:

Materialize important thoughts before they are lost.

⸻

Core Philosophy

This application is intentionally not:

* A task manager
* A note-taking application
* A reminder system
* A productivity tracker

Instead, it acts as a repository of:

* Problems
* Solutions
* Ideas
* Observations

Everything is treated as a problem waiting to be solved or a solution worth preserving.

⸻

Example Use Cases

Technical

Problem:

Need a better retry architecture for RabbitMQ consumers.

Solution:

Use delayed exchanges instead of immediate retries.

⸻

Problem:

Need to understand Kafka consumer lag monitoring.

Solution:

Use Burrow and Prometheus metrics.

⸻

Personal

Problem:

Need to improve swimming breathing rhythm.

Solution:

Practice bilateral breathing drills twice weekly.

⸻

Learning

Problem:

Need to understand Redis eviction strategies.

Solution:

Read Redis documentation and compare LRU vs LFU.

⸻

Vision

Create a personal knowledge repository that helps users:

1. Capture problems
2. Capture solutions
3. Preserve context
4. Review thoughts later
5. Eventually analyze patterns and recurring themes

Future versions will evolve toward analytics and visualization.

⸻

V0 Scope

The initial version focuses only on:

Capture

Create:

* Problem
* Solution

⸻

Store

Persist entries to Google Sheets.

⸻

View

Review all entries chronologically.

⸻

No advanced features were added intentionally.

The goal was to launch quickly and validate the idea.

⸻

Features Implemented

1. Capture Screen

Users can create:

* Problem
* Solution

Fields:

* Type
* Title
* Description
* Tags
* Status

Validation:

* Type required
* Title required

⸻

2. Timeline Screen

Displays all captured entries.

Features:

* Reverse chronological order
* Entry cards
* Status badges
* Type badges
* Tags
* Timestamps

⸻

3. Google Sheets Storage

All entries are stored in Google Sheets.

Benefits:

* Free
* Easy to maintain
* No database management
* Easy future analytics

⸻

4. Google Apps Script API

Acts as a lightweight backend.

Responsibilities:

* Create entry
* Fetch entries

⸻

5. Progressive Web App

The application is built as a PWA.

Benefits:

* Installable on iPhone
* Installable on Android
* No App Store required
* No separate mobile codebase
* Single deployment target

⸻

Architecture

iPhone / Browser
        |
        |
        v
React PWA
        |
        |
        v
Google Apps Script
        |
        |
        v
Google Sheets

⸻

Technology Stack

Frontend

* React
* TypeScript
* Vite
* React Router

Backend

* Google Apps Script

Storage

* Google Sheets

Deployment

* Vercel (planned)

⸻

Project Structure

src/
├── components/
├── hooks/
├── pages/
│   ├── CapturePage
│   └── TimelinePage
├── services/
│   └── api.ts
├── types/
└── App.tsx

⸻

Data Model

Entry

{
  id: string
  type: "Problem" | "Solution"
  title: string
  description: string
  tags: string[]
  status: "OPEN" | "SOLVED"
  timestamp: string
}

⸻

Status System

Problems default to:

OPEN

Solutions default to:

SOLVED

This creates the foundation for future analytics.

⸻

Future Roadmap

V1

Analytics

* Problems captured
* Solutions captured
* Solve ratio
* Problem trends
* Solution trends

⸻

V2

Dead Letter Queue

Identify:

* Problems not revisited for 30 days
* Problems not revisited for 60 days
* Problems not revisited for 90 days

Inspired by message queue dead letter queues.

⸻

V3

Problem → Solution Mapping

Example:

Problem
|
v
Solution

Track how ideas evolve into outcomes.

⸻

V4

Knowledge Graph

Visualize:

* Related problems
* Related solutions
* Topic clusters
* Learning patterns

⸻

V5

AI Layer

Potential features:

* Automatic tagging
* Similar problem detection
* Problem summarization
* Insight generation
* Weekly reflection reports

⸻

Design Principles

1. Capture quickly
2. Think later
3. Minimize friction
4. Store everything
5. Optimize for long-term knowledge accumulation

⸻

Current Limitations

This is a V0 release.

Not yet implemented:

* Edit entry
* Delete entry
* Search
* Filtering
* Analytics
* Notifications
* User authentication
* Offline sync
* Automated tagging
* Testing suite

These will be introduced incrementally after validating real-world usage.

⸻

Success Criteria

This project succeeds if it helps users answer:

What important problems did I notice this month?

and

How many of those problems eventually became solutions?

⸻

Author

Anuj Tiwari

Backend Engineer

Built as a personal experiment to capture, preserve, and eventually analyze the problems and solutions encountered in everyday life.