import satori from 'satori';
import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';

// Load the custom font file from the 'public' directory
const font = readFileSync(join(process.cwd(), 'public/Inter-Bold.ttf'));

export default async function handler(req, res) {
  try {
    const { user, repo, design = 'classic', color = '#0070f3' } = req.query;

    if (!user || !repo) {
      return res.status(400).send('Missing user or repo query parameters');
    }

    // 1. Fetch External Data
    const { data } = await axios.get(`https://api.github.com/repos/${user}/${repo}`);
    const starCount = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.stargazers_count);
    const repoName = data.name;

    // 2. Define different designs
    const designs = {
      glass: {
        width: 260,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '15px',
        color: 'white',
        fontFamily: 'Inter',
        fontSize: 24,
        textShadow: '0 2px 5px rgba(0,0,0,0.2)',
      },
      classic: {
        width: 'auto',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        backgroundColor: color,
        borderRadius: '10px',
        color: 'white',
        fontFamily: 'Inter',
        fontSize: 22,
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
      }
    };

    const selectedStyle = designs[design] || designs.classic;

    // 3. Define the HTML template for Satori
    const template = (
      <div style={{ ...selectedStyle }}>
        <span style={{ marginRight: '15px' }}>{repoName}</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          ⭐ {starCount}
        </span>
      </div>
    );

    // 4. Generate the SVG with Satori
    const svg = await satori(template, {
      width: selectedStyle.width,
      height: selectedStyle.height,
      fonts: [
        {
          name: 'Inter',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // 5. Send the response
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    res.status(200).send(svg);

  } catch (error) {
    res.status(500).send(`Error generating badge: ${error.message}`);
  }
}
