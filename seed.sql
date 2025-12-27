-- INSERTAR REFUGIOS
INSERT INTO public.shelters (name, description, phone, website, address, is_verified) VALUES
('Refugio El Campito Mendoza', 'Dedicados a la rehabilitación y reinserción de animales maltratados.', '5492615550001', 'https://elcampito.org', 'Ruta 82, Luján de Cuyo', true),
('Ángeles de Cuatro Patas', 'Grupo de voluntarios independientes unidos por el amor a los animales.', '5492615550002', 'https://angelescuatropatas.com', 'Ciudad de Mendoza', true),
('Mendoza Animal', 'ONG comprometida con el control poblacional y la adopción responsable.', '5492615550003', 'https://mendozaanimal.org', 'Godoy Cruz', true),
('Hogar San Roque', 'Santuario para perros ancianos y discapacitados.', '5492615550004', '', 'Guaymallén', false);

-- INSERTAR MASCOTAS CON IMÁGENES ÚNICAS Y NOMBRES REALES
DO $$
DECLARE
    random_shelter_id UUID;
    
    -- Arrays de datos
    names TEXT[] := ARRAY['Luna', 'Rocky', 'Bella', 'Max', 'Lola', 'Simba', 'Coco', 'Thor', 'Nala', 'Milo', 'Daisy', 'Bruno', 'Kira', 'Zeus', 'Mia', 'Jack', 'Chloe', 'Toby', 'Nina', 'Oreo', 'Frida', 'Lucky', 'Maya', 'Pancho', 'Lulu', 'Chester', 'Pepe', 'Sasha', 'Bobby', 'Ruby', 'Duque', 'Ginger', 'Oso', 'Molly', 'Rex', 'Fiona', 'Bambi', 'Chispa', 'Goku', 'Kiara', 'Apolo', 'Dina', 'Rocco', 'Cleo', 'Simon', 'Tita', 'Pumba', 'Zoe', 'Negro', 'Blanca'];
    
    dog_images TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9266', 'https://images.unsplash.com/photo-1517849845537-4d257902454a', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8',
        'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01', 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', 'https://images.unsplash.com/photo-1552053831-71594a27632d',
        'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb', 'https://images.unsplash.com/photo-1507146426996-ef05306b995a', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
        'https://images.unsplash.com/photo-1504595403659-9088ce801e29', 'https://images.unsplash.com/photo-1529472119196-cb724127a98e', 'https://images.unsplash.com/photo-1568393691622-c7ba780683a5', 'https://images.unsplash.com/photo-1554456854-41a0eac71123', 'https://images.unsplash.com/photo-1534361960057-19889db9621e',
        'https://images.unsplash.com/photo-1560807707-8cc77767d783', 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8a9d', 'https://images.unsplash.com/photo-1505628346881-b72b27e84530', 'https://images.unsplash.com/photo-1553882809-a4f57e59501d', 'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a',
        'https://images.unsplash.com/photo-1548247416-ec66f4900b2e', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97', 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6'
    ];
    
    cat_images TEXT[] := ARRAY[
        'https://images.unsplash.com/photo-1529778873920-4da4926a7071', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5', 'https://images.unsplash.com/photo-1495360019602-e001921678fe', 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce',
        'https://images.unsplash.com/photo-1592194996308-7b43878e84a6', 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4', 'https://images.unsplash.com/photo-1513245543132-31f507417b26', 'https://images.unsplash.com/photo-1501820488136-72669149e0d4', 'https://images.unsplash.com/photo-1506755855567-92ff770e8d00',
        'https://images.unsplash.com/photo-1511044568932-338cba0fb803', 'https://images.unsplash.com/photo-1543852786-1cf6624b9987', 'https://images.unsplash.com/photo-1574158622682-e40e69881006', 'https://images.unsplash.com/photo-1491485880348-85d48a9e5312', 'https://images.unsplash.com/photo-1503431192666-460343538b3b',
        'https://images.unsplash.com/photo-1520315342629-6ea920342047', 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec', 'https://images.unsplash.com/photo-1494256997604-0e170c85f052', 'https://images.unsplash.com/photo-1548546738-8509cb246ed3', 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13'
    ];

    i INT;
    curr_species TEXT;
    curr_image TEXT;
    curr_name TEXT;
    curr_status TEXT;
    curr_breed TEXT;
    
    random_lat FLOAT;
    random_lng FLOAT;
BEGIN
    FOR i IN 1..50 LOOP
        -- Seleccionar nombre secuencialmente para que no se repitan
        curr_name := names[i];

        -- Seleccionar un refugio aleatorio
        SELECT id INTO random_shelter_id FROM public.shelters ORDER BY random() LIMIT 1;
        
        -- Decidir especie (60% Perros, 40% Gatos)
        IF random() > 0.4 THEN
            curr_species := 'dog';
            -- Seleccionar imagen aleatoria de perro
            curr_image := dog_images[floor(random() * array_length(dog_images, 1)) + 1];
            curr_breed := (ARRAY['Mestizo', 'Labrador', 'Caniche', 'Ovejero', 'Golden', 'Bulldog'])[floor(random()*6)+1];
        ELSE
            curr_species := 'cat';
            -- Seleccionar imagen aleatoria de gato
            curr_image := cat_images[floor(random() * array_length(cat_images, 1)) + 1];
            curr_breed := (ARRAY['Común Europeo', 'Siamés', 'Persa', 'Naranja'])[floor(random()*4)+1];
        END IF;

        -- Status aleatorio
        IF random() > 0.8 THEN curr_status := 'adopted';
        ELSIF random() > 0.7 THEN curr_status := 'lost';
        ELSIF random() > 0.65 THEN curr_status := 'found';
        ELSE curr_status := 'adoptable'; END IF;

        -- Coordenadas cerca de Mendoza
        random_lat := -32.8895 + (random() - 0.5) * 0.15;
        random_lng := -68.8458 + (random() - 0.5) * 0.15;

        INSERT INTO public.animals (
            name, 
            species, 
            breed, 
            age_approx, 
            size, 
            sex, 
            description, 
            status, 
            photos, 
            shelter_id,
            last_seen_lat,
            last_seen_long
        ) VALUES (
            curr_name,
            curr_species::animal_species, 
            curr_breed,
            (floor(random() * 8) + 1)::text || ' años',
            (ARRAY['small', 'medium', 'large'])[floor(random()*3)+1],
            (ARRAY['male', 'female'])[floor(random()*2)+1],
            'Hola, soy ' || curr_name || '. Soy muy cariñoso y busco una familia que me quiera para siempre.',
            curr_status::animal_status, 
            ARRAY[curr_image],
            CASE WHEN curr_status = 'adoptable' OR curr_status = 'adopted' THEN random_shelter_id ELSE NULL END,
            CASE WHEN curr_status = 'lost' OR curr_status = 'found' THEN random_lat ELSE NULL END,
            CASE WHEN curr_status = 'lost' OR curr_status = 'found' THEN random_lng ELSE NULL END
        );
    END LOOP;
END $$;