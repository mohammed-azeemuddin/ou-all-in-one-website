/** How a catalog item opens on the website (the app's resolveFileUrl, adapted for the browser). */
const DRIVE_FILE = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/;
const DRIVE_FOLDER = /drive\.google\.com\/drive\/(?:mobile\/)?(?:u\/\d+\/)?folders\/([\w-]{10,})/;

export function resolve(item) {
  const url = item.url?.trim();
  if (item.fileId && !url) return { kind: 'unavailable', reason: 'This file is being moved. Check back soon.' };
  if (!url) return { kind: 'unavailable', reason: 'This file has no link.' };
  if (url.includes('firebasestorage.googleapis.com')) return { kind: 'unavailable', reason: 'This paper is being moved to our new file server.' };
  const folder = url.match(DRIVE_FOLDER);
  if (folder) return { kind: 'folder', id: folder[1] };
  const file = url.match(DRIVE_FILE);
  if (file) return { kind: 'drive', id: file[1] };
  if (/\.pdf(\?|#|$)/i.test(url)) return { kind: 'pdf', url };
  return { kind: 'link', url };
}

export const drivePreview = (id) => `https://drive.google.com/file/d/${id}/preview`;
export const driveDownload = (id) => `https://drive.google.com/uc?export=download&id=${id}`;
export const folderEmbed = (id) => `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(id)}#list`;
