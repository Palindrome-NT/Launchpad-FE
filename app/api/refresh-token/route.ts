import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const refreshToken = (await cookieStore).get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, message: 'No refresh token found' },
      { status: 401 }
    );
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
    
    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (response.ok) {
      const setCookieHeaders = response.headers.get('set-cookie');
      
      const nextResponse = NextResponse.json(data, { status: 200 });
      
      if (setCookieHeaders) {
        nextResponse.headers.set('set-cookie', setCookieHeaders);
      }
      
      return nextResponse;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { success: false, message: 'Refresh token failed' },
      { status: 500 }
    );
  }
}
