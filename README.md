# Recall

A YouTube-style photo feed app for discovering random photos from your local photo library. Built with React Native and Expo.

## Overview

Recall presents your personal photo library in a familiar YouTube-style vertical scrolling feed, allowing you to rediscover your memories in an engaging, content-discovery format.

## Features

- **YouTube-Style Feed**: Vertical scrolling feed with full-width photo thumbnails
- **Infinite Scroll**: Automatically loads more photos as you scroll
- **Pull-to-Refresh**: Swipe down to load a new random set of photos
- **Smart Metadata**: Displays photo location and time with localized Korean formatting
- **Random Discovery**: Shuffled photos with no duplicates in the current session
- **Letterboxed Display**: All photos maintain aspect ratio with 16:9 letterboxing

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Router**: expo-router (file-based routing)
- **Photo Access**: expo-media-library
- **List Performance**: @shopify/flash-list
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ (for React 19 support)
- pnpm
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recall
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm start
```

## Available Scripts

- `pnpm start` - Start the Expo development server
- `pnpm ios` - Run on iOS simulator
- `pnpm android` - Run on Android emulator
- `pnpm web` - Run in web browser

## Project Structure

```
recall/
├── app/                    # Expo Router pages
│   ├── index.tsx          # Main feed screen
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # React components
│   │   ├── feed/         # Feed-related components
│   │   └── permission/   # Permission handling components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # Business logic and data services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and constants
├── assets/               # Images and static assets
└── SPEC.md              # Detailed technical specification
```

## Key Components

### Hooks

- **usePermissions**: Manages photo library permissions
- **useInfinitePhotos**: Handles photo loading, pagination, and refresh logic

### Services

- **photoService**: Fetches and manages photo library access
- **shuffleService**: Implements Fisher-Yates shuffle and duplicate prevention

### Components

- **FeedItem**: Individual photo item in the feed
- **PhotoThumbnail**: Letterboxed photo display
- **MetadataSection**: Title and time ago display
- **PermissionGuide**: Permission request and settings guide

## Permissions

The app requires photo library access:

- **iOS**: `NSPhotoLibraryUsageDescription` configured in app.json
- **Android**: `READ_MEDIA_IMAGES` and `READ_EXTERNAL_STORAGE` permissions

On first launch, the app requests permission. If denied, a guide screen explains how to enable permissions in device settings.

## Performance Optimizations

- Uses FlashList for efficient list rendering (60fps scrolling)
- Lazy loads thumbnails for visible items only
- Preloads next batch at 50% scroll threshold
- Caches thumbnail URIs
- Optimized initial render with proper batch sizes

## Configuration

### Expo Configuration (app.json)

- Portrait orientation only
- New Architecture enabled
- Edge-to-edge display on Android
- Custom splash screen and app icon

### TypeScript Configuration

Strict type checking enabled with React Native and Expo type definitions.

## Development

The app uses Expo's new architecture and file-based routing with expo-router. Each screen in the `app/` directory becomes a route automatically.

To add new features, see `SPEC.md` for detailed technical specifications and design decisions.

## Known Limitations (MVP Scope)

- No photo detail view (taps do nothing)
- No search or filtering
- No sharing or favorites
- Single column layout only
- Portrait orientation only
- No video support

## License

MIT

## Contact

For questions or issues, please contact the project maintainer.
