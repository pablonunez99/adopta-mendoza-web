import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    
    if (!accessToken || accessToken.includes('TEST-0000000000')) {
      return NextResponse.json({ error: 'Mercado Pago Access Token no configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });

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