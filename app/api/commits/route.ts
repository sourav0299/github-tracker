import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const since = searchParams.get('since');
  const until = searchParams.get('until');

  if (!since || !until) {
    return NextResponse.json(
      { error: 'Missing required query parameters: since and until' },
      { status: 400 }
    );
  }

  try {
    const username = 'sourav0299'; // Replace with your GitHub username
    const token = process.env.GITHUB_TOKEN;

    let totalCommits = 0;
    let page = 1;
    let hasMoreCommits = true;

    while (hasMoreCommits) {
      const commitsResponse = await fetch(
        `https://api.github.com/search/commits?q=author:${username}+author-date:${since}..${until}&sort=author-date&order=desc&per_page=100&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.cloak-preview',
          },
        }
      );

      if (!commitsResponse.ok) {
        throw new Error(`GitHub API responded with status ${commitsResponse.status}`);
      }

      const commitsData = await commitsResponse.json();
      totalCommits += commitsData.items.length;

      if (commitsData.items.length < 100) {
        hasMoreCommits = false;
      } else {
        page++;
      }

      // Respect GitHub's rate limit
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({ totalCommits });
  } catch (error) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching commits.' },
      { status: 500 }
    );
  }
}