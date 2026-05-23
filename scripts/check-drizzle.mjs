import 'drizzle-orm';
const keys = Object.keys(await import('drizzle-orm'));
console.log(keys.filter(k => /drizzle|Database|db/i.test(k)));

const pg = await import('drizzle-orm/pg-core');
console.log('\npg-core drizzle-related:', Object.keys(pg).filter(k => /drizzle|Database/i.test(k)));

const neon = await import('drizzle-orm/neon-http');
console.log('\nneon-http drizzle-related:', Object.keys(neon).filter(k => /drizzle|Database/i.test(k)));
