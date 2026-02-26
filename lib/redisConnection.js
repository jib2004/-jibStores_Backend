import { createClient } from 'redis';
import { redis_url } from '../app';

const client = createClient({
    url: redis_url
});

//  username: 'default',
//     password:  process.env.REDIS_PASSWORD,
//     socket: {
//         host: process.env.REDIS_HOST ,
//         port: parseInt(process.env.REDIS_PORT),
//         // tls:true
//     }

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar


if (!client.isOpen){
    await client.connect()
}


export {client} 