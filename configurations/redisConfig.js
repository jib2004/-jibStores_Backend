import { createClient } from 'redis';

export const client = createClient({
   url:process.env.REDIS_URL
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

 