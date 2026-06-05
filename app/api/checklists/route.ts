import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'checklists.json');

export async function GET() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const checklists = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { campaign, stepIndex, checked } = await request.json();
  if (!campaign || stepIndex === undefined) {
    return NextResponse.json({ error: 'campaign and stepIndex required' }, { status: 400 });
  }
  if (!checklists[campaign]) {
    checklists[campaign] = {};
  }
  checklists[campaign][stepIndex] = checked;
  fs.writeFileSync(dataPath, JSON.stringify(checklists, null, 2), 'utf-8');
  return NextResponse.json(checklists);
}
