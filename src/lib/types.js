// This will hold the project data structure
export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string; // For websites
  downloadUrl?: string; // For APKs
  category: 'app' | 'website';
  createdAt: number;
}
