import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imgbbFormData = new FormData();
    imgbbFormData.append('key', '873f5410a876d66b8845cd55d4695bee');
    imgbbFormData.append('image', file);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: imgbbFormData
    });

    const data = await res.json();
    
    if (data.success) {
      return NextResponse.json({ url: data.data.url });
    } else {
      console.error('ImgBB error:', data);
      return NextResponse.json({ error: 'ImgBB upload failed', details: data }, { status: 400 });
    }
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
