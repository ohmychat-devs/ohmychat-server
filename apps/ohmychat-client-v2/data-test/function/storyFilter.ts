export function storyFilter(types: string | string[]) {
    const hasStory = Array.isArray(types)
      ? types.includes('story')
      : types === 'story';
  
    if (!hasStory) return [];
  
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
    return [{
      $or: [
        { type: { $ne: 'story' } },
        { type: 'story', createdAt: { $gte: twentyFourHoursAgo } }
      ]
    }];
  }