/**
 * Custom Backend API Service
 * Replaces Wix CMS with custom Express + PostgreSQL backend
 */

// API Base URL - uses Railway backend
const API_BASE_URL = 'https://kararspace-production.up.railway.app/api';

/**
 * Base item interface matching backend schema
 */
export interface WixDataItem {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
}

/**
 * Pagination options for querying collections
 */
export interface PaginationOptions {
  /** Number of items per page (default: 50, max: 1000) */
  limit?: number;
  /** Number of items to skip (for offset-based pagination) */
  skip?: number;
}

/**
 * Paginated result with metadata for infinite scroll
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  items: T[];
  /** Total number of items in the collection */
  totalCount: number;
  /** Whether there are more items after current page */
  hasNext: boolean;
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Offset to use for next page */
  nextSkip: number | null;
}

/**
 * Maps frontend collection IDs to backend API endpoints
 */
const COLLECTION_TO_ENDPOINT: Record<string, string> = {
  'articles': 'articles',
  'projects': 'projects',
  'certificates': 'certificates',
  'research': 'research',
  'ideas': 'ideas',
  'lifecontent': 'life',
  'nowfocus': 'now',
  'opportunities': 'opportunities',
  'settings': 'settings',
};

/**
 * Transforms backend response to match frontend entity format
 * Backend uses 'id', frontend expects '_id'
 */
function transformItem<T>(item: any): T {
  if (!item) return item;
  
  return {
    ...item,
    _id: item.id || item._id,
    _createdDate: item.createdAt ? new Date(item.createdAt) : undefined,
    _updatedDate: item.updatedAt ? new Date(item.updatedAt) : undefined,
    // Map backend fields to frontend expected fields
    featuredImage: item.featuredImage || item.image,
    mainImage: item.image || item.mainImage,
    coverImage: item.coverImage || item.image,
    publicationDate: item.publishedAt || item.publicationDate,
    publishedDate: item.publishedAt || item.publishedDate,
    publishDate: item.publishedAt || item.publishDate,
    lastUpdated: item.updatedAt || item.lastUpdated,
    isPublished: item.published ?? item.isPublished,
    readingTimeMinutes: item.readingTime || item.readingTimeMinutes,
    shortDescription: item.description || item.shortDescription,
    journalConference: item.journal || item.journalConference,
  } as T;
}

/**
 * Generic CRUD Service for custom backend API
 * Drop-in replacement for Wix BaseCrudService
 */
export class BaseCrudService {
  /**
   * Retrieves items from the collection with pagination
   */
  static async getAll<T extends WixDataItem>(
    collectionId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[],
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    try {
      const endpoint = COLLECTION_TO_ENDPOINT[collectionId] || collectionId;
      const limit = Math.min(pagination?.limit ?? 50, 1000);
      const skip = pagination?.skip ?? 0;

      const response = await fetch(`${API_BASE_URL}/${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Backend returns array directly, apply pagination client-side for now
      const allItems = Array.isArray(data) ? data : [];
      const transformedItems = allItems.map(item => transformItem<T>(item));
      
      // Apply client-side pagination
      const paginatedItems = transformedItems.slice(skip, skip + limit);
      const hasNext = skip + limit < transformedItems.length;

      return {
        items: paginatedItems,
        totalCount: transformedItems.length,
        hasNext,
        currentPage: Math.floor(skip / limit),
        pageSize: limit,
        nextSkip: hasNext ? skip + limit : null,
      };
    } catch (error) {
      console.error(`Error fetching ${collectionId}:`, error);
      // Return empty result instead of throwing to prevent page crashes
      return {
        items: [],
        totalCount: 0,
        hasNext: false,
        currentPage: 0,
        pageSize: pagination?.limit ?? 50,
        nextSkip: null,
      };
    }
  }

  /**
   * Retrieves a single item by ID or slug
   */
  static async getById<T extends WixDataItem>(
    collectionId: string,
    itemId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[]
  ): Promise<T | null> {
    try {
      const endpoint = COLLECTION_TO_ENDPOINT[collectionId] || collectionId;
      
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${itemId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return transformItem<T>(data);
    } catch (error) {
      console.error(`Error fetching ${collectionId} by ID:`, error);
      return null;
    }
  }

  /**
   * Creates a new item in the collection (requires auth - admin only)
   */
  static async create<T extends WixDataItem>(
    collectionId: string,
    itemData: Partial<T> | Record<string, unknown>,
    _multiReferences?: Record<string, any>
  ): Promise<T> {
    const endpoint = COLLECTION_TO_ENDPOINT[collectionId] || collectionId;
    
    const response = await fetch(`${API_BASE_URL}/admin/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${collectionId}`);
    }

    const data = await response.json();
    return transformItem<T>(data);
  }

  /**
   * Updates an existing item (requires auth - admin only)
   */
  static async update<T extends WixDataItem>(
    collectionId: string,
    itemData: T
  ): Promise<T> {
    const endpoint = COLLECTION_TO_ENDPOINT[collectionId] || collectionId;
    const itemId = itemData._id || (itemData as any).id;

    if (!itemId) {
      throw new Error(`${collectionId} ID is required for update`);
    }

    const response = await fetch(`${API_BASE_URL}/admin/${endpoint}/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(itemData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${collectionId}`);
    }

    const data = await response.json();
    return transformItem<T>(data);
  }

  /**
   * Deletes an item by ID (requires auth - admin only)
   */
  static async delete<T extends WixDataItem>(
    collectionId: string,
    itemId: string
  ): Promise<T> {
    const endpoint = COLLECTION_TO_ENDPOINT[collectionId] || collectionId;

    if (!itemId) {
      throw new Error(`${collectionId} ID is required for deletion`);
    }

    const response = await fetch(`${API_BASE_URL}/admin/${endpoint}/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${collectionId}`);
    }

    return { _id: itemId } as T;
  }

  /**
   * Stub methods for Wix compatibility - not used with custom backend
   */
  static async addReferences(
    _collectionId: string,
    _itemId: string,
    _references: Record<string, string[]>
  ): Promise<void> {
    console.warn('addReferences is not supported with custom backend');
  }

  static async removeReferences(
    _collectionId: string,
    _itemId: string,
    _references: Record<string, string[]>
  ): Promise<void> {
    console.warn('removeReferences is not supported with custom backend');
  }
}
