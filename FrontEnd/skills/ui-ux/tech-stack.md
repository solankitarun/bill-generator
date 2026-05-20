# Recommended Tech Stack for Antigravity

This file defines the best modern tech stack for creating:
- Enterprise applications
- Premium dashboards
- SaaS platforms
- AI applications
- Cinematic landing pages
- Motion-heavy interfaces
- 3D web experiences
- Scalable design systems

---

# Core Frontend Stack

## Framework
- React
- Next.js
- TypeScript

Why:
- Scalable
- Enterprise-ready
- Large ecosystem
- Best developer experience
- Excellent performance

---

# Styling

## CSS Framework
- TailwindCSS

Why:
- Fast development
- Consistent spacing
- Design system friendly
- Enterprise scalability

## Utility Libraries
- clsx
- tailwind-merge
- class-variance-authority

---

# UI Component System

## Recommended UI
- Shadcn UI
- Radix UI

Why:
- Accessible
- Customizable
- Enterprise-grade
- Minimal design

## Additional Libraries
- Mantine
- Chakra UI

---

# Animation Stack

## Primary Animation
- Framer Motion

Use For:
- Page transitions
- Hover effects
- Layout animation
- Shared transitions
- Gesture animation

## Advanced Animation
- GSAP

Use For:
- Complex timelines
- Scroll animations
- Cinematic motion
- Hero sections

## Smooth Scroll
- Lenis

Use For:
- Smooth scrolling
- Premium UX feel

---

# 3D Stack

## 3D Framework
- React Three Fiber

## Helpers
- Drei

## 3D Tools
- Spline
- Blender

## Low-Level WebGL
- Three.js
- OGL

Use Cases:
- Hero sections
- Interactive backgrounds
- Product visualization
- Premium landing pages

---

# Charts & Analytics

## Recommended Chart Libraries
- Recharts
- ECharts
- Nivo

Why:
- Smooth animations
- Enterprise-ready
- Highly customizable

---

# Icons

## Primary Icons
- Lucide Icons

## Secondary Icons
- Phosphor Icons

## Animated Icons
- Lordicon
- LottieFiles

---

# State Management

## Lightweight
- Zustand

## Server State
- TanStack Query

## Large Enterprise Apps
- Redux Toolkit

---

# Forms

## Recommended
- React Hook Form
- Zod Validation

Why:
- Fast
- Performant
- Excellent DX

---

# Data Tables

## Recommended
- TanStack Table
- AG Grid (enterprise)

---

# Backend

## Node Backend
- Next.js API
- Express.js
- NestJS

## .NET Enterprise Backend
- ASP.NET Core Web API

Why:
- Enterprise architecture
- Security
- Scalability

---

# Database

## SQL
- PostgreSQL
- MySQL

## NoSQL
- MongoDB Atlas

## ORM
- Prisma
- Drizzle ORM

---

# Authentication

## Recommended
- Clerk
- Auth.js
- Firebase Auth

## Enterprise
- Auth0

---

# Cloud & Deployment

## Frontend Hosting
- Vercel
- Netlify

## Backend Hosting
- Railway
- Render
- Azure
- AWS

## Database Hosting
- Supabase
- Neon
- MongoDB Atlas

---

# AI Integration

## AI SDK
- Vercel AI SDK

## LLM APIs
- OpenAI
- Anthropic
- Gemini

## AI UI
- AI chat interface
- Streaming responses
- AI autocomplete
- AI suggestions

---

# Design Tools

## UI Design
- Figma

## Motion Design
- Rive
- After Effects

## 3D Design
- Blender
- Spline

---

# Recommended Enterprise Architecture

## Frontend Architecture
- Feature-based structure
- Reusable component system
- Centralized theme system
- Atomic design principles

## Styling Architecture
- Design tokens
- Theme provider
- Semantic color system

## Performance Rules
- Lazy loading
- Code splitting
- GPU animations only
- Optimized images

---

# Recommended Folder Structure

/src
    /app
    /components
        /ui
        /shared
        /charts
        /motion
    /features
    /hooks
    /lib
    /services
    /store
    /styles
    /types
    /utils

---

# Recommended UI Philosophy

Design Style:
- Minimal
- Elegant
- Motion-first
- Enterprise-grade
- Accessibility-first
- Data-focused

Inspired By:
- Linear
- Stripe
- Vercel
- Apple
- Notion
- Framer
- Raycast

---

# Enterprise Performance Rules

Always:
- Optimize rendering
- Use GPU transforms
- Use lazy loading
- Minimize bundle size
- Use responsive images
- Avoid layout shift

Never:
- Overuse blur
- Create heavy shadows
- Use excessive animations
- Use blocking loaders