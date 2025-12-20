# Recall - Development Status

## Current Version
MVP + Enhanced Features

## Completed Features

### Core Feed (MVP)
- [x] YouTube-style vertical scrolling photo feed
- [x] Random photo selection from device library
- [x] Infinite scroll with preloading
- [x] Pull-to-refresh with new random set
- [x] No duplicate photos in session
- [x] Photo metadata display (title, time ago)
- [x] Permission handling with guide screen

### Photo Detail Page
- [x] Full-screen photo view with swipe-to-dismiss
- [x] Portrait photo support (vertical images)
- [x] Photo metadata display (찍은 시간)
- [x] Location map with GPS coordinates (react-native-maps)
- [x] Reverse geocoding for location name (district, city, region, country)
- [x] Zoomable map without triggering page dismiss

### Reactions & Playlists
- [x] Like/Dislike buttons (FontAwesome thumbs icons)
- [x] Save button with playlist selection
- [x] Playlist bottom sheet with custom animations
- [x] Create new playlist modal
- [x] Default "좋아요 표시한 사진" playlist (auto-managed)
- [x] Playlist detail page with photo grid
- [x] AsyncStorage persistence for playlists and reactions

### Navigation
- [x] Bottom tab navigation (홈, 재생목록)
- [x] Scroll-to-top on home tab press
- [x] expo-router based navigation

### UI/UX Polish
- [x] Custom refresh control
- [x] Smooth bottom sheet transitions (fade backdrop, slide sheet)
- [x] Fixed keyboard handling in modals
- [x] expo-image for optimized image loading

## Tech Stack
- React Native + Expo (SDK 54)
- expo-router (file-based routing)
- expo-media-library (photo access)
- expo-image (optimized images)
- expo-location (reverse geocoding)
- react-native-maps (Apple Maps)
- @react-native-async-storage/async-storage (persistence)
- @shopify/flash-list (performant lists)
- TypeScript
- Ultracite (Biome-based linting/formatting)

## Project Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx      # Tab navigation
│   ├── index.tsx        # Home feed
│   └── playlists.tsx    # Playlists list
├── photo/[id].tsx       # Photo detail
├── playlist/[id].tsx    # Playlist detail
└── _layout.tsx          # Root layout

src/
├── components/
│   ├── detail/          # Detail page components
│   ├── feed/            # Feed components
│   ├── header/          # App header
│   ├── permission/      # Permission guide
│   └── refresh/         # Custom refresh control
├── context/             # React contexts
├── hooks/               # Custom hooks
├── services/            # Data services
├── types/               # TypeScript types
└── utils/               # Utilities
```

## Pending Features
See [IDEAS.md](./IDEAS.md) for planned features:
- 댓글 (Comments)
- 슬라이드쇼 재생 (Slideshow)
- 관련 사진 (Related photos)
- 날짜 필터링 (Date filtering)
- 검색 (Search) - requires image analysis
- 제목 생성 (Title generation) - requires on-device ML
- 카테고리 (Categories) - requires on-device ML
- 세팅/테마 (Settings/Theme)
