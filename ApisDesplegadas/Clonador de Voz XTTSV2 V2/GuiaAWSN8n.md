# Guía: Cómo Alojar n8n en una Instancia EC2 de AWS

Esta guía te llevará paso a paso a través del proceso de configurar una instancia EC2 en Amazon Web Services (AWS) para alojar tu propia instancia de n8n.

## Prerrequisitos

- Una cuenta de AWS activa.
- Conocimientos básicos de la consola de AWS.
- Un cliente SSH

---

## Parte 1: Lanzar una Instancia EC2

Primero, crearemos la máquina virtual (servidor) donde se ejecutará n8n.

### Paso 1: Ir al Panel de EC2

1.  Inicia sesión en tu [Consola de AWS](https://aws.amazon.com/console/).
2.  En el buscador de servicios, escribe **EC2** y selecciónalo.

### Paso 2: Lanzar una Nueva Instancia

1.  Haz clic en el botón **"Launch instance" (Lanzar instancia)**.

2.  **Nombre y Etiquetas**:
    - Dale un nombre descriptivo a tu instancia, como `n8n-server`.

3.  **Imagen de Aplicación y SO (AMI)**:
    - Selecciona **Ubuntu**. La versión **Ubuntu Server LTS** es una opción segura y estable.

4.  **Tipo de Instancia**:
    - Para empezar o para cargas de trabajo ligeras, el tipo `t2.micro` o `t3.micro` es suficiente y está incluido en la capa gratuita de AWS.
    - Para un uso en producción con muchos flujos de trabajo, considera un tipo más potente como `t3.medium` o superior.

5.  **Par de Claves (Key Pair)**:
    - Este es un paso **crítico** para acceder a tu servidor.
    - Haz clic en **"Create new key pair" (Crear nuevo par de claves)**.
    - Dale un nombre (p. ej., `n8n-key`) y selecciona el formato `.pem`.
    - Haz clic en **"Create key pair"** y **guarda el archivo `.pem` en un lugar seguro**. Lo necesitarás para conectarte por SSH.

6.  **Configuración de Red (Security Group)**:
    - El grupo de seguridad actúa como un firewall virtual. Necesitamos abrir los puertos para acceder a n8n.
    - Selecciona **"Create security group" (Crear grupo de seguridad)**.
    - Añade las siguientes **reglas de entrada (Inbound rules)**:
        - **SSH** (Puerto 22): En "Source type", elige **My IP** para restringir el acceso SSH solo a tu dirección IP actual.
        - **HTTP** (Puerto 80): Deja el "Source" como **Anywhere** (`0.0.0.0/0`).
        - **HTTPS** (Puerto 443): Deja el "Source" como **Anywhere** (`0.0.0.0/0`).
        - **Custom TCP** (Puerto 5678): Este es el puerto por defecto de n8n. Deja el "Source" como **Anywhere** (`0.0.0.0/0`).

7.  **Configurar Almacenamiento**:
    - El disco de 8 GB por defecto es suficiente para empezar. Puedes aumentarlo si planeas almacenar muchos datos.

8.  **Lanzar la Instancia**:
    - Revisa el resumen y haz clic en **"Launch instance"**.

### Paso 3: Conectarse a la Instancia

1.  Espera a que el estado de la instancia sea **"Running" (En ejecución)**.
2.  Selecciona la instancia y copia su **Dirección IPv4 pública**.
3.  Abre tu terminal y navega hasta donde guardaste tu archivo `.pem`.

4.  **(Solo para macOS/Linux)** Cambia los permisos del archivo de clave:
    ```bash
    chmod 400 tu-clave.pem
    ```

5.  Conéctate usando SSH:
    ```bash
    ssh -i "tu-clave.pem" ubuntu@tu-ip-publica
    ```
    Reemplaza `tu-clave.pem` y `tu-ip-publica` con tus propios valores.

---

## Parte 2: Instalar n8n en la Instancia

La forma más recomendada de instalar n8n es usando Docker y Docker Compose.

### Paso 1: Actualizar el Servidor

Una vez conectado por SSH, actualiza los paquetes del sistema:

```bash
sudo apt update && sudo apt upgrade -y
```

### Paso 2: Instalar Docker y Docker Compose

1.  **Instalar Docker**:
    ```bash
    sudo apt install docker.io -y
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    newgrp docker
    ```

2.  **Instalar Docker Compose**:
    ```bash
    sudo apt install docker-compose -y
    ```

### Paso 3: Crear el Archivo `docker-compose.yml` para n8n

1.  Crea un archivo de configuración para Docker Compose:
    ```bash
    nano docker-compose.yml
    ```

2.  Pega el siguiente contenido en el editor:
    ```yaml
    version: '3.7'

    services:
      n8n:
        image: n8nio/n8n
        restart: always
        ports:
          - "5678:5678"
        volumes:
          - ~/.n8n:/home/node/.n8n
    ```
    *Este archivo le dice a Docker que descargue la imagen de n8n, la reinicie siempre si falla, exponga el puerto 5678 y guarde los datos de n8n en el directorio `~/.n8n` de tu servidor.*

3.  Guarda y cierra el archivo (en `nano`, presiona `Ctrl+X`, luego `Y`, y `Enter`).

### Paso 4: Iniciar n8n

Con el archivo `docker-compose.yml` en tu directorio, ejecuta:

```bash
docker-compose up -d
```

El comando `-d` inicia n8n en segundo plano (detached mode). Docker descargará la imagen de n8n y la iniciará. Puedes verificar que está corriendo con `docker ps`.

---

## Parte 3: Acceder a n8n

¡Ya casi está! Para acceder a tu nueva instancia de n8n:

1.  Abre tu navegador web.
2.  Ve a la siguiente dirección:
    ```
    http://<tu-ip-publica>:5678
    ```
    Reemplaza `<tu-ip-publica>` con la dirección IP pública de tu instancia EC2.

3.  La primera vez que accedas, n8n te pedirá que crees una cuenta de propietario. ¡Configúrala y estarás listo para empezar a automatizar!

#