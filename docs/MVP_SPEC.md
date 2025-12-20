# Recall - Photo Feed MVP - Technical Specification

## Project Overview
Recall is a YouTube-style feed interface for browsing random photos from the user's local photo library. The goal is to validate whether discovering personal photos through a familiar YouTube UI creates an engaging experience.

## Tech Stack
- React Native + Expo
- `expo-media-library` for photo library access
- TypeScript

## Core Features

### 1. Photo Grid Feed
- YouTube-style vertical scrolling feed
- Single column layout (full width thumbnails)
- Each feed item contains:
  - Photo thumbnail (16:9 aspect ratio, letterboxed if needed) at top
  - Empty circular avatar placeholder (left side, below thumbnail)
  - Photo metadata as title (right side of avatar)
  - Time indicator: "N년 전" format (below title, right side)

### 2. Infinite Scroll
- Load 10 photos initially
- Preload next 10 photos in background when user scrolls past 50% of current batch
- Load 10 more when user scrolls near bottom
- Photos should be randomly selected from library
- Avoid showing same photo twice in current session

### 3. Pull-to-Refresh
- Swipe down to refresh feed
- Clear current feed and load new random set of photos
- Reset duplicate prevention on refresh

### 4. Photo Metadata Display
- Title generation rules (priority order):
  1. If location data exists: "YYYY년 MM월 - [Location]"
  2. If only date exists: "YYYY년 MM월"
  3. If date unavailable, use photo filename
  4. Fallback: "무제"
- Time ago calculation:
  - Less than 1 minute: "방금 전"
  - Less than 1 hour: "N분 전"
  - Less than 24 hours: "N시간 전"
  - Less than 30 days: "N일 전"
  - Less than 1 year: "N개월 전"
  - 1 year or more: "N년 전"
  - No date metadata: "알 수 없음"

## UI Specifications

### Feed Item Layout
```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐   │
│  │                          │   │
│  │    Photo Thumbnail       │   │
│  │      (16:9 ratio)        │   │
│  │    (letterboxed)         │   │
│  │                          │   │
│  └─────────────────────────┘   │
│                                  │
│  ┌───┐ Photo Title              │
│  │ ○ │ N년 전                    │
│  └───┘                           │
└─────────────────────────────────┘
```

### Styling Guidelines
- Follow YouTube's visual hierarchy
- Thumbnail: Full width with 8px horizontal padding, 16:9 aspect ratio
- Letterbox background: Black (#000000)
- Avatar placeholder: 36x36px circle, light gray background (#E0E0E0)
- Title: 14pt, 2 lines max with ellipsis
- Time ago: 12pt, gray color (#606060)
- Spacing between thumbnail and metadata: 12px
- Item spacing: 16px vertical gap between items

## Technical Requirements

### Photo Library Access
- Request `MEDIA_LIBRARY` permissions on app start
- If permission denied, show guide screen explaining:
  - Why the app needs photo library access
  - Instructions to enable permission in device settings
  - Button to open device settings
- Re-check permission when app returns to foreground
- Access only image assets (exclude videos)

### Random Selection Algorithm
- Fetch all photo assets on app initialization
- Shuffle array using Fisher-Yates algorithm
- Keep track of shown photo IDs in Set during session
- When refreshed, clear the Set and re-shuffle
- Preload next batch when user has scrolled past 50% of currently loaded photos

### Performance Considerations
- Use FlatList with proper optimization props
- Lazy load thumbnails (only load visible items)
- Cache thumbnail URIs
- Set appropriate `initialNumToRender` and `maxToRenderPerBatch`
- Preload images for upcoming batch in background

### Image Display
- Landscape photos: Letterboxed with black bars on top/bottom
- Portrait photos: Letterboxed with black bars on left/right
- Photo aspect ratio preserved in all cases

## Out of Scope for MVP
- Photo detail view (tapping photo does nothing)
- Channel name
- View count
- Video duration indicator
- Search functionality
- Filtering/sorting options
- Sharing features
- Favorites/likes
- Multiple columns/grid layouts
- Landscape orientation support

## Success Criteria
- App loads and displays 10 random photos within 2 seconds
- Smooth 60fps scrolling performance
- Pull-to-refresh successfully loads new random set
- Infinite scroll seamlessly loads more photos
- No duplicate photos appear in single session
- Next batch preloads before user needs it
- Permission denial handled gracefully with clear guidance