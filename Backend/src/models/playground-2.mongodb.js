/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('MiHogarDB');

// Update the document in the current collection.
db.getCollection('properties')
    .updateOne(
        {
            _id: ObjectId('6799574b403379c67ff5dbc6') // Filter by ID
        },
        {
            $set: {
                // Add the fields you want to update here
                rich_description: 'Hermosa casa en calleVictoria Ocampo entre Repetto y Ombú, espaciosa, con jardín de verde césped, con diversidad de plantas y limitado por espesa arboleda y variada vegetación, a seiscientos metros de la playa . COMODIDADES PLANTA BAJA: living con salida a una pequeña terraza con vista al jardín, comedor con cocina integrada, completa, con 2 heladeras con freezer y un baño completo. Saliendo de la misma encontramos un deck con bellísima vista, donde hay una parrilla, . Bajando una escalera, tenemos garage con espacio utilizable comolavadero . PLANTA ALTA: 1 habitación con cama matrimonial y 2 camas de una plaza, otra con 2 camas de una plaza y otra habitación con cama matrimonial. Baño completo. Cada habitación tiene TV En su parte posterior, tenemos un encantador jardín que nos aporta el deseado relax, tranquilidad y bienestar y un quincho con parrilla, destinado a pasar los mejores momentos familiares y que también se puede usar como cochera. Es una opción justa para ayudarlo a decidir por unas vacaciones únicas e inolvidables!!!',
                // Add other fields as needed
            }
        }
    );
