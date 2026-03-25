/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: articles
 * Interface for Articles
 */
export interface Articles {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType text */
  summary?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType number */
  readingTimeMinutes?: number;
  /** @wixFieldType datetime */
  publishedDate?: Date | string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  featuredImage?: string;
}


/**
 * Collection ID: certificates
 * Interface for Certificates
 */
export interface Certificates {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  issuer?: string;
  /** @wixFieldType url */
  credentialLink?: string;
  /** @wixFieldType text */
  credentialId?: string;
  /** @wixFieldType date */
  issueDate?: Date | string;
}


/**
 * Collection ID: ideas
 * Interface for Ideas
 */
export interface Ideas {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType date */
  publicationDate?: Date | string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType boolean */
  isPublished?: boolean;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
}


/**
 * Collection ID: lifecontent
 * Interface for LifeContent
 */
export interface LifeContent {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  content?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType datetime */
  publishDate?: Date | string;
  /** @wixFieldType text */
  excerpt?: string;
  /** @wixFieldType number */
  readingTime?: number;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  coverImage?: string;
}


/**
 * Collection ID: nowfocus
 * Interface for NowFocus
 */
export interface NowFocus {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType date */
  startDate?: Date | string;
  /** @wixFieldType datetime */
  lastUpdated?: Date | string;
}


/**
 * Collection ID: projects
 * Interface for Projects
 */
export interface Projects {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  shortDescription?: string;
  /** @wixFieldType image - Contains image URL, render with <Image> component, NOT as text */
  mainImage?: string;
  /** @wixFieldType text */
  problem?: string;
  /** @wixFieldType text */
  approach?: string;
  /** @wixFieldType text */
  insights?: string;
  /** @wixFieldType url */
  projectUrl?: string;
  /** @wixFieldType date */
  publicationDate?: Date | string;
}


/**
 * Collection ID: research
 * Interface for ResearchPapers
 */
export interface ResearchPapers {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  abstract?: string;
  /** @wixFieldType url */
  paperUrl?: string;
  /** @wixFieldType date */
  publicationDate?: Date | string;
  /** @wixFieldType text */
  authors?: string;
  /** @wixFieldType text */
  journalConference?: string;
}


/**
 * Collection ID: tags
 * Interface for Tags
 */
export interface Tags {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  tagName?: string;
  /** @wixFieldType text */
  slug?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  color?: string;
  /** @wixFieldType boolean */
  isActive?: boolean;
  /** @wixFieldType datetime */
  createdAt?: Date | string;
}
