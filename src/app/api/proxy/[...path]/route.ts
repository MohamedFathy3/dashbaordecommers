// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const baseUrl = process.env.TARGET_API || 'https://job.professionalacademyedu.com/api';

async function proxyRequest(
  method: string,
  endpoint: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any,
  contentType?: string,
  request?: NextRequest
) {
  const url = `${baseUrl}/${endpoint}`;
  
  const headers: HeadersInit = {};

  // استخراج التوكن من الكوكيز
  const cookies = request?.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  if (tokenMatch) {
    const token = decodeURIComponent(tokenMatch[1]);
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body) {
    if (contentType?.includes('multipart/form-data')) {
      // إذا كان FormData، أرسله كما هو
      fetchOptions.body = body;
      // لا تضف Content-Type header - سيتم تعيينه تلقائياً مع boundary
    } else {
      // إذا كان JSON
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }
  }

  console.log('🚀 Proxying request to:', url);
  console.log('📋 Method:', method);
  console.log('📦 Content-Type:', contentType);

  const response = await fetch(url, fetchOptions);
  
  const responseContentType = response.headers.get('content-type') || '';
  const isJson = responseContentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  return { response, data };
}

// POST - مع دعم FormData
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.split('/api/proxy/')[1].split('/');
    const endpoint = path.join('/');
    
    const contentType = request.headers.get('content-type') || '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = undefined;

    if (contentType.includes('multipart/form-data')) {
      // إذا كان FormData (صورة)، أرسله مباشرة
      body = await request.formData();
      console.log('📸 FormData request with files');
    } else if (contentType.includes('application/json')) {
      // إذا كان JSON
      try {
        body = await request.json();
        console.log('📥 JSON request body:', body);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }

    const { response, data } = await proxyRequest('POST', endpoint, body, contentType, request);

    // معالجة تسجيل الدخول
    const res = NextResponse.json(data, { status: response.status });
    if (endpoint === 'login/admin' && response.ok && data && data.token) {
      res.cookies.set({
        name: 'token',
        value: data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('❌ Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - نفس التعديلات
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.split('/api/proxy/')[1].split('/');
    const endpoint = path.join('/');
    
    const contentType = request.headers.get('content-type') || '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = undefined;

    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
      console.log('📸 FormData PUT request with files');
    } else if (contentType.includes('application/json')) {
      try {
        body = await request.json();
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }

    const { response, data } = await proxyRequest('PUT', endpoint, body, contentType, request);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - نفس التعديلات
export async function PATCH(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.split('/api/proxy/')[1].split('/');
    const endpoint = path.join('/');
    
    const contentType = request.headers.get('content-type') || '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any = undefined;

    if (contentType.includes('multipart/form-data')) {
      body = await request.formData();
      console.log('📸 FormData PATCH request with files');
    } else if (contentType.includes('application/json')) {
      try {
        body = await request.json();
      } catch (parseError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    }

    const { response, data } = await proxyRequest('PATCH', endpoint, body, contentType, request);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET و DELETE يبقوا كما هما
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.split('/api/proxy/')[1].split('/');
  const endpoint = path.join('/');

  const { response, data } = await proxyRequest('GET', endpoint, undefined, undefined, request);
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE(request: NextRequest) {
  const url = new URL(request.url);
  const path = url.pathname.split('/api/proxy/')[1].split('/');
  const endpoint = path.join('/');

  let body = undefined;
  try {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await request.json();
    }
  } catch {
    // No body - هذا طبيعي
  }

  const { response, data } = await proxyRequest('DELETE', endpoint, body, undefined, request);
  return NextResponse.json(data, { status: response.status });
}