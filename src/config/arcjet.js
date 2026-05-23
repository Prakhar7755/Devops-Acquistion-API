import 'dotenv/config';
import arcjet, { shield, detectBot, slidingWindow } from '@arcjet/node';

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE', // Blocks requests. Use "DRY_RUN" to log only
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc
        'CATEGORY:MONITOR', // Uptime monitoring services
        'CATEGORY:PREVIEW', // Link previews e.g. Slack, Discord
      ],
    }),
    slidingWindow({
      mode: 'LIVE',
      interval: '2s',
      max: 5,
    }),
  ],
});

export default aj;
