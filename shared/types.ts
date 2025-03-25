export interface ResearchSummary {
  id: number;
  searchTerm: string;
  title: string;
  summary: string;
  date: string;
  sourcesCount: number;
}

export interface ResearchResponse {
  searchTerm: string;
  summaries: ResearchSummary[];
  searchId?: number;
}

export interface ResearchRequest {
  searchTerm: string;
}

export interface BlogGenerationRequest {
  searchTerm: string;
  selectedSummaries: ResearchSummary[];
}

export interface Footnote {
  id: number;
  text: string;
  source: string;
  date: string;
}

export interface BlogArticle {
  title: string;
  content: string;
  featureImage?: string;
  footnotes?: Footnote[];
}

export interface BlogImagesResponse {
  images: string[];
}

export interface DownloadRequest {
  firstName: string;
  lastName: string;
  email: string;
  articleTitle: string;
  content: string;
  featuredImageUrl?: string;
  footnotes?: Footnote[];
  images: string[];
}

export interface DownloadResponse {
  success: boolean;
  message: string;
}
