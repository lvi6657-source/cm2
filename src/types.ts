export interface Card {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  colorClass?: string;
  parentId: string | null;
  windowId?: string;
  isDeleted?: boolean;
  isPinned?: boolean;
  isCollapsed?: boolean;
  order?: number;
}
