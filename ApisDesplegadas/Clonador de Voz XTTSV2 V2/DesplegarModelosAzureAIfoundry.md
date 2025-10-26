# Guía: Despliegue de Modelos de IA en Azure AI Foundry y Uso en n8n

Esta guía te mostrará cómo desplegar un modelo de inteligencia artificial desde el catálogo de Azure AI Foundry y cómo integrarlo en tus flujos de trabajo de n8n para automatizar tareas.

## Prerrequisitos

- Una cuenta de Azure con una suscripción activa.
- Acceso a [Azure AI Studio](https://ai.azure.com/).
- Una instancia de n8n (Cloud o auto-alojada).

---

## Parte 1: Desplegar un Modelo en Azure AI Foundry

Azure AI Foundry (o el Catálogo de Modelos de Azure AI) ofrece una amplia gama de modelos de IA de código abierto que puedes desplegar fácilmente.

### Paso 1: Encontrar un Modelo

1.  **Ve a Azure AI Studio**: Inicia sesión en el portal de Azure AI Studio.
2.  **Abre el Catálogo de Modelos**: En el menú de la izquierda, selecciona **Catálogo de modelos**.
3.  **Selecciona un Modelo**: Explora los modelos disponibles. Puedes filtrar por tipo de tarea (p. ej., "Generación de texto"), colección o nombre. Para este ejemplo, buscaremos un modelo de lenguaje como **Llama** o **Mistral**.
4.  **Haz clic en "Deploy" (Desplegar)**: Una vez que hayas elegido un modelo, verás una opción para desplegarlo.

### Paso 2: Configurar el Despliegue

1.  **Elige el Tipo de Endpoint**: Se te pedirá que elijas entre un **endpoint en tiempo real** o un **endpoint por lotes**. Para la integración con n8n, usaremos un **endpoint en tiempo real**, ya que nos permite obtener respuestas inmediatas.

2.  **Configuración del Endpoint**:
    - **Máquina Virtual (VM)**: Selecciona el tamaño de la VM. Los modelos más grandes requieren VMs más potentes (y más costosas). Comienza con una recomendada si no estás seguro.
    - **Número de Instancias**: Define cuántas instancias de la VM se ejecutarán. Para pruebas, una es suficiente.
    - **Nombre del Endpoint**: Dale un nombre descriptivo a tu despliegue.

3.  **Revisa y Crea**: Revisa la configuración y los costos estimados. Luego, haz clic en **Crear**. El despliegue puede tardar varios minutos.

### Paso 3: Obtener los Detalles del Endpoint

Una vez que el modelo esté desplegado, necesitas obtener dos piezas clave de información:

1.  **URL del Endpoint REST**: Esta es la URL a la que enviarás las peticiones.
2.  **Clave de API (API Key)**: Esta es tu credencial de autenticación.

Para encontrarlas:

- Ve a la sección **Endpoints** en Azure AI Studio.
- Selecciona tu endpoint desplegado.
- En la pestaña **Consumir**, encontrarás la **URL del endpoint REST** y la **Clave de API principal**.

¡Guarda estos dos valores! Los necesitarás para n8n.

---

## Parte 2: Integrar el Modelo con n8n

Ahora que tienes un modelo desplegado y accesible a través de una API REST, puedes conectarlo a n8n.

### Paso 1: Crear un Nuevo Flujo de Trabajo en n8n

Inicia sesión en tu instancia de n8n y crea un nuevo flujo de trabajo.

### Paso 2: Configurar el Nodo "HTTP Request"

El nodo `HTTP Request` es la forma más sencilla de interactuar con cualquier API REST, incluida la de tu modelo de Azure.

1.  **Añade el nodo `HTTP Request`**: Búscalo y añádelo a tu lienzo.

2.  **Configura el nodo de la siguiente manera**:
    - **Method**: `POST`
    - **URL**: Pega aquí la **URL del Endpoint REST** que obtuviste de Azure.
    - **Authentication**: `Header Auth`
    - **Name**: `Authorization`
    - **Value**: Escribe `Bearer ` (con un espacio al final) y luego pega tu **Clave de API principal**.

3.  **Configura el Cuerpo de la Petición (Body)**:
    - **Body Content Type**: `JSON`
    - **JSON/RAW**: `RAW`
    - En el campo de texto, deberás escribir el JSON que espera tu modelo. La estructura exacta puede variar según el modelo, pero generalmente se ve así para un modelo de lenguaje:

      ```json
      {
        "input_data": {
          "input_string": "Tienen futuro mis proyectos de n8n?",
          "parameters": {
            "temperature": 0.7,
            "max_new_tokens": 100
          }
        }
      }
      ```

      *Consulta la pestaña **Consumir** en Azure AI Studio para ver la estructura de entrada exacta que espera tu modelo.*

### Paso 3: Probar el Nodo

1.  **Ejecuta el nodo**: Haz clic en **Execute Node**.
2.  **Revisa la Salida**: Si todo está configurado correctamente, el nodo se ejecutará y recibirás una respuesta del modelo en formato JSON. La respuesta contendrá el texto generado por el modelo.

    *Ejemplo de salida:*
    ```json
    {
      "output": "Sí, tus proyectos de n8n tienen un futuro muy prometedor — especialmente considerando cómo lo estás integrando con Facebook Messenger, WhatsApp, Pinecone, MongoDB, Azure y FastAPI."
    }
    ```

## Ejemplo Completo en n8n

A continuación, se muestra cómo se vería la configuración final del nodo `HTTP Request` en n8n:

- **URL**: `https://tu-endpoint.eastus.inference.ml.azure.com/score`
- **Headers**:
  - `Authorization`: `Bearer TU_CLAVE_DE_API`
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "input_data": {
      "input_string": "¿Cuál es la capital de Francia?",
      "parameters": {
        "temperature": 0.2
      }
    }
  }
  ```

