import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(req.url);
    
    // Test if we can access different API routes
    const apiTests = [];
    
    try {
      const productsHomeRes = await fetch(`${req.nextUrl.origin}/api/products/home`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      apiTests.push({
        endpoint: '/api/products/home',
        status: productsHomeRes.status,
        ok: productsHomeRes.ok,
        statusText: productsHomeRes.statusText,
      });
    } catch (error: any) {
      apiTests.push({
        endpoint: '/api/products/home',
        status: 'ERROR',
        error: error.message,
      });
    }

    try {
      const productsRes = await fetch(`${req.nextUrl.origin}/api/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      apiTests.push({
        endpoint: '/api/products',
        status: productsRes.status,
        ok: productsRes.ok,
        statusText: productsRes.statusText,
      });
    } catch (error: any) {
      apiTests.push({
        endpoint: '/api/products',
        status: 'ERROR',
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      requestInfo: {
        url: req.url,
        pathname,
        searchParams: Object.fromEntries(searchParams.entries()),
        method: req.method,
        origin: req.nextUrl.origin,
        host: req.nextUrl.host,
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        headers: Object.fromEntries(req.headers.entries()),
      },
      apiTests,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
