import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = session.user as any;
  const isAdmin = user.role === 'ADMIN';
  const originalAdminId = user.originalAdminId;

  const { userId } = await req.json();

  // Allow if user is an ADMIN, or if they are trying to switch BACK to their original admin account
  if (!isAdmin && originalAdminId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Determine what to save as originalAdminId.
  // If they are an ADMIN switching to a MANAGER, save the ADMIN's ID.
  // If they are switching BACK to their original ADMIN account, clear it (null).
  const newOriginalAdminId = isAdmin ? user.id : 'null';

  const expires = Date.now() + 5 * 60 * 1000; // 5 minutes validity
  const payload = `${userId}:${newOriginalAdminId}:${expires}`;
  
  const hmac = crypto.createHmac('sha256', process.env.NEXTAUTH_SECRET || "default_secret")
    .update(payload)
    .digest('hex');
    
  const token = `${payload}:${hmac}`;
  
  return NextResponse.json({ token });
}
