import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const allSettings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};

    for (const item of allSettings) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    let entries: { key: string; value: string }[] = [];

    if (Array.isArray(body)) {
      entries = body
        .filter((item) => item && typeof item.key === 'string')
        .map((item) => ({ key: item.key.trim(), value: String(item.value ?? '') }));
    } else if (body && Array.isArray(body.settings)) {
      entries = body.settings
        .filter((item: any) => item && typeof item.key === 'string')
        .map((item: any) => ({ key: item.key.trim(), value: String(item.value ?? '') }));
    } else if (body && typeof body.settings === 'object' && body.settings !== null) {
      entries = Object.entries(body.settings).map(([key, value]) => ({
        key: key.trim(),
        value: String(value ?? ''),
      }));
    } else if (body && typeof body === 'object') {
      entries = Object.entries(body)
        .filter(([key]) => key !== 'settings')
        .map(([key, value]) => ({
          key: key.trim(),
          value: String(value ?? ''),
        }));
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No valid settings provided to update' },
        { status: 400 }
      );
    }

    // Upsert each setting in a transaction
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.setting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: { key: entry.key, value: entry.value },
        })
      )
    );

    const refreshedSettings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const item of refreshedSettings) {
      settingsMap[item.key] = item.value;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: settingsMap,
    });
  } catch (error: any) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
