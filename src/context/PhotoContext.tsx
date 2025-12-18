import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LayoutRectangle } from "react-native";
import type { FeedPhoto } from "../types/photo";

type ThumbnailPosition = LayoutRectangle & {
  pageY: number;
};

type PhotoContextType = {
  selectedPhoto: FeedPhoto | null;
  thumbnailPosition: ThumbnailPosition | null;
  setSelectedPhoto: (photo: FeedPhoto | null) => void;
  setThumbnailPosition: (position: ThumbnailPosition | null) => void;
  registerThumbnailRef: (id: string, ref: React.RefObject<unknown>) => void;
  getThumbnailRef: (id: string) => React.RefObject<unknown> | undefined;
};

const PhotoContext = createContext<PhotoContextType | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
  const [selectedPhoto, setSelectedPhoto] = useState<FeedPhoto | null>(null);
  const [thumbnailPosition, setThumbnailPosition] =
    useState<ThumbnailPosition | null>(null);
  const thumbnailRefs = useRef<Map<string, React.RefObject<unknown>>>(
    new Map()
  );

  const registerThumbnailRef = useCallback(
    (id: string, ref: React.RefObject<unknown>) => {
      thumbnailRefs.current.set(id, ref);
    },
    []
  );

  const getThumbnailRef = useCallback(
    (id: string) => thumbnailRefs.current.get(id),
    []
  );

  const value = useMemo(
    () => ({
      selectedPhoto,
      thumbnailPosition,
      setSelectedPhoto,
      setThumbnailPosition,
      registerThumbnailRef,
      getThumbnailRef,
    }),
    [selectedPhoto, thumbnailPosition, registerThumbnailRef, getThumbnailRef]
  );

  return (
    <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>
  );
}

export function usePhotoContext() {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error("usePhotoContext must be used within PhotoProvider");
  }
  return context;
}
