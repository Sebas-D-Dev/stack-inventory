import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Generate a reset token and expiration
    // Regardless of whether the user exists (for security reasons)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    if (user) {
      // Update the user with the reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // In a production app, you would send an email with the reset link
      // For example:
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Reset your password',
      //   text: `Click the link to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
      // });
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with that email, you will receive password reset instructions.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}