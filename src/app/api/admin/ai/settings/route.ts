import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';
import { customAlphabet } from 'nanoid';

const genSecret = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 24);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'ai_auto_charge_enabled',
            'ai_phone_webhook_secret',
            'ai_confidence_threshold',
            'ai_admin_phone',
            'ai_audio_alert_enabled',
          ],
        },
      },
    });

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

    // If secret not generated yet, generate one
    let secret = map.ai_phone_webhook_secret;
    if (!secret) {
      secret = `vip_sec_${genSecret()}`;
      await prisma.setting.upsert({
        where: { key: 'ai_phone_webhook_secret' },
        create: { key: 'ai_phone_webhook_secret', value: secret },
        update: { value: secret },
      });
    }

    return NextResponse.json({
      autoChargeEnabled: map.ai_auto_charge_enabled !== 'false',
      webhookSecret: secret,
      confidenceThreshold: parseFloat(map.ai_confidence_threshold || '70'),
      adminPhone: map.ai_admin_phone || '01069954152',
      audioAlertEnabled: map.ai_audio_alert_enabled !== 'false',
    });
  } catch (error: any) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to load AI settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { autoChargeEnabled, webhookSecret, confidenceThreshold, adminPhone, audioAlertEnabled, regenerateSecret } = body;

    const updates: { key: string; value: string }[] = [];

    if (typeof autoChargeEnabled === 'boolean') {
      updates.push({ key: 'ai_auto_charge_enabled', value: String(autoChargeEnabled) });
    }

    if (regenerateSecret) {
      const newSecret = `vip_sec_${genSecret()}`;
      updates.push({ key: 'ai_phone_webhook_secret', value: newSecret });
    } else if (typeof webhookSecret === 'string' && webhookSecret.trim()) {
      updates.push({ key: 'ai_phone_webhook_secret', value: webhookSecret.trim() });
    }

    if (typeof confidenceThreshold === 'number') {
      updates.push({ key: 'ai_confidence_threshold', value: String(confidenceThreshold) });
    }

    if (typeof adminPhone === 'string' && adminPhone.trim()) {
      updates.push({ key: 'ai_admin_phone', value: adminPhone.trim() });
    }

    if (typeof audioAlertEnabled === 'boolean') {
      updates.push({ key: 'ai_audio_alert_enabled', value: String(audioAlertEnabled) });
    }

    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value },
        update: { value: item.value },
      });
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to save AI settings' },
      { status: 500 }
    );
  }
}
