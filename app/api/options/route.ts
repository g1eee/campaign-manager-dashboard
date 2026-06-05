import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'options.json');

export async function GET() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const options = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { category, value } = await request.json();
  if (!category || !value) {
    return NextResponse.json({ error: 'category and value required' }, { status: 400 });
  }
  if (!options[category]) {
    options[category] = [];
  }
  options[category].push(value);
  fs.writeFileSync(dataPath, JSON.stringify(options, null, 2), 'utf-8');
  return NextResponse.json(options);
}
