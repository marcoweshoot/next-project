import fs from 'node:fs/promises';
import path from 'node:path';


const base = path.join(process.cwd(), '.cache', 'cms');
const memo = new Map<string, unknown>();


export async function readSnapshot<T = unknown>(name: string): Promise<T | null> {
const key = name;
if (memo.has(key)) return memo.get(key) as T;
try {
const buf = await fs.readFile(path.join(base, name), 'utf-8');
const json = JSON.parse(buf);
memo.set(key, json);
return json as T;
} catch {
return null;
}
}