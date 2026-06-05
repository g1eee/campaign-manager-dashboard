import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'entries.json');

export async function GET() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const entries = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const body = await request.json();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    ...body,
  };
  entries.push(newEntry);
  fs.writeFileSync(dataPath, JSON.stringify(entries, null, 2), 'utf-8');
  return NextResponse.json(newEntry, { status: 201 });
}
