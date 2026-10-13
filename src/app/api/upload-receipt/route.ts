import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderNumber = formData.get('orderNumber');
    const file = formData.get('receipt');

    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Receipt image file is required' },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check order status is PENDING_PAYMENT
    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        {
          error: `Receipt cannot be uploaded for an order with status "${order.status}". Only pending orders accept receipts.`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 5MB.' },
        { status: 400 }
      );
    }

    // Determine file extension
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.name) {
      const parsedExt = path.extname(file.name).replace('.', '').toLowerCase();
      if (['jpg', 'jpeg', 'png', 'webp'].includes(parsedExt)) {
        ext = parsedExt === 'jpeg' ? 'jpg' : parsedExt;
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Default to Base64 data URL (works in all environments, zero disk dependency)
    let receiptUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    // On local machine with writable filesystem, optionally save to disk
    if (!process.env.VERCEL) {
      try {
        const uniqueId = crypto.randomUUID();
        const filename = `${uniqueId}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        receiptUrl = `/uploads/${filename}`;
      } catch (err) {
        console.warn('Filesystem write failed, using base64 data URI instead:', err);
      }
    }

    // Update order status and record history
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          receiptUrl,
          status: 'UNDER_REVIEW',
        },
      }),
      prisma.statusHistory.create({
        data: {
          orderId: order.id,
          status: 'UNDER_REVIEW',
          note: 'Receipt uploaded by customer',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Receipt uploaded successfully',
      receiptUrl,
    });
  } catch (error: any) {
    console.error('Error uploading receipt:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt upload due to an internal error' },
      { status: 500 }
    );
  }
}
