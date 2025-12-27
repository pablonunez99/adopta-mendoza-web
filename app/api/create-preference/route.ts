import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

// Initialize server-side SDK
// MAKE SURE TO ADD MP_ACCESS_TOKEN TO YOUR .ENV
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000' 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, quantity, price } = body;

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: 'donation',
            title: title,
            quantity: quantity,
            unit_price: Number(price),
            currency_id: 'ARS',
          },
        ],
        back_urls: {
          success: 'https://adopta-mendoza.vercel.app/donar', // Replace with your domain
          failure: 'https://adopta-mendoza.vercel.app/donar',
          pending: 'https://adopta-mendoza.vercel.app/donar',
        },
        auto_return: 'approved',
      },
    });

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating preference' }, { status: 500 });
  }
}