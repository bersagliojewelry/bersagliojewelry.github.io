// Contact Form Handler for ALTORRA CARS

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Create WhatsApp message
        const message = `
*NUEVO CONTACTO - ALTORRA CARS*

*Nombre:* ${data.nombre}
*Email:* ${data.email}
*Teléfono:* ${data.telefono}
*Vehículo de interés:* ${data.vehiculo || 'No especificado'}
*Asunto:* ${data.asunto}

*Mensaje:*
${data.mensaje}
        `.trim();

        // Encode message for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/573235016747?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappURL, '_blank');

        // Show success message with toast (if available)
        if (typeof toast !== 'undefined') {
            toast.success('Serás redirigido a WhatsApp para completar tu consulta.', '¡Gracias por tu mensaje!');
        }

        // Reset form
        contactForm.reset();
    });
}
