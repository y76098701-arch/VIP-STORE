import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, currentPassword, newPassword } = body;

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Verify current password
    if (!currentPassword) {
      return NextResponse.json(
        { error: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغيير' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, currentAdmin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'كلمة المرور الحالية غير صحيحة' },
        { status: 400 }
      );
    }

    const updateData: { email?: string; password?: string } = {};

    // Validate and update email
    if (email && email.trim() !== currentAdmin.email) {
      const emailTrimmed = email.trim().toLowerCase();
      // Check if email already taken by another admin
      const existing = await prisma.admin.findUnique({
        where: { email: emailTrimmed },
      });
      if (existing && existing.id !== currentAdmin.id) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني الجديد مستخدم بالفعل' },
          { status: 400 }
        );
      }
      updateData.email = emailTrimmed;
    }

    // Validate and update new password
    if (newPassword && newPassword.trim()) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'يجب أن لا تقل كلمة المرور الجديدة عن 6 أحرف' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'لم تقم بتغيير البريد أو كتابة كلمة مرور جديدة' },
        { status: 400 }
      );
    }

    const updated = await prisma.admin.update({
      where: { id: currentAdmin.id },
      data: updateData,
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات حساب الإدارة بنجاح',
      admin: updated,
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
