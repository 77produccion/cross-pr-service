# Auditoría visual: continuidad y menos ruido

## Criterio

La petición sustituye la copia literal de los adornos de la propuesta por una presentación más sencilla. Se conservan sus colores carbón/crema/dorado, serif editorial y fotografía real; no se añaden reseñas, cifras ni promesas comerciales. Las cinco rutas y todas las fotografías de la galería permanecen disponibles.

## Home

- Retirados la cinta de servicios en bucle, el marco interior del hero, el aviso de scroll y las tres cifras que repetían experiencia, público y ubicación. El H1 mantiene servicio y ciudades; el texto conserva los 10+ años.
- Titular del hero más contenido para dejar respirar la fotografía y evitar la composición excesivamente alta.
- Titular de servicios directo, sin el texto genérico de “craft / façade”, numeración decorativa ni descripciones largas.
- En escritorio con ratón, las fotos de servicios son claras en reposo; al hover o foco dentro de la tarjeta se oscurecen y aparece la descripción con opacity/transform. El título se desplaza sin recalcular layout. El CTA sigue visible y enfocable. En móvil/táctil y pantallas estrechas la descripción permanece visible.
- Comparador conservado: es evidencia visual del par aprobado, con un título literal y una sola instrucción.
- About simplificado a una foto corporativa y un párrafo sobre Maurilio/experiencia; retirados el badge duplicado, los checks repetidos y las fotos superpuestas de preparación.
- Cobertura reducida a dos destinos reales. Sin tercera tarjeta de “Ask us”, halos decorativos ni texto repetido.
- Formulario sin watermark gigante ni proceso numerado ficticio. No se elimina el aviso que aclara el envío mediante WhatsApp.

## Hero: selección visual

`src/config/presentation.ts` concentra seis fotos cuya apariencia muestra acabados más completos: exterior oscuro después, cocina blanca, exterior azul, mueble de vino, entrada de vidrio decorativo y fachada comercial. No se interpreta esta selección como certificación de una técnica o alcance contractual.

Se excluyen del hero la van (continúa en About/CTA), la foto Before, las superficies enmascaradas, los andamios y los interiores con preparación visible. No se eliminan de la galería ni se alteran los archivos originales.

La primera imagen exterior se sirve eager/high; las otras cinco tienen fuentes diferidas y se cargan/decodifican una a una antes de fundirse. No se descargan todas al abrir la página. Un fallo salta a la siguiente foto; el fondo base siempre permanece opaco. El ciclo se pausa en una pestaña oculta y se limpia al cambiar de página. Sin JS queda el exterior terminado, el H1 y los enlaces.

## Internas

- Services, About, Our Work y Contact pasan a fondos carbón, texto crema, acentos dorados y cabeceras fotográficas propias con títulos serif. Ya no son páginas claras con una franja oscura aislada.
- Las introducciones se concentran en la cabecera, evitando repetirlas inmediatamente debajo en MDX.
- Services conserva los seis servicios, anclas y CTA; índice sin caja beige y bloques fotográficos separados por líneas discretas.
- About integra empresa, propietario y enfoque en una sola composición con foto.
- Our Work conserva filtros, 54 fotos, proyectos y visor; las descripciones extensas viven en el visor, no duplicadas en cada tarjeta.
- Contact comparte el formulario oscuro con Home; campos legibles, acción dorada y cobertura/contacto sin cajas redundantes.
- El visor mantiene su superficie clara deliberada y contraste independiente para no heredar los colores de página.

## Comprobación

### Movimiento fotográfico

Las cabeceras internas, tarjetas de servicios y proyectos, foto de empresa y CTA optan a `data-photo-motion`. GSAP escala suavemente el `<picture>` de 1 a 1.035 al entrar en pantalla, una sola vez, sin alterar dimensiones ni ocultar imágenes. En escritorio, hover/foco escala el `<img>` interior a 1.06 mediante CSS; son capas distintas para no competir por el mismo transform. Cada foto del hero incorpora además un zoom de 1 a 1.04 durante su tiempo visible, conservando la cadencia del cross-fade.

No se aplica zoom al comparador ni al visor ampliado, donde importa conservar encuadre y geometría. No se añaden plugins, parallax ni scroll fijado. La limpieza existente revierte las transformaciones GSAP. Sin JavaScript las fotos y enlaces permanecen visibles.

La carpeta de propuesta se conserva localmente como referencia interna y se excluye de Git junto a los originales; el commit incorpora solo implementación, derivados web, tipografías con sus licencias, documentación y pruebas.

Pruebas específicas para hover/foco, descripción visible en táctil, superficies oscuras de las cuatro internas, fuente LCP prioritaria, seis imágenes seleccionadas, carga diferida sin JS y ciclo completo con fallo de una imagen. Se mantienen las pruebas existentes de contenido, imágenes, formulario, navegación y galerías. Ejecutar `npm run validate` antes de entregar; no se afirman puntuaciones Lighthouse.
