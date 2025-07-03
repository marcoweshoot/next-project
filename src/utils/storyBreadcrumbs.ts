
export const generateStoryBreadcrumbs = (storyName: string) => [
  { name: 'WeShoot', path: '/' },
  { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
  { name: 'Storie di viaggio', path: '/viaggi-fotografici/storie/' },
  { name: storyName }
];
