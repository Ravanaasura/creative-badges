const satori = require('satori');
const { readFileSync } = require('fs');
const { join } = require('path');
const axios = require('axios');

// We use module.exports for CommonJS compatibility
module.exports = async (req, res) => {
  try {
    console.log('Function invoked!'); // For debugging in Vercel logs

    const font = readFileSync(join(process.cwd(), 'public/Inter-Bold.ttf'));
    const { user, repo, color = '#0070f3' } = req.query;

    if (!user || !repo) {
      return res.status(400).json({ error: 'Missing user or repo query parameters' });
    }

    const { data } = await axios.get(`https://api.github.com/repos/${user}/${repo}`);
    const starCount = new Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.stargazers_count);

    // This is the new template using plain JavaScript objects instead of JSX
    const template = {
      type: 'div',
      props: {
        style: {
          height: '60px',
          width: 'auto',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          backgroundColor: color,
          borderRadius: '10px',
          color: 'white',
          fontFamily: 'Inter',
          fontSize: '22px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        },
        children: [
          {
            type: 'span',
            props: {
              style: { marginRight: '15px' },
              children: data.name,
            },
          },
          {
            type: 'span',
            props: {
              style: { display: 'flex', alignItems: 'center' },
              children: `⭐ ${starCount}`,
            },
          },
        ],
      },
    };

    const svg = await satori(template, {
      width: 400, // Provide a default width
      height: 60,
      fonts: [{ name: 'Inter', data: font, weight: 700, style: 'normal' }],
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=3600');
    return res.status(200).send(svg);

  } catch (error) {
    console.error('Error caught:', error); // Log the full error
    return res.status(500).json({ error: 'Failed to generate badge', details: error.message });
  }
};
