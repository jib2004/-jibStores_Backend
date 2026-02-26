import { createClient } from 'redis';
import dotenv from 'dotenv'
// import express from 'express'

dotenv.config()

const client = createClient({
    username: 'default',
    password:  process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST ,
        port: parseInt(process.env.REDIS_PORT),
        tls:true
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

if (!client.isOpen){
    await client.connect()
}


export {client} 