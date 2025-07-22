import allGrades from '../../All grades.json';

export type Video = {
    id: number;
    title: string;
    grade: string;
    subject: string;
    youtubeId: string;
};

function extractYoutubeId(url: string): string {
    // Handles standard YouTube URLs
    const match = url.match(/(?:v=|\.be\/|embed\/|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (match && match[1]) return match[1];
    // Handles URLs like https://www.youtube.com/watch?v=ID&...
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('v')) return urlObj.searchParams.get('v')!;
    // Handles playlist or other formats
    return url.split('/').pop() || '';
}

export const videoData: Video[] = (() => {
    let id = 1;
    const videos: Video[] = [];
    for (const [gradeKey, subjects] of Object.entries(allGrades)) {
        const grade = gradeKey.replace('grade', '');
        for (const [subject, vids] of Object.entries(subjects as any)) {
            for (const vid of vids as any[]) {
                videos.push({
                    id: id++,
                    title: vid.title,
                    grade,
                    subject,
                    youtubeId: extractYoutubeId(vid.url),
                });
            }
        }
    }
    return videos;
})();
